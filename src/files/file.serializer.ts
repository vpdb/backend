import { assign, pick } from 'lodash';
import { quota } from '../common/quota';
import { Context } from '../common/types/context';
import { Serializer, SerializerOptions } from '../common/serializer';
import { File } from './file';
import { Metadata } from './metadata/metadata';

export class FileSerializer extends Serializer<File> {

	protected _reduced(ctx: Context, doc: File, opts: SerializerOptions):File {
		return pick(doc, ['id', 'name', 'bytes', 'mime_type']) as File;
	}

	protected _simple(ctx: Context, doc: File, opts: SerializerOptions):File {
		const file = this._reduced(ctx, doc, opts);
		file.bytes = doc.bytes;
		// FIXME file.variations = storage.urls(doc);
		file.cost = quota.getCost(doc);
		// FIXME file.url = storage.url(doc);
		file.is_protected = !doc.is_active || file.cost > -1;
		file.counter = (doc.counter as any).toObject();
		return file;
	}

	protected _detailed(ctx: Context, doc: File, opts: SerializerOptions):File {
		const file = this._simple(ctx, doc, opts);
		assign(file, pick(doc, ['is_active', 'created_at', 'file_type' ]));

		// metadata
		const metadataReader = Metadata.getReader(doc);
		if (metadataReader && doc.metadata) {
			file.metadata = metadataReader.serializeDetailed(doc.metadata);
		}

		// file variations
		file.variations = {};
		doc.getVariations().forEach(variation => {
			file.variations[variation.name] = doc.variations[variation.name] || {};
			file.variations[variation.name].url = doc.getUrl(variation);
			const cost = quota.getCost(file, variation);
			if (!file.is_active || cost > -1) {
				file.variations[variation.name].is_protected = true;
			}
			if (cost > 0) {
				file.variations[variation.name].cost = cost;
			}
		});
		return file;
	}
}
