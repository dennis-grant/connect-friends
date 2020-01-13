var ConnectFriendsServer = function() {
	var Connection = function(_dbConnection, _loggedInUser) {
		this.init = function() {
			this.URL_GET_RECENT_POSTS  = "/getRecentPosts";
			this.URL_GET_MY_POSTS      = "/getMyPosts";
			this.URL_GET_FRIENDS_POSTS = "/getFriendsPosts";
			this.URL_GET_LIKED_POSTS   = "/getLikedPosts";
			this.URL_ADD_POST          = "/addPost";
			this.URL_ADD_COMMENT       = "/addComment";
			this.URL_DELETE_POST       = "/deletePost";
			this.URL_LIKE_POST         = "/likePost";
			this.URL_UNLIKE_POST       = "/unlikePost";
			this.URL_GET_ALL_USERS     = "/getAllUsers";
			this.URL_GET_FOLLOWERS     = "/getFollowers";
			this.URL_GET_FOLLOWEES     = "/getFollowees";
			this.URL_FOLLOW_USER       = "/followUser";
			this.URL_UNFOLLOW_USER     = "/unfollowUser";
			this.URL_GET_LOGGEDIN_USER = "/getLoggedInUser";

			this.dbConnection = _dbConnection;
			this.loggedInUser = _loggedInUser;
			$.extend(this, UserManager, PostManager);
		};

		this.execute = function(url, params) {
			if (url === this.URL_GET_RECENT_POSTS) {
				return this.getRecentPosts(params.sincePostId);
			}
			else if (url === this.URL_GET_MY_POSTS) {
				return this.getMyPosts(params.sincePostId);
			}
			else if (url === this.URL_GET_FRIENDS_POSTS) {
				return this.getFriendsPosts(params.sincePostId);
			}
			else if (url === this.URL_GET_LIKED_POSTS) {
				return this.getLikedPosts();
			}
			else if (url === this.URL_ADD_POST) {
				return this.addPost(params.post);
			}
			else if (url === this.URL_ADD_COMMENT) {
				return this.addComment(params.comment, params.commentOnPostId);
			}
			else if (url === this.URL_DELETE_POST) {
				return this.deletePost(params.postId);
			}
			else if (url === this.URL_LIKE_POST) {
				return this.likePost(params.postId);
			}
			else if (url === this.URL_UNLIKE_POST) {
				return this.unlikePost(params.postId);
			}
			else if (url === this.URL_GET_ALL_USERS) {
				return this.getAllUsers();
			}
			else if (url === this.URL_GET_FOLLOWERS) {
				return this.getFollowerUsers();
			}
			else if (url === this.URL_GET_FOLLOWEES) {
				return this.getFolloweeUsers();
			}
			else if (url === this.URL_FOLLOW_USER) {
				return this.followUser(params.followeeId);
			}
			else if (url === this.URL_UNFOLLOW_USER) {
				return this.unfollowUser(params.followeeId);
			}
			else if (url === this.URL_GET_LOGGEDIN_USER) {
				return this.loggedInUser;
			}
		};

		
		this.init();
	};

	var UserManager = {
		getAllUsers: function() {
			var users;

			users = this.dbConnection.selectRecords("users", "userId,firstName,lastName,email,position,photo".split(","), []);
			this.setUsersExtraInfo(users);

			return users;
		},

		getFollowerUsers: function() {
			var followers;
			var followerUsers;
			var userIds;
			var cond;

			cond = new DeaconDB.Condition("followeeId", this.loggedInUser.userId, "=");
			followers = this.dbConnection.selectRecords("followers", ["followerId"], [cond]);
			userIds = [];
			for (var i in followers) {
				userIds[userIds.length] = followers[i].followerId;
			}

			cond = new DeaconDB.Condition("userId", userIds, "in");
			followerUsers = this.dbConnection.selectRecords("users", "userId,firstName,lastName,email,position,photo".split(","), [cond]);
			this.setUsersExtraInfo(followerUsers);

			return followerUsers;
		},

		getFolloweeUsers: function() {
			var followees;
			var followeeUsers;
			var userIds;
			var cond;

			followees = this.getFollowees(this.loggedInUser.userId);
			userIds = [];
			for (var i in followees) {
				userIds[userIds.length] = followees[i].followeeId;
			}

			cond = new DeaconDB.Condition("userId", userIds, "in");
			followeeUsers = this.dbConnection.selectRecords("users", "userId,firstName,lastName,email,position,photo".split(","), [cond]);
			this.setUsersExtraInfo(followeeUsers);

			return followeeUsers;
		},

		followUser: function(followeeId) {
			this.dbConnection.addRecord("followers", {followerId: this.loggedInUser.userId, followeeId: followeeId});
			return {result: true};
		},

		unfollowUser: function(followeeId) {
			var cond1;
			var cond2;

			cond1 = new DeaconDB.Condition("followerId", this.loggedInUser.userId, "=");
			cond2 = new DeaconDB.Condition("followeeId", followeeId, "=");
			this.dbConnection.deleteRecords("followers", [cond1, cond2]);

			return {result: true};
		},

		getFollowees: function(followerId) {
			var followees;
			var cond;

			cond = new DeaconDB.Condition("followerId", followerId, "=");
			followees = this.dbConnection.selectRecords("followers", ["followeeId"], [cond]);

			return followees;
		},

		setUsersExtraInfo: function(users) {
			var followees;
			var followeesMap;

			followees = this.getFollowees(this.loggedInUser.userId);
			followeesMap = {};
			for (var j in followees) {
				followeesMap["fid:" + followees[j].followeeId] = true;
			}

			for (var k in users) {
				if (followeesMap["fid:" + users[k].userId] === true) {
					users[k].followedByCurrentUser = true;
				}
				else {
					users[k].followedByCurrentUser = false;
				}
			}
		}
	};

	var PostManager = {
		getRecentPosts: function(sincePostId) {
			var cond1;
			var conditions;
			var posts;

			conditions = [];
			if (sincePostId !== undefined) {
				cond1 = new DeaconDB.Condition("postId", sincePostId, ">");
				conditions[0] = cond1;
			}
			posts = this.dbConnection.selectRecords("posts", "postId,postedById,post,startPostId".split(","), conditions);
			this.setPostsExtraInfo(posts);

			return posts;
		},

		getMyPosts: function(sincePostId) {
			var cond1;
			var cond2;
			var conditions;
			var posts;

			conditions = [];
			cond1 = new DeaconDB.Condition("postedById", this.loggedInUser.userId, "=");
			conditions[0] = cond1;
			if (sincePostId !== undefined) {
				cond2 = new DeaconDB.Condition("postId", sincePostId, ">");
				conditions[1] = cond2;
			}
			posts = this.dbConnection.selectRecords("posts", "postId,postedById,post,startPostId".split(","), conditions);
			this.setPostsExtraInfo(posts);

			return posts;
		},

		getFriendsPosts: function(sincePostId) {
			var followees;
			var posts;
			var postedByIds;
			var cond1;
			var cond2;
			var conditions;

			cond1 = new DeaconDB.Condition("followerId", this.loggedInUser.userId, "=");
			followees = this.dbConnection.selectRecords("followers", ["followeeId"], [cond1]);
			postedByIds = [];
			for (var i in followees) {
				postedByIds[postedByIds.length] = followees[i].followeeId;
			}

			conditions = [];
			cond1 = new DeaconDB.Condition("postedById", postedByIds, "in");
			conditions[0] = cond1;
			if (sincePostId !== undefined) {
				cond2 = new DeaconDB.Condition("postId", sincePostId, ">");
				conditions[1] = cond2;
			}
			posts = this.dbConnection.selectRecords("posts", "postId,postedById,post,startPostId".split(","), conditions);
			this.setPostsExtraInfo(posts);

			return posts;
		},

		getLikedPosts: function() {
			var likes;
			var posts;
			var postIds;
			var cond;

			likes = this.getLikes(this.loggedInUser.userId);
			postIds = [];
			for (var i in likes) {
				postIds[postIds.length] = likes[i].postId;
			}

			cond = new DeaconDB.Condition("postId", postIds, "in");
			posts = this.dbConnection.selectRecords("posts", "postId,postedById,post,startPostId".split(","), [cond]);
			this.setPostsExtraInfo(posts);

			return posts;
		},

		getConversations: function(sincePostId) {
		},
		getFriendsConversations: function(sincePostId) {
		},
		getLikedConversations: function(sincePostId) {
		},

		addPost: function(post, startPostId) {
			var maxPostId;
			var record;

			maxPostId = this.dbConnection.getMaxFieldValue("posts", "postId");
			startPostId = (startPostId === undefined) ? -1 : startPostId;
			record = {
				postId: maxPostId + 1, 
				post: post, 
				postedById: this.loggedInUser.userId, 
				startPostId: startPostId
			};
			this.dbConnection.addRecord("posts", record);

			return {result: true};
		},

		deletePost: function(postId) {
			var cond;

			cond = new DeaconDB.Condition("postId", postId, "=");
			this.dbConnection.deleteRecords("posts", [cond]);
			this.dbConnection.deleteRecords("likes", [cond]);

			return {result: true};
		},

		likePost: function(postId) {
			this.dbConnection.addRecord("likes", {userId: this.loggedInUser.userId, postId: postId});
			return {result: true};
		},

		unlikePost: function(postId) {
			var cond1;
			var cond2;

			cond1 = new DeaconDB.Condition("userId", this.loggedInUser.userId, "=");
			cond2 = new DeaconDB.Condition("postId", postId, "=");
			this.dbConnection.deleteRecords("likes", [cond1, cond2]);

			return {result: true};
		},

		addComment: function(comment, commentOnPostId) {
			return this.addPost(comment, commentOnPostId);
		},

		getLikes: function(userId) {
			var likes;
			var cond;

			cond = new DeaconDB.Condition("userId", userId, "=");
			likes = this.dbConnection.selectRecords("likes", ["postId"], [cond]);

			return likes;
		},

		setPostsExtraInfo: function(posts) {
			this.setPostedByUserInfo(posts);
			this.setLikedByCurrentUser(posts);
			this.setPermissions(posts);
		},

		setPostedByUserInfo: function(posts) {
			var userIds;
			var users;
			var usersMap;

			userIds = [];
			for (var i in posts) {
				userIds[userIds.length] = posts[i].postedById;
			}

			cond = new DeaconDB.Condition("userId", userIds, "in");
			users = this.dbConnection.selectRecords("users", "userId,firstName,lastName,email,position,photo".split(","), [cond]);
			usersMap = {};
			for (var j in users) {
				usersMap["uid:" + users[j].userId] = users[j];
			}

			for (var k in posts) {
				posts[k].postedBy = usersMap["uid:" + posts[k].postedById];
				posts[k].currentUser = this.loggedInUser;
			}
		},

		setLikedByCurrentUser: function(posts) {
			var likes;
			var likesMap;

			likes = this.getLikes(this.loggedInUser.userId);
			likesMap = {};
			for (var j in likes) {
				likesMap["pid:" + likes[j].postId] = true;
			}

			for (var k in posts) {
				if (likesMap["pid:" + posts[k].postId] === true) {
					posts[k].likedByCurrentUser = true;
				}
				else {
					posts[k].likedByCurrentUser = false;
				}
			}
		},

		setPermissions: function(posts) {
			for (var i in posts) {
				if (posts[i].postedById == this.loggedInUser.userId) {
					posts[i].permissions = {canDelete: true};
				}
				else {
					posts[i].permissions = {canDelete: false};
				}
			}
		}
	};

	return {
		"Connection": Connection
	};
}();
