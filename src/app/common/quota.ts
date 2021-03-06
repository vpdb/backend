/*
 * VPDB - Virtual Pinball Database
 * Copyright (C) 2019 freezy <freezy@vpdb.io>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { isArray, isObject, isUndefined, sum } from 'lodash';
import { File } from '../files/file';
import { FileDocument } from '../files/file.document';
import { FileVariation } from '../files/file.variations';
import { state } from '../state';
import { UserDocument } from '../users/user.document';
import { ApiError } from './api.error';
import { logger } from './logger';
import { config } from './settings';
import { VpdbPlanCategoryCost, VpdbPlanCost, VpdbQuotaConfig } from './typings/config';
import { Context, RequestState } from './typings/context';

export class Quota {

	private readonly namespace = 'quota';
	private readonly config: VpdbQuotaConfig = config.vpdb.quota;
	private readonly durations: Map<string, number> = new Map();

	/**
	 * Initializes quota plans
	 */
	constructor() {
		this.durations.set('minute', 60000);
		this.durations.set('hour', this.durations.get('minute') * 60);
		this.durations.set('day', this.durations.get('hour') * 24);
		this.durations.set('week', this.durations.get('day') * 7);
		this.durations.set('month', this.durations.get('day') * 31);
	}

	/**
	 * Returns the current rate limits for the given user.
	 *
	 * @param requestState Request state
	 * @param {UserDocument} user User
	 * @return {Promise<UserQuota>} Remaining quota
	 */
	public async get(requestState: RequestState, user: UserDocument): Promise<UserQuota> {
		const plan = user.planConfig;
		/* istanbul ignore if: That's a configuration error. */
		if (!plan) {
			throw new ApiError('Unable to find plan "%s" for user.', user._plan);
		}

		// unlimited?
		if (plan.unlimited === true) {
			return { unlimited: true, limit: 0, period: 0, remaining: 0, reset: 0 };
		}

		const period = this.durations.get(plan.per);
		const key = `${this.namespace}:${user.id}`;
		const now = Date.now();

		const range = await state.redis.zrange(key, 0, now);
		let remaining: number;
		let reset: number;
		if (range.length === 0) {
			remaining = plan.credits;
			reset = period / 1000;
			logger.info(requestState, '[Quota.get] No active period, full credits apply.');
		} else {
			const count = sum(range.map((m: string) => JSON.parse(m).w));
			const oldest = JSON.parse(range[0]).t;
			remaining = count < plan.credits ? plan.credits - count : 0;
			reset = Math.ceil((oldest + period) / 1000);
			logger.info(requestState, '[Quota.get] Active period started %ss ago, %s credits remaining.', (now - oldest) / 1000, remaining);
		}

		return {
			unlimited: false,
			limit: plan.credits,
			period: period / 1000,
			remaining,
			reset,
		};
	}

	/**
	 * Checks if there is enough quota for the given file and consumes the quota.
	 * It also adds the rate limit headers to the request.
	 *
	 * @param {Context} ctx Koa context
	 * @param {FileDocument[]} files File(s) to check for
	 * @throws ApiError If not enough quota is left
	 */
	public async assert(ctx: Context, files: FileDocument | FileDocument[]): Promise<void> {

		if (!isArray(files)) {
			files = [files];
		}

		const plan = ctx.state.user.planConfig;
		/* istanbul ignore if: That would be configuration error. */
		if (!plan) {
			throw new ApiError('No quota defined for plan "%s"', ctx.state.user._plan);
		}

		// allow unlimited plans
		if (plan.unlimited === true) {
			this.setHeader(ctx, { limit: 0, remaining: 0, reset: 0, period: 0, unlimited: true });
			return;
		}
		const totalCost = this.getTotalCost(ctx.state, files);

		// don't even check quota if weight is 0
		if (totalCost === 0) {
			return;
		}

		let userQuota = await this.get(ctx.state, ctx.state.user);
		if (userQuota.remaining < totalCost) {
			this.setHeader(ctx, userQuota);
			throw new ApiError('No more quota left, requested %s of %s available. Try again in %ss.',
				totalCost, userQuota.remaining, userQuota.reset).status(403);
		}

		userQuota = await this.consume(ctx.state, ctx.state.user, totalCost);
		this.setHeader(ctx, userQuota);
	}

	/**
	 * Sets the rate-limit header.
	 *
	 * @param {Context} ctx Koa context
	 * @param {UserQuota} userQuota Current user quota
	 */
	public setHeader(ctx: Context, userQuota: UserQuota) {
		ctx.response.set({
			'X-RateLimit-Limit': String(userQuota.limit),
			'X-RateLimit-Remaining': String(userQuota.remaining),
			'X-RateLimit-Reset': String(userQuota.reset),
			'X-RateLimit-Unlimited': String(!!userQuota.unlimited),
		});
	}

	/**
	 * Sums up the const of a given list of files.
	 * @param requestState For logging
	 * @param {FileDocument[]} files Files to calculate cost for
	 * @return {number} Total cost
	 */
	public getTotalCost(requestState: RequestState, files: FileDocument[]): number {
		let totalCost = 0;
		for (const file of files) {
			const cost = this.getCost(requestState, file);
			// a free file
			if (cost === 0) {
				continue;
			}
			totalCost += cost;
		}
		return totalCost;
	}

	/**
	 * Returns the cost of a given file and variation.
	 *
	 * @param requestState For logging
	 * @param {FileDocument} file Potentially dehydrated File
	 * @param {string|object} [variation] Optional variation
	 * @returns {*}
	 */
	public getCost(requestState: RequestState, file: FileDocument, variation: FileVariation = null): number {

		// if already set, return directly.
		if (!variation && !isUndefined(file.cost)) {
			return file.cost;
		}
		if (variation && file.variations && file.variations[variation.name] && !isUndefined(file.variations[variation.name].cost)) {
			return file.variations[variation.name].cost;
		}

		/* istanbul ignore if: Should not happen if configured correctly */
		if (!file.file_type) {
			logger.error(requestState, require('util').inspect(file));
			throw new ApiError('File object must be populated when retrieving costs.');
		}
		const cost = this.config.costs[file.file_type];

		// undefined file_types are free
		if (isUndefined(cost)) {
			logger.warn(requestState, '[Quota.getCost] Undefined cost for file_type "%s".', file.file_type);
			file.cost = 0;
			return 0;
		}

		// split into objects
		const costObj: VpdbPlanCost = isObject(cost) ? cost as VpdbPlanCost : null;
		const costCategoryObj: VpdbPlanCategoryCost = costObj && isObject(costObj.category) ? costObj.category as VpdbPlanCategoryCost : null;

		// if a variation is demanded and cost contains variation def, ignore the rest.
		if (variation) {
			let variationCost: number;
			// EVERY VARIATION costs n credits. Example: { costs: { backglass: { variation: -1 } } }
			if (costObj) {
				if (!isUndefined(costObj.variation)) {
					variationCost = costObj.variation;
				} else {
					logger.warn(requestState, '[Quota.getCost] No cost defined for %s file of variation %s and no fallback given, returning 0.', file.file_type, variation.name);
					variationCost = 0;
				}
			} else {
				logger.warn(requestState, '[Quota.getCost] No cost defined for %s file of any variation returning default cost %s.', file.file_type, cost);
				variationCost = cost as number;
			}
			// save this for next time
			if (file.variations && file.variations[variation.name]) {
				file.variations[variation.name].cost = costObj.variation;
			}
			return variationCost;
		}

		// EVERY file (incl variation) costs n credits. Example: { costs: { rom: 0 } }
		if (!costObj) {
			file.cost = cost as number;
			return file.cost;
		}
		// ORIGINAL file costs n credits. Example: { costs: { logo: { category: 0 } } }
		if (!costCategoryObj) {
			if (!isUndefined(costObj.category)) {
				file.cost = costObj.category as number;
				return file.cost;

			} else {
				// warn if nothing is set, i.e the 'category' prop isn't defined but the original cost is still an object
				logger.warn(requestState, '[Quota.getCost] No cost defined for %s file (type is undefined).', file.file_type, File.getMimeCategory(file, variation));
				file.cost = 0;
				return 0;
			}
		}
		// ORIGINAL file for a given mime type costs n credits. Example: { costs: { release: { category: { table: 1, '*': 0 } } } }
		const costCategory = costCategoryObj[File.getMimeCategory(file, variation)];
		if (!isUndefined(costCategory)) {
			file.cost = costCategory;
			return costCategory;
		}
		if (!isUndefined(costCategoryObj['*'])) {
			file.cost = costCategoryObj['*'];
			return costCategoryObj['*'];
		}
		logger.warn(requestState, '[Quota.getCost] No cost defined for %s file of type %s and no fallback given, returning 0.', file.file_type, File.getMimeCategory(file, variation));
		file.cost = 0;
		return 0;
	}

	/**
	 * Consumes a quota and returns the user's updated quota config.
	 *
	 * @param requestState For logging
	 * @param {UserDocument} user User to consume quota for
	 * @param {number} weight How much to consume
	 * @return {Promise<UserQuota>} Updated quota after consumption
	 */
	private async consume(requestState: RequestState, user: UserDocument, weight: number): Promise<UserQuota> {
		const plan = user.planConfig;
		/* istanbul ignore if: That's a configuration error. */
		if (!plan) {
			throw new ApiError('Unable to find plan "%s" for user.', user._plan);
		}

		const period = this.durations.get(plan.per);
		const key = `${this.namespace}:${user.id}`;
		const now = Date.now();
		const member = JSON.stringify({ t: now, w: weight });

		const res = await state.redis
			.multi()
			.zadd(key, String(now), member)  // add current
			.zrange(key, 0, -1)   // get all
			.exec();

		const all = res[1][1];
		const count = sum(all.map((m: string) => JSON.parse(m).w));
		let oldest: number;
		if (all.length === 1) {
			await state.redis.pexpire(key, period);
			oldest = now;
			logger.info(requestState, '[Quota.consume] New period starting with %s remaining credits after consuming %s.', plan.credits - count, weight);
		} else {
			oldest = JSON.parse(all[0]).t;
			logger.info(requestState, '[Quota.consume] Existing period updated with %s remaining credits after consuming %s.', plan.credits - count, weight);
		}
		return {
			limit: plan.credits,
			period: period / 1000,
			remaining: count < plan.credits ? plan.credits - count : 0,
			reset: Math.ceil((oldest + period) / 1000),
		};
	}

}

export interface UserQuota {
	/**
	 * True if no quota is applied, false otherwise.
	 */
	unlimited?: boolean;
	/**
	 * Current duration, in seconds
	 */
	period: number;
	/**
	 * Number of total credits during a period
	 */
	limit: number;
	/**
	 * Remaining credits of the current period
	 */
	remaining: number;
	/**
	 * How long until period ends, in seconds.
	 */
	reset: number;
}

export const quota = new Quota();
