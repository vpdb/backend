/*
 * VPDB - Visual Pinball Database
 * Copyright (C) 2015 freezy <freezy@xbmc.org>
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
var logger = require('winston');
var Pusher = require('pusher');
var config = require('./settings').current;

exports.isEnabled = config.vpdb.pusher.enabled;

if (exports.isEnabled) {
	exports.api = new Pusher(config.vpdb.pusher.options);
}

exports.addVersion = function(game, release, version) {

	// don't even bother quering..
	if (!exports.isEnabled) {
		return;
	}

	var User = require('mongoose').model('User');
	var Star = require('mongoose').model('Star');
	
	async.waterfall([

		/**
		 * Find stars of pusher-enabled users
		 * @param next Callback
		 */
		function(next) {
			Star.find({ type: 'release', '_ref.release': release._id }, '_from', function(err, stars) {
				/* istanbul ignore if  */
				if (err) {
					logger.error('[pusher] [addVersion] Error retrieving stars for release %s: %s', release.id, err.message);
					return next();
				}
				var users = _.map(_.filter(stars, function(star) {
					return exports.isUserEnabled(star._from) && star._from.channel_config.subscribe_to_starred;
				}), function(star) {
					return star._from;
				});

				next(null, users);
			});
		},

		/**
		 * Find explicitly subscribed releases
 		 * @param users Previously found user
		 * @param next Callback
		 */
		function(users, next) {
			User.find({ 'channel_config.subscribed_releases': release.id }, function(err, subscribedUsers) {
				/* istanbul ignore if  */
				if (err) {
					logger.error('[pusher] [addVersion] Error retrieving subscribed users for release %s: %s', release.id, err.message);
					return next(null, users);
				}
				var enabledUsers = _.filter(subscribedUsers, function(user) {
					return exports.isUserEnabled(user);
				});
				next(null, users.concat(enabledUsers));
			});
		}

	], function(err, users) {
		var userChannels = _.uniq(_.map(users, function(user) { return getChannel(user.id); }));
		_.each(userChannels, function(chan) {
			exports.api.trigger(chan, 'new_release_version', { game_id: game.id, release_id: release.id, version: version.name });
		});
	});
};

exports.star = function(type, entity, user) {
	if (exports.isUserEnabled(user)) {
		exports.api.trigger(getChannel(user), 'star', { id: entity.id, type: type });
	}
};

exports.unstar = function(type, entity, user) {
	if (exports.isUserEnabled(user)) {
		exports.api.trigger(getChannel(user), 'unstar', { id: entity.id, type: type });
	}
};

/**
 * Returns true if the Pusher API is enabled and the user's plan supports it.
 * @param user User to check
 * @returns {boolean} True if a message can be sent, false otherwise.
 */
exports.isUserEnabled = function(user) {
	return exports.isEnabled && config.vpdb.quota.plans[user._plan].enableRealtime;
};

function getChannel(user) {
	return 'private-user-' + user.id;
}
