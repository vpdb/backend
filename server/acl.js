'use strict';

var _ = require('underscore');
var ACL = require('acl');
var logger = require('winston');
var mongoose = require('mongoose');

var User = mongoose.model('User');
var acl = new ACL(new ACL.memoryBackend());

var init = function(next) {

	// permissions
	acl.allow([
		{
			roles: 'admin',
			allows: [
				{ resources: 'users', permissions: [ 'update', 'list', 'full-details' ]},
				{ resources: 'roles', permissions: 'list' }
			]
		}, {
			roles: 'contributor',
			allows: [
				{ resources: 'games', permissions: [ 'update', 'add' ]},
				{ resources: 'ipdb', permissions: 'view' }
			]
		}, {
			roles: 'member',
			allows: [
				{ resources: 'user', permissions: 'profile' },
				{ resources: 'users', permissions: [ 'view', 'search' ]},
				{ resources: 'files', permissions: ['download', 'upload', 'delete' ] },  // delete: only own/inactive files
				{ resources: 'releases', permissions: 'add' },
				{ resources: 'tags', permissions: 'add' }
			]
		}, {
			roles: 'mocha',
			allows: [
				{ resources: 'users', permissions: 'delete' }
			]
		}
	])

	// hierarchy
	.then(function() { return acl.addRoleParents('root', [ 'admin', 'contributor' ]) })
	.then(function() { return acl.addRoleParents('admin', [ 'member' ]) })
	.then(function() { return acl.addRoleParents('contributor', [ 'member' ]) })

	// apply to all users
	.then(function() {
		User.find({}, function(err, users) {
			if (err) {
				logger.error('[acl] Error finding users for ACLs: ', err);
				return next(err);
			}

			logger.info('[acl] Applying ACLs to %d users...', users.length);
			_.each(users, function(user) {
				acl.addUserRoles(user.email, user.roles);
			});
			logger.info('[acl] ACLs applied.');
			next(null, acl);
		});
	});

};

acl.init = init;
module.exports = acl;
