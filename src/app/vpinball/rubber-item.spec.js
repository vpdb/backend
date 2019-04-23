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

const ApiClient = require('../../test/api.client');
const ThreeHelper = require('../../test/three.helper');

const api = new ApiClient();
const three = new ThreeHelper(api);

describe.only('The VPinball rubber generator', () => {

	before(async () => {
		await api.setupUsers({
			member: { roles: ['member'] },
		});
	});

	after(async () => {
		await api.teardown();
	});

	it('should generate a rubber mesh', async () => {
		const vpxFile = await api.fileHelper.createVpx('member', 'table-rubber.vpx');
		const gltf = await three.loadGlb('member', vpxFile.variations.gltf);
		const rubberMesh = three.find(gltf, 'rubbers', 'rubber-Rubber2');
		const rubberMeshVertices = rubberMesh.geometry.attributes.position;
		const expectedVertices = [
			[474.438477, 450.783447, -21.006498],
			[474.491211, 448.756836, -21.427572],
			[474.531403, 447.212219, -22.805874],
			[474.548309, 446.563446, -24.772091],
			[474.537354, 446.984375, -26.799377],
			[474.501495, 448.362213, -28.344521],
			[474.450317, 450.327759, -28.993502],
			[474.397583, 452.354370, -28.572428],
			[474.357391, 453.898987, -27.194126],
			[474.340485, 454.547760, -25.227909],
			[474.351440, 454.126831, -23.200624],
			[474.387299, 452.748993, -21.655481],
			[472.010193, 450.720215, -21.007118],
			[471.461121, 448.767517, -21.422794],
			[471.041870, 447.276550, -22.796982],
			[470.864807, 446.646759, -24.761463],
			[470.977325, 447.046906, -26.789864],
			[471.349274, 448.369781, -28.338669],
			[471.881042, 450.260925, -28.992882],
			[472.430115, 452.213623, -28.577206],
			[472.849365, 453.704590, -27.203018],
			[473.026428, 454.334381, -25.238537],
			[472.913910, 453.934235, -23.210138],
			[472.541962, 452.611359, -21.661331],
			[468.971710, 451.574554, -21.007492],
			[467.999908, 449.793396, -21.420036],
			[467.257080, 448.431915, -22.791828],
			[466.942291, 447.854950, -24.755299],
			[467.139862, 448.217102, -26.784336],
			[467.796906, 449.421326, -28.335262],
			[468.737335, 451.144928, -28.992508],
			[469.709137, 452.926086, -28.579964],
			[470.451965, 454.287567, -27.208172],
			[470.766754, 454.864532, -25.244701],
			[470.569183, 454.502380, -23.215664],
			[469.912140, 453.298157, -21.664738],
			[461.481384, 455.661346, -21.007666],
			[460.252380, 454.046509, -21.418781],
			[459.312531, 452.811584, -22.789482],
			[458.913635, 452.287476, -24.752491],
			[459.162628, 452.614624, -26.781818],
			[459.992737, 453.705353, -28.333708],
			[461.181580, 455.267426, -28.992334],
			[462.410583, 456.882263, -28.581219],
			[463.350433, 458.117188, -27.210518],
			[463.749329, 458.641296, -25.247509],
			[463.500336, 458.314148, -23.218184],
			[462.670227, 457.223419, -21.666292],
			[452.916046, 462.180084, -21.007732],
			[451.540344, 460.688080, -21.418289],
			[450.488098, 459.546906, -22.788563],
			[450.041260, 459.062317, -24.751389],
			[450.319550, 459.364136, -26.780830],
			[451.248444, 460.371521, -28.333099],
			[452.579010, 461.814545, -28.992268],
			[453.954712, 463.306549, -28.581711],
			[455.006958, 464.447723, -27.211437],
			[455.453796, 464.932312, -25.248611],
			[455.175507, 464.630493, -23.219170],
			[454.246613, 463.623108, -21.666901],
			[444.158356, 470.255249, -21.007784],
			[442.666290, 468.879486, -21.417927],
			[441.524902, 467.827057, -22.787882],
			[441.040009, 467.379944, -24.750574],
			[441.341522, 467.657959, -26.780098],
			[442.348694, 468.586639, -28.332647],
			[443.791595, 469.917114, -28.992216],
			[445.283661, 471.292877, -28.582073],
			[446.425049, 472.345306, -27.212116],
			[446.909943, 472.792419, -25.249426],
			[446.608429, 472.514404, -23.219902],
			[445.601257, 471.585724, -21.667355],
			[436.085480, 479.010468, -21.007854],
			[434.470367, 477.781281, -21.417433],
			[433.234619, 476.840790, -22.786957],
			[432.709351, 476.441010, -24.749464],
			[433.035278, 476.689056, -26.779102],
			[434.125061, 477.518463, -28.332031],
			[435.686737, 478.707001, -28.992146],
			[437.301849, 479.936188, -28.582567],
			[438.537598, 480.876678, -27.213043],
			[439.062866, 481.276459, -25.250536],
			[438.736938, 481.028412, -23.220898],
			[437.647156, 480.199005, -21.667969],
			[429.575623, 487.564056, -21.008036],
			[427.793671, 486.591797, -21.416151],
			[426.429596, 485.847565, -22.784557],
			[425.848877, 485.530701, -24.746590],
			[426.207153, 485.726166, -26.776522],
			[427.408386, 486.381592, -28.330437],
			[429.130737, 487.321320, -28.991964],
			[430.912689, 488.293579, -28.583849],
			[432.276764, 489.037811, -27.215443],
			[432.857483, 489.354675, -25.253410],
			[432.499207, 489.159210, -23.223478],
			[431.297974, 488.503784, -21.669563],
			[425.498779, 495.036102, -21.008457],
			[423.544006, 494.486450, -21.413242],
			[422.045929, 494.065247, -22.779099],
			[421.406006, 493.885315, -24.740042],
			[421.795685, 493.994873, -26.770641],
			[423.110535, 494.364563, -28.326799],
			[424.998291, 494.895355, -28.991543],
			[426.953064, 495.445007, -28.586758],
			[428.451141, 495.866211, -27.220901],
			[429.091064, 496.046143, -25.259958],
			[428.701385, 495.936584, -23.229359],
			[427.386536, 495.566895, -21.673201],
			[424.651367, 498.049744, -21.009262],
			[422.620239, 498.102600, -21.407888],
			[421.060455, 498.143158, -22.769016],
			[420.390015, 498.160614, -24.727934],
			[420.788483, 498.150238, -26.759752],
			[422.149170, 498.114838, -28.320047],
			[424.107422, 498.063904, -28.990738],
			[426.138550, 498.011047, -28.592112],
			[427.698334, 497.970490, -27.230984],
			[428.368774, 497.953033, -25.272066],
			[427.970306, 497.963409, -23.240248],
			[426.609619, 497.998810, -21.679955],
			[424.712677, 500.412292, -21.011581],
			[422.917786, 501.371185, -21.393848],
			[421.531982, 502.111572, -22.742382],
			[420.926544, 502.435028, -24.695843],
			[421.263702, 502.254883, -26.730803],
			[422.453125, 501.619446, -28.301994],
			[424.176117, 500.698914, -28.988419],
			[425.971008, 499.740021, -28.606152],
			[427.356812, 498.999634, -27.257616],
			[427.962250, 498.676178, -25.304157],
			[427.625092, 498.856323, -23.269197],
			[426.435669, 499.491760, -21.698006],
			[425.859406, 502.558929, -21.012701],
			[424.430359, 504.009583, -21.387644],
			[423.324310, 505.132324, -22.730515],
			[422.837677, 505.626343, -24.681494],
			[423.100800, 505.359222, -26.717815],
			[424.043213, 504.402588, -28.293848],
			[425.412384, 503.012726, -28.987299],
			[426.841431, 501.562073, -28.612356],
			[427.947479, 500.439331, -27.269484],
			[428.434113, 499.945313, -25.318506],
			[428.170990, 500.212433, -23.282187],
			[427.228577, 501.169067, -21.706152],
			[428.132721, 504.798492, -21.013361],
			[427.062378, 506.531708, -21.384136],
			[426.232849, 507.874969, -22.723782],
			[425.866394, 508.468384, -24.673336],
			[426.061188, 508.152924, -26.710419],
			[426.765076, 507.013092, -28.289198],
			[427.789459, 505.354340, -28.986639],
			[428.859802, 503.621124, -28.615862],
			[429.689331, 502.277863, -27.276218],
			[430.055786, 501.684448, -25.326664],
			[429.860992, 501.999908, -23.289581],
			[429.157104, 503.139740, -21.710802],
			[435.529724, 509.366516, -21.013662],
			[434.729309, 511.240143, -21.382568],
			[434.108582, 512.693115, -22.720762],
			[433.833893, 513.336121, -24.669676],
			[433.978821, 512.996887, -26.707100],
			[434.504547, 511.766266, -28.287107],
			[435.270203, 509.974060, -28.986338],
			[436.070618, 508.100433, -28.617432],
			[436.691345, 506.647461, -27.279238],
			[436.966034, 506.004456, -25.330324],
			[436.821106, 506.343689, -23.292900],
			[436.295380, 507.574310, -21.712893],
			[445.637512, 513.684631, -21.013781],
			[445.014221, 515.624512, -21.381962],
			[444.530731, 517.129272, -22.719593],
			[444.316620, 517.795593, -24.668257],
			[444.429260, 517.445068, -26.705812],
			[444.838440, 516.171570, -28.286297],
			[445.434570, 514.316345, -28.986219],
			[446.057861, 512.376465, -28.618038],
			[446.541351, 510.871735, -27.280407],
			[446.755463, 510.205353, -25.331743],
			[446.642822, 510.555878, -23.294188],
			[446.233643, 511.829407, -21.713705],
			[457.220642, 517.406433, -21.013868],
			[456.753448, 519.389771, -21.381514],
			[456.390991, 520.928528, -22.718731],
			[456.230377, 521.610291, -24.667212],
			[456.314667, 521.252441, -26.704865],
			[456.621277, 519.950867, -28.285698],
			[457.068054, 518.054260, -28.986132],
			[457.535248, 516.070923, -28.618486],
			[457.897705, 514.532166, -27.281269],
			[458.058319, 513.850403, -25.332788],
			[457.974030, 514.208252, -23.295137],
			[457.667419, 515.509827, -21.714302],
			[469.046051, 520.192078, -21.013987],
			[468.764282, 522.210266, -21.380905],
			[468.545593, 523.776367, -22.717560],
			[468.448639, 524.470764, -24.665791],
			[468.499390, 524.107422, -26.703571],
			[468.684235, 522.783569, -28.284883],
			[468.953644, 520.854065, -28.986013],
			[469.235413, 518.835876, -28.619095],
			[469.454102, 517.269775, -27.282440],
			[469.551056, 516.575378, -25.334211],
			[469.500305, 516.938721, -23.296429],
			[469.315460, 518.262573, -21.715117],
			[479.874023, 521.703918, -21.014301],
			[479.895569, 523.741943, -21.379313],
			[479.912292, 525.324402, -22.714483],
			[479.919739, 526.027344, -24.662056],
			[479.915894, 525.662354, -26.700182],
			[479.901764, 524.327271, -28.282743],
			[479.881165, 522.379822, -28.985699],
			[479.859619, 520.341797, -28.620687],
			[479.842896, 518.759338, -27.285517],
			[479.835449, 518.056396, -25.337944],
			[479.839294, 518.421387, -23.299818],
			[479.853424, 519.756470, -21.717257],
			[488.471222, 521.613098, -21.015055],
			[488.949554, 523.595093, -21.375580],
			[489.321533, 525.136353, -22.707264],
			[489.487457, 525.823853, -24.653286],
			[489.402863, 525.473389, -26.692209],
			[489.090454, 524.178894, -28.277706],
			[488.633881, 522.287170, -28.984945],
			[488.155548, 520.305176, -28.624420],
			[487.783569, 518.763916, -27.292736],
			[487.617645, 518.076416, -25.346716],
			[487.702240, 518.426880, -23.307793],
			[488.014648, 519.721375, -21.722294],
			[491.492645, 520.884033, -21.016569],
			[492.550232, 522.629028, -21.368395],
			[493.374939, 523.989746, -22.693306],
			[493.745789, 524.601685, -24.636295],
			[493.563446, 524.300781, -26.676737],
			[492.876740, 523.167725, -28.267899],
			[491.869659, 521.506104, -28.983431],
			[490.812073, 519.761108, -28.631605],
			[489.987366, 518.400391, -27.306692],
			[489.616516, 517.788452, -25.363705],
			[489.798859, 518.089355, -23.323263],
			[490.485565, 519.222412, -21.732101],
			[493.449341, 519.698608, -21.021048],
			[495.197693, 520.758240, -21.349224],
			[496.571472, 521.590820, -22.655621],
			[497.202606, 521.973328, -24.590193],
			[496.921936, 521.803223, -26.634573],
			[495.804718, 521.126099, -28.240971],
			[494.150269, 520.123413, -28.978952],
			[492.401917, 519.063782, -28.650776],
			[491.028137, 518.231201, -27.344379],
			[490.397003, 517.848694, -25.409807],
			[490.677673, 518.018799, -23.365427],
			[491.794891, 518.695923, -21.759031],
			[494.665985, 517.691589, -21.023159],
			[496.654877, 518.171631, -21.341045],
			[498.222809, 518.550049, -22.639343],
			[498.949646, 518.725464, -24.570179],
			[498.640625, 518.650879, -26.616184],
			[497.378571, 518.346252, -28.229134],
			[495.501617, 517.893250, -28.976841],
			[493.512726, 517.413208, -28.658955],
			[491.944794, 517.034790, -27.360657],
			[491.217957, 516.859375, -25.429821],
			[491.526978, 516.933960, -23.383816],
			[492.789032, 517.238586, -21.770866],
			[495.398010, 514.659180, -21.024376],
			[497.444763, 514.680786, -21.336546],
			[499.061249, 514.697876, -22.630335],
			[499.814301, 514.705872, -24.559072],
			[499.502136, 514.702576, -26.605959],
			[498.208435, 514.688904, -28.222527],
			[496.279785, 514.668457, -28.975624],
			[494.233032, 514.646851, -28.663454],
			[492.616547, 514.629761, -27.369665],
			[491.863495, 514.621765, -25.440928],
			[492.175659, 514.625061, -23.394043],
			[493.469360, 514.638733, -21.777473],
			[495.489136, 506.050476, -21.024923],
			[497.516724, 505.767365, -21.334568],
			[499.119324, 505.543610, -22.626364],
			[499.867554, 505.439148, -24.554174],
			[499.560883, 505.481964, -26.601442],
			[498.281494, 505.660583, -28.219604],
			[496.372192, 505.927185, -28.975077],
			[494.344604, 506.210297, -28.665432],
			[492.742004, 506.434052, -27.373634],
			[491.993774, 506.538513, -25.445826],
			[492.300446, 506.495697, -23.398560],
			[493.579834, 506.317078, -21.780396],
			[493.976044, 495.213745, -21.025135],
			[495.968903, 494.744293, -21.333805],
			[497.544556, 494.373138, -22.624830],
			[498.280792, 494.199707, -24.552279],
			[497.980347, 494.270477, -26.599693],
			[496.723724, 494.566498, -28.218472],
			[494.847626, 495.008423, -28.974865],
			[492.854767, 495.477875, -28.666195],
			[491.279114, 495.849030, -27.375170],
			[490.542877, 496.022461, -25.447721],
			[490.843323, 495.951691, -23.400307],
			[492.099945, 495.655670, -21.781528],
			[491.191559, 483.392944, -21.025293],
			[493.140930, 482.766602, -21.333242],
			[494.682526, 482.271271, -22.623695],
			[495.403320, 482.039673, -24.550877],
			[495.110138, 482.133881, -26.598400],
			[493.881531, 482.528625, -28.217634],
			[492.046722, 483.118164, -28.974707],
			[490.097351, 483.744507, -28.666758],
			[488.555756, 484.239838, -27.376305],
			[487.834961, 484.471436, -25.449123],
			[488.128143, 484.377228, -23.401600],
			[489.356750, 483.982483, -21.782366],
			[487.474548, 471.824432, -21.025511],
			[489.357574, 471.019989, -21.332470],
			[490.847198, 470.383636, -22.622143],
			[491.544250, 470.085846, -24.548958],
			[491.261963, 470.206421, -26.596630],
			[490.075989, 470.713074, -28.216488],
			[488.304077, 471.470062, -28.974489],
			[486.421051, 472.274506, -28.667530],
			[484.931427, 472.910858, -27.377857],
			[484.234375, 473.208649, -25.451042],
			[484.516663, 473.088074, -23.403370],
			[485.702637, 472.581421, -21.783512],
			[483.171082, 461.750763, -21.026085],
			[484.913635, 460.674652, -21.330456],
			[486.293243, 459.822662, -22.618080],
			[486.940277, 459.423126, -24.543938],
			[486.681305, 459.583038, -26.591995],
			[485.585724, 460.259613, -28.213480],
			[483.947144, 461.271515, -28.973915],
			[482.204590, 462.347626, -28.669544],
			[480.824982, 463.199615, -27.381920],
			[480.177948, 463.599152, -25.456062],
			[480.436920, 463.439240, -23.408005],
			[481.532501, 462.762665, -21.786520],
			[478.632080, 454.400421, -21.027431],
			[480.091736, 452.962524, -21.325825],
			[481.249542, 451.821960, -22.608709],
			[481.795258, 451.284363, -24.532339],
			[481.582703, 451.493774, -26.581276],
			[480.668793, 452.394073, -28.206512],
			[479.298401, 453.744049, -28.972569],
			[477.838745, 455.181946, -28.674175],
			[476.680939, 456.322510, -27.391291],
			[476.135223, 456.860107, -25.467661],
			[476.347778, 456.650696, -23.418724],
			[477.261688, 455.750397, -21.793488],
			[476.444000, 452.178833, -21.030069],
			[477.410217, 450.370178, -21.317167],
			[478.179321, 448.930450, -22.591076],
			[478.545258, 448.245422, -24.510456],
			[478.410004, 448.498657, -26.561007],
			[477.809753, 449.622284, -28.193287],
			[476.905365, 451.315247, -28.969931],
			[475.939148, 453.123901, -28.682833],
			[475.170044, 454.563629, -27.408924],
			[474.804108, 455.248657, -25.489544],
			[474.939362, 454.995422, -23.438993],
			[475.539612, 453.871796, -21.806713]
		];
		three.expectVerticesInArray(expectedVertices, rubberMeshVertices.array);
	});

	it('should generate a rotated rubber mesh', async () => {
		const vpxFile = await api.fileHelper.createVpx('member', 'table-rubber.vpx');
		const gltf = await three.loadGlb('member', vpxFile.variations.gltf);
		const rubberMesh = three.find(gltf, 'rubbers', 'rubber-Rubber1');
		const rubberMeshVertices = rubberMesh.geometry.attributes.position;
		const expectedVertices = [
			[504.430420, 1035.444336, 61.705627],
			[504.984924, 1034.807373, 63.596069],
			[506.427063, 1034.081787, 64.892517],
			[508.370514, 1033.461914, 65.247498],
			[510.294464, 1033.114014, 64.565979],
			[511.683411, 1033.131104, 63.030457],
			[512.165161, 1033.508789, 61.052551],
			[511.610687, 1034.145752, 59.161987],
			[510.168518, 1034.871338, 57.865540],
			[508.225098, 1035.491211, 57.510559],
			[506.301147, 1035.839233, 58.192200],
			[504.912170, 1035.822021, 59.727600],
			[503.116302, 1030.612061, 60.462830],
			[503.535278, 1029.512573, 62.166565],
			[504.876160, 1028.440674, 63.324341],
			[506.779663, 1027.683838, 63.625916],
			[508.735718, 1027.444580, 62.990540],
			[510.220276, 1027.787231, 61.588379],
			[510.835449, 1028.619995, 59.795227],
			[510.416504, 1029.719482, 58.091553],
			[509.075623, 1030.791260, 56.933716],
			[507.172119, 1031.548218, 56.632080],
			[505.216034, 1031.787476, 57.267639],
			[503.731506, 1031.444824, 58.669678],
			[501.485565, 1025.306396, 57.439697],
			[501.822388, 1023.952820, 58.969788],
			[503.101807, 1022.690796, 59.998169],
			[504.981049, 1021.858398, 60.249023],
			[506.956482, 1021.678772, 59.655212],
			[508.498840, 1022.199951, 58.375977],
			[509.194855, 1023.282471, 56.753906],
			[508.858032, 1024.636108, 55.223755],
			[507.578583, 1025.898193, 54.195496],
			[505.699371, 1026.730469, 53.944641],
			[503.723938, 1026.910156, 54.538391],
			[502.181580, 1026.388916, 55.817688],
			[499.595154, 1019.657959, 52.859009],
			[499.879181, 1018.152344, 54.251770],
			[501.119080, 1016.776428, 55.177368],
			[502.982635, 1015.898926, 55.387817],
			[504.970520, 1015.754883, 54.826660],
			[506.550049, 1016.382996, 53.644470],
			[507.298035, 1017.614868, 52.157837],
			[507.014038, 1019.120483, 50.765137],
			[505.774109, 1020.496460, 49.839539],
			[503.910553, 1021.373901, 49.629028],
			[501.922668, 1021.518005, 50.190125],
			[500.343140, 1020.889893, 51.372437],
			[497.501709, 1013.794312, 46.946899],
			[497.748779, 1012.188354, 48.230286],
			[498.961121, 1010.737366, 49.074219],
			[500.813721, 1009.830078, 49.252502],
			[502.810272, 1009.709595, 48.717346],
			[504.415802, 1010.408203, 47.612122],
			[505.200073, 1011.738647, 46.233032],
			[504.952972, 1013.344604, 44.949524],
			[503.740723, 1014.795593, 44.105652],
			[501.888062, 1015.702881, 43.927429],
			[499.891510, 1015.823364, 44.462646],
			[498.286011, 1015.124756, 45.567871],
			[495.261475, 1007.841492, 39.929688],
			[495.480652, 1006.163330, 41.122498],
			[496.672058, 1004.658203, 41.898682],
			[498.516418, 1003.729431, 42.050171],
			[500.519531, 1003.625854, 41.536438],
			[502.144714, 1004.375244, 40.495056],
			[502.956482, 1005.776855, 39.205200],
			[502.737274, 1007.455017, 38.012390],
			[501.545898, 1008.960205, 37.236267],
			[499.701538, 1009.888916, 37.084778],
			[497.698425, 1009.992493, 37.598511],
			[496.073242, 1009.243103, 38.639893],
			[492.930542, 1001.924866, 32.033936],
			[493.126984, 1000.190308, 33.147522],
			[494.301331, 998.643005, 33.864319],
			[496.138977, 997.697510, 33.992371],
			[498.147461, 997.607178, 33.497375],
			[499.788635, 998.396179, 32.511902],
			[500.622742, 999.853271, 31.300049],
			[500.426331, 1001.587769, 30.186523],
			[499.251953, 1003.135132, 29.469727],
			[497.414337, 1004.080627, 29.341675],
			[495.405884, 1004.170959, 29.836670],
			[493.764709, 1003.381836, 30.822083],
			[490.564941, 996.169556, 23.486084],
			[490.741486, 994.387695, 24.525879],
			[491.900940, 992.805054, 25.187500],
			[493.732697, 991.845459, 25.293945],
			[495.745819, 991.766174, 24.816284],
			[497.401001, 992.588440, 23.882690],
			[498.254639, 994.091858, 22.743286],
			[498.078125, 995.873657, 21.703491],
			[496.918640, 997.456360, 21.041870],
			[495.086914, 998.415894, 20.935425],
			[493.073792, 998.495239, 21.413208],
			[491.418610, 997.672974, 22.346802],
			[488.220581, 990.700195, 14.512329],
			[488.378479, 988.875977, 15.479126],
			[489.524048, 987.261597, 16.086304],
			[491.350250, 986.289490, 16.171021],
			[493.367798, 986.220215, 15.710571],
			[495.036011, 987.072144, 14.828491],
			[495.907990, 988.617188, 13.760864],
			[495.750061, 990.441406, 12.793945],
			[494.604492, 992.055725, 12.187012],
			[492.778290, 993.027832, 12.102173],
			[490.760742, 993.097168, 12.562500],
			[489.092529, 992.245178, 13.444824],
			[485.953308, 985.641479, 5.339111],
			[486.092651, 983.776978, 6.228638],
			[487.224243, 982.132324, 6.778076],
			[489.044922, 981.148193, 6.839844],
			[491.066833, 981.088318, 6.397583],
			[492.748199, 981.968750, 5.569946],
			[493.638489, 983.553589, 4.578491],
			[493.499146, 985.418091, 3.688843],
			[492.367554, 987.062744, 3.139648],
			[490.546844, 988.046875, 3.077637],
			[488.524963, 988.106689, 3.519897],
			[486.843628, 987.226257, 4.347656],
			[483.819153, 981.118408, -3.807129],
			[483.938538, 979.213013, -3.005615],
			[485.055206, 977.537720, -2.521973],
			[486.869995, 976.541504, -2.486206],
			[488.896576, 976.491150, -2.907715],
			[490.591980, 977.400269, -3.673340],
			[491.501892, 979.025269, -4.578247],
			[491.382507, 980.930603, -5.379883],
			[490.265869, 982.605835, -5.863281],
			[488.451080, 983.602112, -5.899170],
			[486.424500, 983.652405, -5.477783],
			[484.729095, 982.743286, -4.712036],
			[481.874084, 977.255371, -12.699829],
			[481.970612, 975.306885, -12.006348],
			[483.070190, 973.599243, -11.603516],
			[484.878174, 972.590088, -11.599854],
			[486.910095, 972.549805, -11.995728],
			[488.621552, 973.489197, -12.685303],
			[489.553955, 975.156616, -13.483887],
			[489.457428, 977.105103, -14.177490],
			[488.357849, 978.812744, -14.580200],
			[486.549866, 979.821899, -14.583862],
			[484.517944, 979.862183, -14.187988],
			[482.806458, 978.922852, -13.498413],
			[480.174042, 974.177368, -21.111816],
			[480.242676, 972.182129, -20.562622],
			[481.321381, 970.439453, -20.267944],
			[483.121094, 969.416382, -20.306763],
			[485.159546, 969.386841, -20.668701],
			[486.890594, 970.359009, -21.256714],
			[487.850342, 972.072144, -21.913208],
			[487.781677, 974.067322, -22.462402],
			[486.702972, 975.809998, -22.757080],
			[484.903259, 976.833130, -22.718262],
			[482.864807, 976.862549, -22.356201],
			[481.133789, 975.890503, -21.768433],
			[478.775146, 972.008850, -28.815063],
			[478.807922, 969.966187, -28.477295],
			[479.859802, 968.187988, -28.340942],
			[481.648804, 967.150513, -28.442383],
			[483.695618, 967.131836, -28.754517],
			[485.451782, 968.136963, -29.193604],
			[486.446747, 969.896484, -29.642090],
			[486.413940, 971.939087, -29.979614],
			[485.362122, 973.717346, -30.116089],
			[483.573059, 974.754761, -30.014648],
			[481.526306, 974.773560, -29.702637],
			[479.770081, 973.768433, -29.263550],
			[477.733551, 970.873840, -35.579590],
			[477.719757, 968.803345, -35.585327],
			[478.736542, 967.003662, -35.705933],
			[480.511536, 965.957092, -35.909058],
			[482.569092, 965.944092, -36.140259],
			[484.357849, 966.967896, -36.337891],
			[485.398621, 968.754517, -36.448486],
			[485.412415, 970.824951, -36.442871],
			[484.395630, 972.624695, -36.322144],
			[482.620605, 973.671204, -36.119141],
			[480.563049, 973.684265, -35.887695],
			[478.774292, 972.660400, -35.690308],
			[477.105469, 970.893433, -41.169434],
			[477.042847, 968.914185, -41.774170],
			[478.022766, 967.181213, -42.343628],
			[479.782532, 966.159180, -42.725464],
			[481.850739, 966.121765, -42.817017],
			[483.673126, 967.078979, -42.593994],
			[484.761444, 968.774353, -42.116211],
			[484.824005, 970.753662, -41.511475],
			[483.844177, 972.486572, -40.941895],
			[482.084381, 973.508606, -40.560181],
			[480.016144, 973.546021, -40.468628],
			[478.193787, 972.588745, -40.691650],
			[476.944214, 972.174561, -45.347046],
			[476.899719, 970.709167, -46.808960],
			[477.891968, 969.358276, -48.024536],
			[479.655121, 968.483765, -48.667969],
			[481.716675, 968.319946, -48.566528],
			[483.524292, 968.910889, -47.747681],
			[484.593628, 970.098022, -46.430786],
			[484.638123, 971.563354, -44.968628],
			[483.645844, 972.914307, -43.753052],
			[481.882690, 973.788879, -43.109619],
			[479.821167, 973.952637, -43.211182],
			[478.013550, 973.361755, -44.030029],
			[477.369385, 975.469727, -48.662476],
			[477.418335, 974.608276, -50.544800],
			[478.480347, 973.710510, -52.078735],
			[480.270752, 973.016724, -52.853638],
			[482.309875, 972.713013, -52.661499],
			[484.051331, 972.880615, -51.554077],
			[485.028503, 973.474731, -49.828125],
			[484.979523, 974.336182, -47.945801],
			[483.917542, 975.234009, -46.411865],
			[482.127136, 975.927734, -45.636963],
			[480.087982, 976.231445, -45.828979],
			[478.346558, 976.063782, -46.936523],
			[478.407593, 980.887939, -51.115112],
			[478.531464, 980.401001, -53.123901],
			[479.649719, 979.784973, -54.754028],
			[481.462738, 979.205139, -55.568726],
			[483.484741, 978.816650, -55.349854],
			[485.173889, 978.723755, -54.156006],
			[486.077606, 978.951294, -52.307007],
			[485.953705, 979.438293, -50.298340],
			[484.835449, 980.054321, -48.668213],
			[483.022430, 980.634155, -47.853394],
			[481.000458, 981.022583, -48.072388],
			[479.311279, 981.115479, -49.266113],
			[479.982758, 988.149780, -52.778687],
			[480.156189, 987.886902, -54.825073],
			[481.311768, 987.439697, -56.484009],
			[483.139893, 986.928284, -57.310791],
			[485.150665, 986.489502, -57.083984],
			[486.805298, 986.240967, -55.864380],
			[487.660522, 986.249268, -53.978760],
			[487.487061, 986.512207, -51.932373],
			[486.331482, 986.959351, -50.273315],
			[484.503357, 987.470764, -49.446655],
			[482.492615, 987.909546, -49.673340],
			[480.837952, 988.158081, -50.893066],
			[482.016174, 996.971130, -53.739624],
			[482.222778, 996.850586, -55.796509],
			[483.403381, 996.510864, -57.463257],
			[485.241638, 996.042969, -58.293213],
			[487.244934, 995.572266, -58.064453],
			[488.876526, 995.224854, -56.837891],
			[489.699219, 995.093750, -54.942383],
			[489.492615, 995.214355, -52.885620],
			[488.311981, 995.554077, -51.218872],
			[486.473755, 996.021973, -50.388672],
			[484.470459, 996.492676, -50.617676],
			[482.838867, 996.840088, -51.844116],
			[484.429077, 1007.070068, -54.088989],
			[484.658813, 1007.045471, -56.146729],
			[485.856812, 1006.778015, -57.814087],
			[487.702087, 1006.339600, -58.644653],
			[489.700256, 1005.847290, -58.415649],
			[491.315765, 1005.433350, -57.188599],
			[492.115875, 1005.208435, -55.292236],
			[491.886169, 1005.233032, -53.234619],
			[490.688171, 1005.500488, -51.567017],
			[488.842865, 1005.938965, -50.736694],
			[486.844727, 1006.431213, -50.965576],
			[485.229187, 1006.845215, -52.192627],
			[487.143005, 1018.166138, -53.918579],
			[487.389282, 1018.208862, -55.973999],
			[488.599792, 1017.992310, -57.639771],
			[490.450104, 1017.574341, -58.469727],
			[492.444550, 1017.067078, -58.241211],
			[494.048584, 1016.606262, -57.015869],
			[494.832489, 1016.315552, -55.121582],
			[494.586243, 1016.272827, -53.066162],
			[493.375732, 1016.489380, -51.400269],
			[491.525391, 1016.907349, -50.570435],
			[489.530975, 1017.414673, -50.798828],
			[487.926941, 1017.875488, -52.024292],
			[490.079407, 1029.979248, -53.320923],
			[490.337830, 1030.070435, -55.373169],
			[491.557373, 1029.890381, -57.036743],
			[493.411469, 1029.487305, -57.865723],
			[495.403137, 1028.969238, -57.637939],
			[496.998779, 1028.474731, -56.414795],
			[497.770905, 1028.136597, -54.523560],
			[497.512512, 1028.045410, -52.471191],
			[496.292938, 1028.225586, -50.807495],
			[494.438904, 1028.628662, -49.978638],
			[492.447174, 1029.146729, -50.206299],
			[490.851563, 1029.641113, -51.429688],
			[493.159973, 1042.229736, -52.388550],
			[493.427155, 1042.355957, -54.437866],
			[494.653442, 1042.202271, -56.099121],
			[496.510162, 1041.809814, -56.927246],
			[498.499878, 1041.283813, -56.700195],
			[500.089417, 1040.765137, -55.479004],
			[500.852905, 1040.392822, -53.590576],
			[500.585693, 1040.266602, -51.541260],
			[499.359436, 1040.420288, -49.879883],
			[497.502716, 1040.812744, -49.052002],
			[495.513000, 1041.338623, -49.278931],
			[493.923431, 1041.857422, -50.500122],
			[496.306274, 1054.638062, -51.213989],
			[496.579742, 1054.788940, -53.260864],
			[497.810730, 1054.653809, -54.920288],
			[499.669312, 1054.268921, -55.747681],
			[501.657654, 1053.737305, -55.521118],
			[503.242889, 1053.201660, -54.301514],
			[504.000244, 1052.805298, -52.415771],
			[503.726776, 1052.654541, -50.368896],
			[502.495850, 1052.789673, -48.709351],
			[500.637207, 1053.174561, -47.882080],
			[498.648865, 1053.706055, -48.108521],
			[497.063660, 1054.241699, -49.328125],
			[499.439941, 1066.924805, -49.890137],
			[499.718323, 1067.094849, -51.934814],
			[500.952972, 1066.974121, -53.592651],
			[502.813110, 1066.595093, -54.419189],
			[504.800354, 1066.059326, -54.193237],
			[506.382141, 1065.510254, -52.975342],
			[507.134705, 1065.095093, -51.091431],
			[506.856354, 1064.925049, -49.046753],
			[505.621735, 1065.045776, -47.388916],
			[503.761536, 1065.424805, -46.562378],
			[501.774353, 1065.960571, -46.788208],
			[500.192535, 1066.509766, -48.006348],
			[505.356812, 1090.018555, -47.164307],
			[505.633667, 1090.182617, -49.209717],
			[506.867157, 1090.057373, -50.867920],
			[508.726868, 1089.676636, -51.694824],
			[510.714417, 1089.142090, -51.468628],
			[512.297241, 1088.597168, -50.250244],
			[513.051270, 1088.187866, -48.365845],
			[512.774475, 1088.023682, -46.320435],
			[511.540985, 1088.148926, -44.661987],
			[509.681274, 1088.529785, -43.835205],
			[507.693726, 1089.064209, -44.061279],
			[506.110840, 1089.609131, -45.279785],
			[510.284668, 1109.279053, -44.952148],
			[510.541199, 1109.363525, -47.005127],
			[511.759460, 1109.178223, -48.668945],
			[513.612915, 1108.773071, -49.498291],
			[515.604980, 1108.256470, -49.270508],
			[517.201904, 1107.766846, -48.046875],
			[517.975769, 1107.435303, -46.155273],
			[517.719238, 1107.350952, -44.102295],
			[516.500977, 1107.536133, -42.438477],
			[514.647522, 1107.941406, -41.609253],
			[512.655396, 1108.458008, -41.836792],
			[511.058502, 1108.947632, -43.060425],
			[521.208618, 1120.351074, -45.217529],
			[520.040955, 1118.989136, -46.251221],
			[518.176208, 1118.310059, -46.842163],
			[516.114075, 1118.496094, -46.831543],
			[514.407043, 1119.497314, -46.222656],
			[513.512512, 1121.045410, -45.178223],
			[513.670166, 1122.725586, -43.978516],
			[514.837830, 1124.087524, -42.944946],
			[516.702515, 1124.766602, -42.354004],
			[518.764709, 1124.580566, -42.364624],
			[520.471741, 1123.579346, -42.973511],
			[521.366272, 1122.031250, -44.017822],
			[520.637817, 1113.476807, -35.515259],
			[519.466003, 1112.060791, -36.468628],
			[517.598450, 1111.344727, -37.004028],
			[515.535522, 1111.520630, -36.978027],
			[513.830078, 1112.541260, -36.397705],
			[512.938965, 1114.133057, -35.418213],
			[513.101074, 1115.869629, -34.302490],
			[514.272888, 1117.285645, -33.348999],
			[516.140442, 1118.001709, -32.813477],
			[518.203369, 1117.825684, -32.839478],
			[519.908813, 1116.805176, -33.419922],
			[520.799927, 1115.213379, -34.399292],
			[520.029053, 1104.188477, -20.972290],
			[518.856995, 1102.768555, -21.919556],
			[516.989258, 1102.049805, -22.450684],
			[514.926270, 1102.224976, -22.423584],
			[513.220886, 1103.246948, -21.845459],
			[512.330017, 1104.842041, -20.870972],
			[512.492371, 1106.582764, -19.761475],
			[513.664429, 1108.002563, -18.814209],
			[515.532227, 1108.721191, -18.282959],
			[517.595154, 1108.546143, -18.310181],
			[519.300537, 1107.524170, -18.888428],
			[520.191406, 1105.929199, -19.862915],
			[519.319336, 1093.118896, -3.501221],
			[518.148621, 1091.720093, -4.480957],
			[516.281860, 1091.015869, -5.034424],
			[514.219177, 1091.194946, -5.013428],
			[512.513306, 1092.209473, -4.423706],
			[511.621307, 1093.787598, -3.422974],
			[511.782196, 1095.506226, -2.279663],
			[512.952881, 1096.905151, -1.299805],
			[514.819641, 1097.609375, -0.746338],
			[516.882324, 1097.430176, -0.767334],
			[518.588257, 1096.415771, -1.357056],
			[519.480225, 1094.837646, -2.357788],
			[518.446045, 1080.903320, 14.984009],
			[517.277832, 1079.536621, 13.957031],
			[515.412720, 1078.854736, 13.371094],
			[513.350464, 1079.040039, 13.383057],
			[511.643738, 1080.043091, 13.989746],
			[510.749817, 1081.595093, 15.028564],
			[510.908234, 1083.280273, 16.221313],
			[512.076477, 1084.646851, 17.248291],
			[513.941589, 1085.328857, 17.834351],
			[516.003845, 1085.143555, 17.822266],
			[517.710571, 1084.140381, 17.215698],
			[518.604492, 1082.588379, 16.176758],
			[517.928833, 1074.567017, 24.004517],
			[516.763428, 1073.234375, 22.930786],
			[514.900269, 1072.575684, 22.312744],
			[512.838623, 1072.767578, 22.315796],
			[511.130920, 1073.758545, 22.939331],
			[510.234711, 1075.283203, 24.015869],
			[510.390106, 1076.932983, 25.257568],
			[511.555511, 1078.265747, 26.331177],
			[513.418640, 1078.924438, 26.949341],
			[515.480286, 1078.732544, 26.946289],
			[517.187988, 1077.741455, 26.322876],
			[518.084229, 1076.216797, 25.246094],
			[517.347534, 1068.185181, 32.557251],
			[516.186707, 1066.900879, 31.421448],
			[514.326721, 1066.275513, 30.760681],
			[512.265991, 1066.476807, 30.752014],
			[510.556702, 1067.450684, 31.397644],
			[509.656769, 1068.936279, 32.524719],
			[509.807404, 1070.535522, 33.831177],
			[510.968262, 1071.819824, 34.966919],
			[512.828186, 1072.445190, 35.627686],
			[514.888916, 1072.244019, 35.636475],
			[516.598267, 1071.270142, 34.990723],
			[517.498169, 1069.784424, 33.863770],
			[516.694519, 1061.838623, 40.401367],
			[515.541321, 1060.625366, 39.182739],
			[513.686646, 1060.048950, 38.465027],
			[511.627411, 1060.263916, 38.440613],
			[509.915466, 1061.212769, 39.116089],
			[509.009460, 1062.640991, 40.310364],
			[509.152161, 1064.166138, 41.703552],
			[510.305359, 1065.379395, 42.922241],
			[512.160034, 1065.955811, 43.639954],
			[514.219299, 1065.740845, 43.664368],
			[515.931274, 1064.792114, 42.988892],
			[516.837280, 1063.363770, 41.794678],
			[515.962463, 1055.609619, 47.295837],
			[514.822632, 1054.505615, 45.965576],
			[512.977295, 1054.004761, 45.171448],
			[510.920715, 1054.240967, 45.126038],
			[509.204102, 1055.151001, 45.841797],
			[508.287354, 1056.491089, 47.126709],
			[508.416138, 1057.902100, 48.636475],
			[509.555969, 1059.005981, 49.966736],
			[511.401337, 1059.506958, 50.760864],
			[513.457886, 1059.270630, 50.806213],
			[515.174500, 1058.360596, 50.090515],
			[516.091248, 1057.020508, 48.805603],
			[515.144348, 1049.582520, 52.998230],
			[514.029907, 1048.657837, 51.518250],
			[512.202148, 1048.280396, 50.621643],
			[510.150696, 1048.551392, 50.548706],
			[508.425293, 1049.398193, 51.318848],
			[507.488281, 1050.593872, 52.725830],
			[507.590698, 1051.817993, 54.392578],
			[508.705109, 1052.742676, 55.872559],
			[510.532928, 1053.120117, 56.769165],
			[512.584351, 1052.849121, 56.842102],
			[514.309753, 1052.002319, 56.071838],
			[515.246826, 1050.806641, 54.664978],
			[514.234497, 1043.847900, 57.266113],
			[513.171814, 1043.236572, 55.597534],
			[511.379883, 1043.074951, 54.572754],
			[509.338806, 1043.406738, 54.466492],
			[507.595551, 1044.142578, 55.307129],
			[506.617218, 1045.085693, 56.869446],
			[506.665924, 1045.982910, 58.734802],
			[507.728577, 1046.594238, 60.403320],
			[509.520569, 1046.755859, 61.428101],
			[511.561615, 1046.424072, 61.534363],
			[513.304871, 1045.688232, 60.693787],
			[514.283203, 1044.745117, 59.131470],
			[513.229980, 1038.506592, 59.862305],
			[512.275391, 1038.451782, 58.025757],
			[510.558197, 1038.672852, 56.890137],
			[508.538574, 1039.110352, 56.759705],
			[506.757751, 1039.647095, 57.669434],
			[505.692810, 1040.139404, 59.375488],
			[505.629089, 1040.455200, 61.420776],
			[506.583740, 1040.510010, 63.257385],
			[508.300903, 1040.289063, 64.393005],
			[510.320526, 1039.851440, 64.523438],
			[512.101379, 1039.314697, 63.613770],
			[513.166321, 1038.822388, 61.907593],
		];
		three.expectVerticesInArray(expectedVertices, rubberMeshVertices.array, 2);
	});

});
