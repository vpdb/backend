"use strict";

var fs = require('fs');
var gm = require('gm');
var path = require('path');
var expect = require('expect.js');
var pleasejs = require('pleasejs');

exports.createBackglass = function(user, request, done) {

	var fileType = 'backglass';
	var mimeType = 'image/png';
	var name = 'backglass.png';
	gm(640, 512, pleasejs.make_color()).toBuffer('PNG', function(err, data) {
		if (err) {
			throw err;
		}
		request
			.post('/storage')
			.query({ type: fileType })
			.type(mimeType)
			.set('Content-Disposition', 'attachment; filename="' + name + '"')
			.set('Content-Length', data.length)
			.send(data)
			.as(user)
			.end(function(res) {
				expect(res.status).to.be(201);
				done(res.body);
			});
	});
};

exports.createTextfile = function(user, request, done) {
	var fileType = 'readme';
	request
		.post('/storage')
		.query({ type: fileType })
		.type('text/plain')
		.set('Content-Disposition', 'attachment; filename="README.txt"')
		.send('You are looking at a text file generated during a test.')
		.as(user)
		.end(function(res) {
			expect(res.status).to.be(201);
			done(res.body);
		});
};