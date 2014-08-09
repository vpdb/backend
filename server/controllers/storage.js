"use strict";

var fs = require('fs');
var logger = require('winston');

var File = require('mongoose').model('File');
var quota = require('../modules/quota');
var storage = require('../modules/storage');
var acl = require('../acl');

function serve(req, res, file, variationName) {

	var serveFile = function(fstat) {

		// check if we should return 304 not modified
		var modified = new Date(fstat.mtime);
		var ifmodifiedsince = req.headers['if-modified-since'] ? new Date(req.headers['if-modified-since']) : false;
		if (ifmodifiedsince && modified.getTime() >= ifmodifiedsince.getTime()) {
			res.writeHead(304);
			res.end();
			return;
		}

		// otherwise set headers and stream the file
		res.writeHead(200, {
			'Content-Type': file.mime_type,
			'Content-Length':  fstat.size,
			'Cache-Control': 'private',
			'Last-Modified': modified
		});
		var stream = fs.createReadStream(file.getPath(variationName));
		stream.pipe(res);
	};

	var fstat = storage.fstat(file, variationName);

	if (fstat && fstat.size > 0) {
		serveFile(fstat);

	} else {
		/*
		 * So the idea is the following:
		 *
		 * The user uploads let's say an image, a backglass at 1280x1024 that weights 2.5M. As uploading takes already
		 * long enough, we don't want the user wait another minute until the post-processing stuff is done (i.e.
		 * creating thumbs and running everything through pngquant and optipng).
		 *
		 * For this reason, when uploading, the API only reads image meta data and instantly returns the payload that
		 * contains urls for not-yet-generated thumbs. The post-processing is then launched in the background.
		 *
		 * Now, when the client accesses the not-yet-generated thumb, we end up here. By calling `whenProcessed()`, we
		 * ask the `storage` module to let us know when processing for that file and variation has finished (if there
		 * wasn't actually any processing going on, it will instantly return null).
		 *
		 * That means that the client's request for the image is delayed until the image is ready and then instantly
		 * delivered.
		 */
		logger.info('[ctrl|storage] Waiting for %s/%s to be processed...', file.id, variationName);
		storage.whenProcessed(file, variationName, function(fstat) {
			if (!fstat) {
				logger.info('[ctrl|storage] No processing, returning 404.');
				return res.writeHead(404);
			}
			logger.info('[ctrl|storage] Streaming freshly processed item back to client.');
			serveFile(fstat);
		});
	}
}

exports.get = function(req, res) {

	File.findOne({ id: req.params.id }, function(err, file) {
		/* istanbul ignore if  */
		if (err) {
			logger.error('[ctrl|storage] Error getting file "%s": %s', req.params.id, err, {});
			return res.status(500).end();
		}
		if (!file) {
			return res.status(404).end();
		}

		// file is not public - user must be logged in.
		if (!file.is_public && !req.user) {
			return res.status(401).end();
		}

		// if inactive and user is not logged or not the owner, refuse.
		if (!file.is_active) {
			if (!req.user) {
				return res.status(401).end();
			}
			if (!file._created_by.equals(req.user._id)) {
				return res.status(403).end();
			}
		}

		// at this point, we can serve the file if it's public
		if (file.is_public) {
			return serve(req, res, file, req.params.variation);
		}

		// so here we determined the file isn't public, so we need to check ACLs and quota.
		acl.isAllowed(req.user.email, 'files', 'download', function(err, granted) {
			/* istanbul ignore if  */
			if (err) {
				logger.error('[ctrl|storage] Error checking ACLs for <%s>: %s', req.user.email, err, {});
				return res.status(500).end();
			}
			if (!granted) {
				return res.status(403).end();
			}

			// if the user is the owner, serve directly (owned files don't count as credits)
			if (file._created_by.equals(req.user._id)) {
				return serve(req, res, file, req.params.variation);
			}

			// and the quota
			quota.isAllowed(req, res, file, function(err, granted) {
				/* istanbul ignore if  */
				if (err) {
					logger.error('[ctrl|storage] Error checking quota for <%s>: %s', req.user.email, err, {});
					return res.status(500).end();
				}
				if (!granted) {
					return res.status(403).end();
				}
				return serve(req, res, file, req.params.variation);
			});
		});

	});
};
