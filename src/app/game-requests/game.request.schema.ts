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

import { Schema } from 'mongoose';

const shortId = require('shortid32');

//-----------------------------------------------------------------------------
// SCHEMA
//-----------------------------------------------------------------------------

const gameRequestFields = {
	id:          { type: String, required: true, unique: true, default: shortId.generate },
	title:       { type: String },
	notes:       { type: String },
	ipdb_number: { type: Number, required: 'At least the IPDB number must be supplied.' },
	ipdb_title:  { type: String, required: 'Must be fetched from IPDB' },
	is_closed:   { type: Boolean, required: true, default: false },
	message:     { type: String }, // moderator feedback sent to user
	_game:       { type: Schema.Types.ObjectId, ref: 'Game' },
	_created_by: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
	created_at:  { type: Date, required: true },
};
export const gameRequestSchema = new Schema(gameRequestFields, { toObject: { virtuals: true, versionKey: false } });
