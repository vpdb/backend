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

import { assign, isArray, isEmpty, isObject, map } from 'lodash';
import { Document, GameReferenceDocument, GameReferenceOptions, Model, ModelProperties, Schema } from 'mongoose';

import { GameDocument } from '../../games/game.document';
import { state } from '../../state';
import { ContentAuthor } from '../../users/content.author';
import { UserDocument } from '../../users/user.document';
import { acl } from '../acl';
import { ApiError } from '../api.error';
import { config } from '../settings';
import { Context } from '../typings/context';
import { isCreator } from './util';

const modelResourceMap: { [key: string]: string } = {
	Release: 'releases',
	Backglass: 'backglasses',
	Rom: 'roms',
};
const modelReferenceMap: { [key: string]: string } = {
	Release: 'release',
	Backglass: 'backglass',
	Rom: 'rom',
};

/**
 * A plugin that enables links an entity to a game.
 *
 * Main reason for doing a plugin are the helper methods when filtering.
 *
 * @param schema
 * @param options
 */
export function gameReferencePlugin(schema: Schema, options: GameReferenceOptions = {}) {

	/*
	 * Add fields to entity
	 */
	if (options.isOptional) {
		schema.add({ _game: { type: Schema.Types.ObjectId, ref: 'Game' } });
	} else {
		schema.add({ _game: { type: Schema.Types.ObjectId, required: 'Reference to game must be provided.', ref: 'Game' } });
	}

	/**
	 * Returns the query used for listing only non-restricted entities.
	 *
	 * @param {Application.Context} ctx Koa context
	 * @param {Array<any> | object} query Input query
	 * @return {Promise<Array<any> | object>} Output query
	 */
	schema.statics.applyRestrictions = async function<T>(ctx: Context, query: T): Promise<T> {

		const reference = modelReferenceMap[this.modelName];
		const resource = modelResourceMap[this.modelName];

		/* istanbul ignore if: Only applies when no restrictions are configured */
		if (!config.vpdb.restrictions[reference] || isEmpty(config.vpdb.restrictions[reference].denyMpu)) {
			return query;
		}

		const isModerator = ctx.state.user ? (await acl.isAllowed(ctx.state.user.id, resource, 'view-restricted')) : false;

		// if moderator, don't filter.
		if (isModerator) {
			return query;
		}

		// find restricted games
		const games = await state.models.Game.find({ 'ipdb.mpu': { $in: config.vpdb.restrictions[reference].denyMpu } }).exec();

		if (ctx.state.user) {
			return addToQuery({
				$or: [
					{ _created_by: ctx.state.user._id },
					{ 'authors._user': ctx.state.user._id },
					{ _game: { $nin: map(games, '_id') } },
				],
			}, query);

		} else {
			return addToQuery({ _game: { $nin: games.map(g => g._id) } }, query);
		}
	};

	/**
	 * Returns the query for listing only non-restricted entities for a given game.
	 *
	 * @param {Application.Context} ctx Koa context
	 * @param {GameDocument} game Game to fetch entities for.
	 * @param {Array<any> | object} query Query to append
	 * @return {Promise<Array<any> | object | null>} Updated query on restriction, same without restriction and null if not logged.
	 */
	schema.statics.applyRestrictionsForGame = async function<T>(ctx: Context, game: GameDocument, query: T): Promise<T | null> {

		const reference = modelReferenceMap[this.modelName];
		const resource = modelResourceMap[this.modelName];

		// if not restricted, return same query (no filter)
		if (!game.isRestricted(reference)) {
			return query;
		}

		// if restricted by not logged, return null (no results)
		if (!ctx.state.user) {
			return null;
		}

		// now we have a user, check if either moderator or owner
		const canViewRestricted = await acl.isAllowed(ctx.state.user.id, resource, 'view-restricted');
		// if moderator, return same query (no filter)
		if (canViewRestricted) {
			return query;
		}

		// if no moderator, only returned owned or authored entities
		return addToQuery({ $or: [{ _created_by: ctx.state.user._id }, { 'authors._user': ctx.state.user._id }] }, query);
	};

	/**
	 * Makes sure an API request can access the entity.
	 *
	 * @param {Application.Context} ctx Koa context
	 * @returns {Promise<GameReferenceDocument>} This entity
	 * @throws {ApiError} When access is denied
	 */
	schema.methods.assertRestrictedView = async function(this: GameReferenceDocument, ctx: Context): Promise<GameReferenceDocument> {

		const game = this._game as GameDocument;
		const modelName = (this.constructor as any).modelName;
		const reference = modelReferenceMap[modelName];
		const resource = modelResourceMap[modelName];

		// if not restricted, has access
		if (!game.isRestricted(reference)) {
			return this;
		}

		// if restricted by not logged, no access.
		if (!ctx.state.user) {
			throw new ApiError('No such %s with ID "%s"', reference, ctx.params.id).status(404);
		}

		// now we have a user, check if either moderator or owner
		const isModerator = await acl.isAllowed(ctx.state.user.id, resource, 'view-restricted');

		// if moderator, has access
		if (isModerator) {
			return this;
		}

		// if no moderator, must be owner or author
		if (!isCreator(ctx, this)) {
			throw new ApiError('No such %s with ID "%s"', reference, ctx.params.id).status(404);
		}
		return this;
	};
}

/**
 * Adds a new condition to an existing query.
 *
 * The existing query can be an object, in which case the new condition ends
 * up as a new property, or an array, in which case it is added to the
 * array. Otherwise, just the condition is returned.
 *
 * @param {object} toAdd Query to add
 * @param {Array<any> | object} query Original query
 * @return {Array<any> | object} Merged query
 */
function addToQuery<T>(toAdd: object, query: T): T {
	if (isArray(query)) {
		query.push(toAdd);
		return query;
	}
	if (isObject(query)) {
		return assign(query, toAdd);
	}
	/* istanbul ignore next: Don't screw up when getting weird query objects, but that hasn't happened. */
	return query;
}

declare module 'mongoose' {

	// methods
	export interface GameReferenceDocument extends Document {
		/**
		 * Game reference or populated object
		 */
		_game?: GameDocument | Types.ObjectId;

		/**
		 * Serialized game
		 */
		game?: GameDocument;

		// hack, those two we just assume are there.
		_created_by?: UserDocument | Types.ObjectId;
		authors?: ContentAuthor[];

		/**
		 * Makes sure an API request can access the entity.
		 *
		 * @param {Application.Context} ctx Koa context
		 * @returns {Promise<GameReferenceDocument>} This entity
		 * @throws {ApiError} When access is denied
		 */
		assertRestrictedView(ctx: Context): Promise<this>;
	}

	// statics
	export interface GameReferenceModel<T extends GameReferenceDocument> extends Model<T> {

		/**
		 * Returns the query used for listing only non-restricted entities.
		 *
		 * @param {Application.Context} ctx Koa context
		 * @param {T} query Input query
		 * @return {Promise<T>} Output query
		 */
		applyRestrictions<T>(this: ModelProperties, ctx: Context, query: T): Promise<T>;

		/**
		 * Returns the query for listing only non-restricted entities for a given game.
		 *
		 * @param {Application.Context} ctx Koa context
		 * @param {GameDocument} game Game to fetch entities for.
		 * @param {T} query Query to append
		 * @return {Promise<T | null>} Updated query on restriction, same without restriction and null if not logged.
		 */
		applyRestrictionsForGame<T>(ctx: Context, game: GameDocument, query: T): Promise<T | null>;
	}

	// options
	export interface GameReferenceOptions {
		isOptional?: boolean;
	}
}
