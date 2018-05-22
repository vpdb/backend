/*
 * VPDB - Virtual Pinball Database
 * Copyright (C) 2018 freezy <freezy@vpdb.io>
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

import { createWriteStream, createReadStream } from 'fs';

const PngQuant = require('pngquant');
import { sep } from "path";
const OptiPng = require('optipng');

import { Processor } from './processor';
import { File} from '../file';
import { logger } from '../../common/logger';
import { ApiError } from '../../common/api.error';
import { FileVariation } from '../file.variations';
import { ProcessorQueueName } from './processor.queue';

export class ImageOptimizationProcessor extends Processor<FileVariation> {

	name: string = 'image.optimization';

	canProcess(file: File, variation?: FileVariation): boolean {
		const mimeType = variation ? variation.mimeType : file.getMimeType();
		// currently only png files.
		return mimeType === 'image/png';
	}

	getOrder(variation?: FileVariation): number {
		return 500;
	}

	getQueue(): ProcessorQueueName {
		return 'LOW_PRIO_SLOW';
	}

	async process(file: File, src: string, dest: string, variation?: FileVariation): Promise<string> {

		const srcLog = src.split(sep).slice(-3).join('/');
		const destLog = dest.split(sep).slice(-3).join('/');
		if (file.file_type === 'playfield') {
			logger.info('[ImageOptimizationProcessor] Skipping (will process when orientation is set): %s', file.toDetailedString(variation));
			return dest;
		}

		const quanter = new PngQuant([128]);
		const optimizer = new OptiPng(['-o7']);

		return new Promise<string>((resolve, reject) => {

			// create destination stream
			let writeStream = createWriteStream(dest);

			// setup success handler
			writeStream.on('finish', function () {
				logger.debug('[ImageOptimizationProcessor] Done: %s', file.toDetailedString(variation));
				resolve(dest);
			});
			writeStream.on('error', reject);

			// setup error handler
			const handleErr = function (what:string) {
				return function (err:Error) {
					reject(new ApiError(err, 'Error at %s while processing %s', what, file.toString(variation)).log());
				};
			};

			// do the processing
			logger.debug('[ImageOptimizationProcessor] Start: %s from %s to %s', file.toDetailedString(variation), srcLog, destLog);
			createReadStream(src).on('error', handleErr('reading'))
				.pipe(quanter).on('error', handleErr('quanter'))
				.pipe(optimizer).on('error', handleErr('optimizer'))
				.pipe(writeStream).on('error', handleErr('writing'));
		});
	}
}