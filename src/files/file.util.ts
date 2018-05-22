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

import { promisify } from 'util';
import { dirname, resolve } from 'path';
import { createWriteStream, createReadStream, stat, exists, mkdir,  } from 'fs';
import * as Stream from 'stream';

import { state } from '../state';
import { File } from './file';
import { Context } from '../common/types/context';
import { ApiError } from '../common/api.error';
import { logger } from '../common/logger';
import { Metadata } from './metadata/metadata';
import { processorQueue } from './processor/processor.queue';

const statAsync = promisify(stat);
const existsAsync = promisify(exists);
const mkdirAsync = promisify(mkdir);

export class FileUtil {

	private static MODE_0777 = parseInt('0777', 8);

	/**
	 * Creates a new file from a HTTP request stream.
	 *
	 * @param {Context} ctx Koa context
	 * @param {File} fileData File
	 * @param {module:stream.internal} readStream Binary stream of file content
	 * @param opts Options passed to postprocessor
	 * @returns {Promise<File>}
	 */
	public static async create(ctx: Context, fileData: File, readStream: Stream, opts: any): Promise<File> {

		let file = new state.models.File(fileData);
		file = await file.save();
		const path = file.getPath(null, { tmpSuffix: '_original' });

		if (!(await existsAsync(dirname(path)))) {
			await FileUtil.mkdirp(dirname(path));
		}

		await new Promise((resolve, reject) => {
			const writeStream = createWriteStream(path);
			writeStream.on('finish', resolve);
			writeStream.on('error', reject);
			readStream.pipe(writeStream);
		});

		// copy to final destination
		await FileUtil.cp(path, file.getPath());

		// we don't have the file size for multipart uploads before-hand, so get it now
		if (!file.bytes) {
			const stats = await statAsync(file.getPath());
			file.bytes = stats.size;
			await state.models.File.update({ _id: file._id }, { bytes: stats.size });
		}

		// FIXME await storage.preprocess(file);

		try {
			const stats = await statAsync(file.getPath());
			const metadata = await Metadata.readFrom(file, path);
			file.metadata = metadata;
			file.bytes = stats.size;
			await state.models.File.findByIdAndUpdate(file._id, { metadata: metadata, bytes: stats.size }).exec();
			logger.info('[FileUtil.create] File upload of %s successfully completed.', file.toString());

			await processorQueue.processFile(file, path);
			logger.info('[FileUtil.create] File sent to processor queue.');

		} catch (err) {
			try {
				await file.remove();
			} catch (err) {
				/* istanbul ignore next */
				logger.error('[api|file:save] Error removing file: %s', err.message);
			}
			throw new ApiError(err, 'Metadata parsing failed for type "%s": %s', file.mime_type, err.message).warn().status(400);
		}

		return file;
	}

	/**
	 * Create a directory recursively.
	 *
	 * @param {string} path Directory to create
	 * @param {{mode?: number}} opts Optional mode
	 * @return {Promise<string>} Absolute path of created directory
	 */
	static async mkdirp(path: string, opts: { mode?: number } = {}): Promise<string> {
		let mode = opts.mode;
		if (mode === undefined) {
			mode = FileUtil.MODE_0777 & (~process.umask());
		}
		path = resolve(path);
		try {
			await mkdirAsync(path, mode);
			return path;

		} catch (err) {
			switch (err.code) {
				case 'ENOENT':
					await FileUtil.mkdirp(dirname(path), opts);
					return await FileUtil.mkdirp(path, opts);

				default:
					const stat = await statAsync(path);
					if (!stat || !stat.isDirectory()) {
						throw err;
					}
					break;
			}
		}
	}

	/**
	 * Copies a file.
	 * @param {string} source Source
	 * @param {string} target Destination
	 */
	static async cp(source:string, target:string): Promise<void> {
		const rd = createReadStream(source);
		const wr = createWriteStream(target);
		return new Promise<void>(function(resolve, reject) {
			rd.on('error', reject);
			wr.on('error', reject);
			wr.on('finish', resolve);
			rd.pipe(wr);
		}).catch(function(error) {
			rd.destroy();
			wr.end();
			throw error;
		});
	}
}