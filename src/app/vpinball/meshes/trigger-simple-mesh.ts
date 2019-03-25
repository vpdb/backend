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

import { Mesh } from '../mesh';

const vertices = [
	[1.283477, -22.522591, 33.562248, 0.999100, -0.036100, 0.019600, 0.166667, 0.625000],
	[1.283433, -45.411259, -29.149363, 0.992900, -0.111800, 0.040700, 0.166667, 1.000000],
	[0.641675, -44.323971, -29.149363, 0.846900, 0.499500, -0.182300, 0.000000, 1.000000],
	[0.641719, -21.539425, 33.071007, 0.859200, 0.464300, -0.214900, 0.000000, 0.625000],
	[0.641719, -21.539425, 33.071007, 0.000000, 0.915800, -0.401600, 1.000000, 0.625000],
	[0.641675, -44.323971, -29.149363, 0.000000, 0.939000, -0.343900, 1.000000, 1.000000],
	[-0.641845, -44.323971, -29.149363, -0.525300, 0.799000, -0.292600, 0.833333, 1.000000],
	[-0.641801, -21.539421, 33.071007, -0.506200, 0.790100, -0.345700, 0.833333, 0.625000],
	[-1.283607, -45.411251, -29.149363, -0.992900, -0.112000, 0.040600, 0.666667, 1.000000],
	[-1.283563, -22.522587, 33.562248, -0.999400, -0.029700, 0.018800, 0.666667, 0.625000],
	[-0.641849, -46.498501, -29.149363, -0.432100, -0.847200, 0.309000, 0.500000, 1.000000],
	[-0.641805, -23.453789, 34.053566, -0.474400, -0.792400, 0.383500, 0.500000, 0.625000],
	[0.641671, -46.498501, -29.149363, 0.432000, -0.847300, 0.308900, 0.333333, 1.000000],
	[0.641715, -23.453793, 34.053566, 0.476200, -0.790200, 0.385700, 0.333333, 0.625000],
	[1.283480, -20.826500, 36.450806, 0.992000, -0.092900, 0.085400, 0.166667, 0.609375],
	[0.641721, -20.304619, 35.469326, 0.856800, 0.356400, -0.372700, 0.000000, 0.609375],
	[0.641721, -20.304619, 35.469326, 0.000000, 0.646300, -0.763100, 1.000000, 0.609375],
	[-0.641799, -20.304615, 35.469326, -0.559600, 0.543100, -0.626000, 0.833333, 0.609375],
	[-1.283560, -20.826496, 36.450806, -0.992900, -0.086600, 0.080900, 0.666667, 0.609375],
	[-0.641801, -21.348299, 37.432205, -0.454500, -0.536000, 0.711400, 0.500000, 0.609375],
	[0.641719, -21.348303, 37.432205, 0.456500, -0.536500, 0.709700, 0.333333, 0.609375],
	[1.283486, -17.512125, 37.473286, 0.993900, 0.011200, 0.109300, 0.166667, 0.593750],
	[0.641726, -17.512125, 36.364166, 0.865200, -0.025300, -0.500700, 0.000000, 0.593750],
	[0.641726, -17.512125, 36.364166, -0.000000, -0.039700, -0.999200, 1.000000, 0.593750],
	[-0.641794, -17.512121, 36.364166, -0.554100, -0.038100, -0.831600, 0.833333, 0.593750],
	[-1.283554, -17.512121, 37.473286, -0.994100, 0.011900, 0.107900, 0.666667, 0.593750],
	[-0.641794, -17.512121, 38.582485, -0.458300, 0.041900, 0.887800, 0.500000, 0.593750],
	[0.641726, -17.512125, 38.582485, 0.458800, 0.041200, 0.887500, 0.333333, 0.593750],
	[1.283604, 43.833565, 12.250843, 0.996600, 0.049200, 0.065100, 0.166667, 0.203125],
	[0.641843, 43.189926, 11.446362, 0.851400, -0.332400, -0.405700, 0.000000, 0.203125],
	[0.641843, 43.189926, 11.446362, -0.000000, -0.642100, -0.766600, 1.000000, 0.203125],
	[-0.641677, 43.189926, 11.446362, -0.530000, -0.545800, -0.649000, 0.833333, 0.203125],
	[-1.283436, 43.833572, 12.250843, -0.996500, 0.048200, 0.068500, 0.666667, 0.203125],
	[-0.641674, 44.569851, 13.067883, -0.461700, 0.561100, 0.687000, 0.500000, 0.203125],
	[0.641846, 44.569851, 13.067883, 0.461900, 0.561200, 0.686700, 0.333333, 0.203125],
	[1.283607, 45.430134, 9.907923, 0.994200, 0.104000, 0.025400, 0.166667, 0.187500],
	[0.641845, 44.361649, 9.601603, 0.865800, -0.487900, -0.111200, 0.000000, 0.187500],
	[0.641845, 44.361649, 9.601603, 0.000000, -0.972700, -0.232100, 1.000000, 0.187500],
	[-0.641675, 44.361649, 9.601603, -0.548200, -0.813100, -0.195500, 0.833333, 0.187500],
	[-1.283433, 45.430141, 9.907923, -0.994000, 0.106800, 0.023200, 0.666667, 0.187500],
	[-0.641671, 46.498501, 10.214362, -0.458400, 0.860900, 0.220600, 0.500000, 0.187500],
	[0.641849, 46.498501, 10.214362, 0.458500, 0.860700, 0.221000, 0.333333, 0.187500],
	[1.283600, 41.665836, -29.149363, 0.999500, -0.031300, 0.003400, 0.166667, 0.000000],
	[0.641838, 40.578590, -29.149363, 0.860100, -0.507700, 0.049600, 0.000000, 0.000000],
	[0.641838, 40.578590, -29.149363, 0.000000, -0.995300, 0.097200, 1.000000, 0.000000],
	[-0.641682, 40.578590, -29.149363, -0.481100, -0.872500, 0.084800, 0.833333, 0.000000],
	[-1.283440, 41.665844, -29.149363, -0.999500, -0.030900, 0.003300, 0.666667, 0.000000],
	[-0.641678, 42.753124, -29.149363, -0.507500, 0.857800, -0.081600, 0.500000, 0.000000],
	[0.641842, 42.753124, -29.149363, 0.507300, 0.857900, -0.082000, 0.333333, 0.000000],
];

const indexes = [
	4, 5, 6,
	6, 7, 4,
	7, 6, 8,
	16, 4, 7,
	8, 9, 7,
	9, 8, 10,
	7, 17, 16,
	17, 7, 9,
	23, 16, 17,
	10, 11, 9,
	11, 10, 12,
	9, 18, 17,
	18, 9, 11,
	17, 24, 23,
	24, 17, 18,
	30, 23, 24,
	12, 13, 11,
	13, 12, 1,
	24, 31, 30,
	37, 30, 31,
	18, 25, 24,
	31, 24, 25,
	11, 19, 18,
	25, 18, 19,
	19, 11, 13,
	31, 38, 37,
	44, 37, 38,
	38, 45, 44,
	25, 32, 31,
	38, 31, 32,
	45, 38, 39,
	32, 39, 38,
	39, 46, 45,
	32, 25, 26,
	19, 26, 25,
	39, 32, 33,
	26, 33, 32,
	46, 39, 40,
	33, 40, 39,
	40, 47, 46,
	26, 19, 20,
	13, 20, 19,
	47, 40, 41,
	41, 48, 47,
	40, 33, 34,
	34, 41, 40,
	33, 26, 27,
	27, 34, 33,
	20, 27, 26,
	48, 41, 35,
	35, 42, 48,
	36, 43, 42,
	42, 35, 36,
	29, 36, 35,
	28, 35, 41,
	35, 28, 29,
	41, 34, 28,
	22, 29, 28,
	21, 28, 34,
	28, 21, 22,
	34, 27, 21,
	15, 22, 21,
	14, 21, 27,
	21, 14, 15,
	27, 20, 14,
	3, 15, 14,
	0, 14, 20,
	14, 0, 3,
	20, 13, 0,
	0, 2, 3,
	1, 0, 13,
	0, 1, 2,
];

export const triggerSimpleMesh = Mesh.fromArray(vertices, indexes);