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

import { Storage } from '../common/ole-doc';
import { settings } from '../common/settings';
import { BiffParser } from './biff-parser';
import { DragPoint } from './dragpoint';
import { GameItem } from './game-item';
import { FLT_MAX, FLT_MIN, Mesh } from './mesh';
import { SplineVertex } from './spline-vertex';
import { Vertex3D, Vertex3DNoTex2 } from './vertex';

export class RubberItem extends GameItem {

	public wzName: string;
	public pdata: number;
	public height: number;
	public hitHeight: number;
	public thickness: number;
	public fHitEvent: boolean;
	public szMaterial: string;
	public timer: TimerDataRoot = new TimerDataRoot();
	public szImage: string;
	public elasticity: number;
	public elasticityFalloff: number;
	public friction: number;
	public scatter: number;
	public fCollidable: boolean;
	public fVisible: boolean;
	public fReflectionEnabled: boolean;
	public staticRendering: boolean;
	public showInEditor: boolean;
	public rotX: number;
	public rotY: number;
	public rotZ: number;
	public szPhysicsMaterial: string;
	public fOverwritePhysics: boolean;
	public dragPoints: DragPoint[];

	private middlePoint: Vertex3D = new Vertex3D();

	public static async fromStorage(storage: Storage, itemName: string): Promise<RubberItem> {
		const rubberItem = new RubberItem();
		await storage.streamFiltered(itemName, 4, RubberItem.createStreamHandler(rubberItem));
		return rubberItem;
	}

	public static from(data: any): RubberItem {
		const rubberItem = new RubberItem();
		Object.assign(rubberItem, data);
		return rubberItem;
	}

	private static createStreamHandler(rubberItem: RubberItem) {
		rubberItem.dragPoints = [];
		return BiffParser.stream(rubberItem.fromTag.bind(rubberItem), {
			nestedTags: {
				DPNT: {
					onStart: () => new DragPoint(),
					onTag: dragPoint => dragPoint.fromTag.bind(dragPoint),
					onEnd: dragPoint => rubberItem.dragPoints.push(dragPoint),
				},
			},
		});
	}

	public getName(): string {
		return this.wzName;
	}

	public serialize(fileId: string) {
		return {
			name: this.wzName,
			mesh: settings.apiExternalUri(`/v1/vp/${fileId}/rubbers/${encodeURI(this.wzName)}.obj`),
			material: this.szMaterial,
		};
	}

	public serializeToObj(tableHeight: number, accuracy: number = 10) {
		const mesh = this.generateMesh(tableHeight, 10, accuracy);
		return mesh.serializeToObj(this.wzName);
	}

	private generateMesh(tableHeight: number, tableDetailLevel: number = 10, acc: number = 10, staticRendering = true): Mesh {

		const mesh = new Mesh();
		const createHitShape = true;
		let accuracy: number;
		if (tableDetailLevel < 5) {
			accuracy = 6;

		} else if (tableDetailLevel >= 5 && tableDetailLevel < 8) {
			accuracy = 8;

		} else {
			accuracy = Math.floor(tableDetailLevel * 1.3); // see also below
		}

		// as solid rubbers are rendered into the static buffer, always use maximum precision
		if (staticRendering) {
			accuracy = Math.floor(10.0 * 1.3); // see also above
		}

		if (acc !== -1) { // hit shapes and UI display have the same, static, precision
			accuracy = acc;
		}

		const sv = SplineVertex.getInstance(this.dragPoints, this.thickness, tableDetailLevel, accuracy);

		const numRings = sv.pcvertex - 1;
		const numSegments = accuracy;

		const numVertices = numRings * numSegments;
		const numIndices = 6 * numVertices; //m_numVertices*2+2;

		const height = this.hitHeight + tableHeight;

		let prevB = new Vertex3D();
		const invNR = 1.0 / numRings;
		const invNS = 1.0 / numSegments;
		let index = 0;
		for (let i = 0; i < numRings; i++) {

			const i2 = (i === numRings - 1) ? 0 : i + 1;

			const tangent = new Vertex3D(sv.pMiddlePoints[i2].x - sv.pMiddlePoints[i].x, sv.pMiddlePoints[i2].y - sv.pMiddlePoints[i].y, 0.0);

			let binorm: Vertex3D;
			let normal: Vertex3D;
			if (i === 0) {
				const up = new Vertex3D(sv.pMiddlePoints[i2].x + sv.pMiddlePoints[i].x, sv.pMiddlePoints[i2].y + sv.pMiddlePoints[i].y, height * 2.0);
				normal = new Vertex3D(tangent.y * up.z, - tangent.x * up.z, tangent.x * up.y - tangent.y * up.x); // = CrossProduct(tangent, up)
				binorm = new Vertex3D(tangent.y * normal.z, - tangent.x * normal.z, tangent.x * normal.y - tangent.y * normal.x); // = CrossProduct(tangent, normal)

			} else {
				normal = prevB.clone().cross(tangent);
				binorm = tangent.clone().cross(normal);
			}
			binorm.normalize();
			normal.normalize();
			prevB = binorm;
			const u = i * invNR;
			for (let j = 0; j < numSegments; j++) {

				const v = (j + u) * invNS;
				const tmp = Vertex3D.getRotatedAxis(j * (360.0 * invNS), tangent, normal).multiplyScalar(this.thickness * 0.5);

				mesh.vertices[index] = new Vertex3DNoTex2();
				mesh.vertices[index].x = sv.pMiddlePoints[i].x + tmp.x;
				mesh.vertices[index].y = sv.pMiddlePoints[i].y + tmp.y;
				if (createHitShape && (j === 0 || j === 3)) { //!! hack, adapt if changing detail level for hitshape
					// for a hit shape create a more rectangle mesh and not a smooth one
					tmp.z *= 0.6;
				}
				mesh.vertices[index].z = height + tmp.z;
				//texel
				mesh.vertices[index].tu = u;
				mesh.vertices[index].tv = v;
				index++;
			}
		}

		// calculate faces
		for (let i = 0; i < numRings; i++) {
			for (let j = 0; j < numSegments; j++) {
				const quad: number[] = [];
				quad[0] = i * numSegments + j;

				if (j !== numSegments - 1) {
					quad[1] = i * numSegments + j + 1;
				} else {
					quad[1] = i * numSegments;
				}

				if (i !== numRings - 1) {
					quad[2] = (i + 1) * numSegments + j;
					if (j !== numSegments - 1) {
						quad[3] = (i + 1) * numSegments + j + 1;
					} else {
						quad[3] = (i + 1) * numSegments;
					}
				} else {
					quad[2] = j;
					if (j !== numSegments - 1) {
						quad[3] = j + 1;
					} else {
						quad[3] = 0;
					}
				}
				mesh.indices[(i * numSegments + j) * 6] = quad[0];
				mesh.indices[(i * numSegments + j) * 6 + 1] = quad[1];
				mesh.indices[(i * numSegments + j) * 6 + 2] = quad[2];
				mesh.indices[(i * numSegments + j) * 6 + 3] = quad[3];
				mesh.indices[(i * numSegments + j) * 6 + 4] = quad[2];
				mesh.indices[(i * numSegments + j) * 6 + 5] = quad[1];
			}
		}

		Mesh.computeNormals(mesh.vertices, numVertices, mesh.indices, numIndices);

		let maxx = FLT_MIN;
		let minx = FLT_MAX;
		let maxy = FLT_MIN;
		let miny = FLT_MAX;
		let maxz = FLT_MIN;
		let minz = FLT_MAX;
		for (let i = 0; i < numVertices; i++) {
			if (maxx < mesh.vertices[i].x) { maxx = mesh.vertices[i].x; }
			if (minx > mesh.vertices[i].x) { minx = mesh.vertices[i].x; }
			if (maxy < mesh.vertices[i].y) { maxy = mesh.vertices[i].y; }
			if (miny > mesh.vertices[i].y) { miny = mesh.vertices[i].y; }
			if (maxz < mesh.vertices[i].z) { maxz = mesh.vertices[i].z; }
			if (minz > mesh.vertices[i].z) { minz = mesh.vertices[i].z; }
		}
		this.middlePoint.x = (maxx + minx) * 0.5;
		this.middlePoint.y = (maxy + miny) * 0.5;
		this.middlePoint.z = (maxz + minz) * 0.5;

		return mesh;
	}

	private async fromTag(buffer: Buffer, tag: string, offset: number, len: number): Promise<void> {
		switch (tag) {
			case 'PIID': this.pdata = this.getInt(buffer); break;
			case 'HTTP': this.height = this.getFloat(buffer); break;
			case 'HTHI': this.hitHeight = this.getFloat(buffer); break;
			case 'WDTP': this.thickness = this.getInt(buffer); break;
			case 'HTEV': this.fHitEvent = this.getBool(buffer); break;
			case 'MATR': this.szMaterial = this.getString(buffer, len); break;
			case 'TMON': this.timer.enabled = this.getBool(buffer); break;
			case 'TMIN': this.timer.interval = this.getInt(buffer); break;
			case 'IMAG': this.szImage = this.getString(buffer, len); break;
			case 'NAME': this.wzName = this.getWideString(buffer, len); break;
			case 'ELAS': this.elasticity = this.getFloat(buffer); break;
			case 'ELFO': this.elasticityFalloff = this.getFloat(buffer); break;
			case 'RFCT': this.friction = this.getFloat(buffer); break;
			case 'RSCT': this.scatter = this.getFloat(buffer); break;
			case 'CLDR': this.fCollidable = this.getBool(buffer); break;
			case 'RVIS': this.fVisible = this.getBool(buffer); break;
			case 'REEN': this.fReflectionEnabled = this.getBool(buffer); break;
			case 'ESTR': this.staticRendering = this.getBool(buffer); break;
			case 'ESIE': this.showInEditor = this.getBool(buffer); break;
			case 'ROTX': this.rotX = this.getFloat(buffer); break;
			case 'ROTY': this.rotY = this.getFloat(buffer); break;
			case 'ROTZ': this.rotZ = this.getFloat(buffer); break;
			case 'MAPH': this.szPhysicsMaterial = this.getString(buffer, len); break;
			case 'OVPH': this.fOverwritePhysics = this.getBool(buffer); break;
			case 'PNTS': break; // never read in vpinball
			default:
				this.getUnknownBlock(buffer, tag);
				break;
		}
	}
}

class TimerDataRoot {
	public interval: number;
	public enabled: boolean;
}