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

import gm from 'gm';
import { sep } from 'path';
import { createWriteStream } from 'fs';

import { Processor } from './processor';
import { File } from '../file';
import { logger } from '../../common/logger';
import { FileVariation, ImageFileVariation } from '../file.variations';
import { ProcessorQueueName } from './processor.queue';

require('bluebird').promisifyAll(gm.prototype);

export class ImageVariationProcessor extends Processor<ImageFileVariation> {

	name: string = 'image.variation';

	canProcess(file: File, variation?: FileVariation): boolean {
		return !!variation && file.getMimeTypePrimary() === 'image';
	}

	getOrder(variation?: FileVariation): number {
		return 100 + (variation && variation.priority ? variation.priority : 0);
	}

	getQueue(): ProcessorQueueName {
		return 'HI_PRIO_FAST';
	}

	async process(file: File, src: string, dest: string, variation?: ImageFileVariation): Promise<string> {

		const srcLog = src.split(sep).slice(-3).join('/');
		const destLog = dest.split(sep).slice(-3).join('/');
		logger.debug('[ImageVariationProcessor] Start: %s from %s to %s', file.toDetailedString(variation), srcLog, destLog);

		// do the processing
		const img = gm(src);
		img.quality(variation.quality || 70);
		img.interlace('Line');

		if (variation.width && variation.height) {
			img.resize(variation.width, variation.height);
		}

		if (variation.rotate) {
			img.rotate('black', variation.rotate);
		}

		let srcSize, scale;
		if (variation.portraitToSquare) {
			srcSize = file.metadata.size;
			scale = srcSize.height / 1920;
			img.rotate('black', -35);
			img.crop(300 * scale, 300 * scale, 1000 * scale, 1300 * scale);
			if (variation.size) {
				img.resize(variation.size, variation.size);
			}
		}
		if (variation.wideToSquare) {
			srcSize = file.metadata.size;
			scale = srcSize.width / 1920;
			img.rotate('black', -30);
			img.crop(220 * scale, 220 * scale, 1020 * scale, 970 * scale);
			if (variation.size) {
				img.resize(variation.size, variation.size);
			}
		}

		if (variation.landscape && file.metadata.size.width < file.metadata.size.height) {
			img.rotate('black', 90);
		}
		img.setFormat(file.getMimeSubtype(variation));

		logger.debug('[ImageVariationProcessor] Saving: %s to %s', file.toDetailedString(variation), destLog);
		//await (img as any).writeAsync(dest);

		await new Promise<File>((resolve, reject) => {
			const writeStream = createWriteStream(dest);
			// setup success handler
			writeStream.on('finish', function () {
				resolve(file);
			});
			writeStream.on('error', reject);
			img.stream().on('error', reject).pipe(writeStream).on('error', reject);
		});
		logger.debug('[ImageVariationProcessor] Done: %s at %s', file.toDetailedString(variation), destLog);
		return dest;
	}
}