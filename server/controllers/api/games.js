/*
 * VPDB - Visual Pinball Database
 * Copyright (C) 2016 freezy <freezy@xbmc.org>
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

"use strict";

var _ = require('lodash');
var async = require('async');
var util = require('util');
var logger = require('winston');

var Game = require('mongoose').model('Game');
var Star = require('mongoose').model('Star');
var Rom = require('mongoose').model('Rom');
var LogEvent = require('mongoose').model('LogEvent');

var api = require('./api');

var error = require('../../modules/error')('api', 'game');


/**
 * Returns either 200 or 404. Useful for checking if a given game ID already exists.
 * @param {Request} req
 * @param {Response} res
 */
exports.head = function(req, res) {

	Game.findOne({ id: req.params.id }, function(err, game) {
		/* istanbul ignore if  */
		if (err) {
			return api.fail(res, error(err, 'Error finding game "%s"', req.params.id).log('head'), 500);
		}
		res.set('Content-Length', 0);
		return res.status(game ? 200 : 404).end();
	});
};


/**
 * Creates a new game.
 * @param {Request} req
 * @param {Response} res
 */
exports.create = function(req, res) {

	var game;
	Promise.try(() => {
		return Game.getInstance(_.assign(req.body, {
			_created_by: req.user._id,
			created_at: new Date()
		}));

	}).then(newGame => {
		game = newGame;
		logger.info('[api|game:create] %s', util.inspect(req.body));
		return newGame.validate();

	}).then(() => {
		logger.info('[api|game:create] Validations passed.');
		return game.save();

	}).then(() => {
		logger.info('[api|game:create] Game "%s" created.', game.title);
		return game.activateFiles();

	}).then(() => {
		// link roms if available
		if (game.ipdb && game.ipdb.number) {
			return Rom.find({ _ipdb_number: game.ipdb.number }).exec().then(roms => {
				logger.info('[api|game:create] Linking %d ROMs to created game %s.', roms.length, game._id);
				return Promise.each(roms, rom => {
					rom._game = game._id.toString();
					return rom.save();
				});
			});
		}

	}).then(() => {
		LogEvent.log(req, 'create_game', true, { game: _.omit(game.toSimple(), [ 'rating', 'counter' ]) }, { game: game._id });
		api.success(res, game.toDetailed(), 201);

	}).catch(api.handleError(res, error, 'Error creating game'));

};


/**
 * Deletes a game.
 * @param {Request} req
 * @param {Response} res
 */
exports.del = function(req, res) {

	var query = Game.findOne({ id: req.params.id })
		.populate({ path: '_media.backglass' })
		.populate({ path: '_media.logo' });

	query.exec(function(err, game) {
		/* istanbul ignore if  */
		if (err) {
			return api.fail(res, error(err, 'Error getting game "%s"', req.params.id).log('delete'), 500);
		}
		if (!game) {
			return api.fail(res, error('No such game with ID "%s".', req.params.id), 404);
		}

		// TODO check for linked releases (& ROMs, etc) and refuse if referenced

		// remove from db
		game.remove(function(err) {
			/* istanbul ignore if  */
			if (err) {
				return api.fail(res, error(err, 'Error deleting game "%s" (%s)', game.id, game.title).log('delete'), 500);
			}
			logger.info('[api|game:delete] Game "%s" (%s) successfully deleted.', game.title, game.id);
			api.success(res, null, 204);
		});
	});
};


/**
 * Lists all games.
 * @param {Request} req
 * @param {Response} res
 */
exports.list = function(req, res) {

	var pagination = api.pagination(req, 12, 60);
	var query = [];

	// text search
	if (req.query.q) {

		if (req.query.q.trim().length < 2) {
			return api.fail(res, error('Query must contain at least two characters.'), 400);
		}

		// sanitize and build regex
		var titleQuery = req.query.q.trim().replace(/[^a-z0-9-]+/gi, '');
		var titleRegex = new RegExp(titleQuery.split('').join('.*?'), 'i');
		var idQuery = req.query.q.trim().replace(/[^a-z0-9-]+/gi, ''); // TODO tune

		query.push({ $or: [ { title: titleRegex }, { id: idQuery } ] });
	}

	// filter by manufacturer
	if (req.query.mfg) {
		var mfgs = req.query.mfg.split(',');
		query.push({ manufacturer: mfgs.length === 1 ? mfgs[0] : { $in: mfgs } });
	}

	// filter by decade
	if (req.query.decade) {
		var decades = req.query.decade.split(',');
		var d = [];
		decades.forEach(function(decade) {
			d.push({ year: { $gte: parseInt(decade, 10), $lt: parseInt(decade, 10) + 10 }});
		});
		if (d.length === 1) {
			query.push(d[0]);
		} else {
			query.push({ $or: d });
		}
	}

	if (parseInt(req.query.min_releases)) {
		query.push({ 'counter.releases': { $gte: parseInt(req.query.min_releases) }});
	}

	var sort = api.sortParams(req, { title: 1 }, {
		popularity: '-metrics.popularity',
		rating: '-rating.score',
		title: 'title_sortable'
	});

	var q = api.searchQuery(query);
	logger.info('[api|game:list] query: %s, sort: %j', util.inspect(q), util.inspect(sort));
	Game.paginate(q, {
		page: pagination.page,
		limit: pagination.perPage,
		populate: [ '_media.backglass', '_media.logo' ],
		sort: sort

	}, function(err, result) {

		/* istanbul ignore if  */
		if (err) {
			return api.fail(res, error(err, 'Error listing games').log('list'), 500);
		}
		var games = _.map(result.docs, function(game) {
			return game.toSimple();
		});
		api.success(res, games, 200, api.paginationOpts(pagination, result.total));

	});
};


/**
 * Lists a game of a given game ID.
 * @param {Request} req
 * @param {Response} res
 */
exports.view = function(req, res) {

	async.waterfall([

		/**
		 * Retrieve game
		 * @param next
		 */
		function(next) {

			var query = Game.findOne({ id: req.params.id })
				.populate({ path: '_media.backglass' })
				.populate({ path: '_media.logo' });

			query.exec(function(err, game) {
				/* istanbul ignore if  */
				if (err) {
					return next(error(err, 'Error finding game "%s"', req.params.id).log('view'));
				}
				if (!game) {
					return next(error('No such game with ID "%s"', req.params.id).status(404));
				}
				game.incrementCounter('views');
				next(null, game);
			});
		},

		/**
		 * Retrieve stars if logged
		 * @param game
		 * @param next
		 * @returns {*}
		 */
		function(game, next) {

			// only if logged
			if (!req.user) {
				return next(null, game, null);
			}

			Star.find({ type: 'release', _from: req.user._id }, '_ref.release', function(err, stars) {
				/* istanbul ignore if  */
				if (err) {
					return next(error(err, 'Error searching starred releases for user <%s>.', req.user.email).log('list'));
				}
				console.log('stars: %j', stars);
				var starredReleaseIds = _.map(_.map(_.map(stars, '_ref'), 'release'), id => id.toString());

				next(null, game, starredReleaseIds);
			});
		},

		/**
		 * Retrieve release details
		 * @param game
		 * @param starredReleaseIds Array of release _id strings
		 * @param next
		 */
		function(game, starredReleaseIds, next) {

			var opts = {};
			opts.starredReleaseIds = starredReleaseIds;
			game.toDetailed(opts, function(err, game) {
				/* istanbul ignore if  */
				if (err) {
					return next(error(err, 'Error populating game "%s"', req.params.id).log('view'));
				}
				next(null, game);
			});
		}

	], function(err, game) {

		if (err) {
			return api.fail(res, err, err.code);
		}
		api.success(res, game);
	});


};
