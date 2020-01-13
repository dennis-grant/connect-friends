var ConnectFriends = (function(module) {
	var Controller = function(_model, _serverConn, _MDPModelUpdatedFunc) {
		var self = this;

		this.init = function() {
			this.model = _model;
			this.serverConn = _serverConn;
			this.MDPModelUpdatedFunc = _MDPModelUpdatedFunc;
			$.extend(this, PostsManager, FollowersManager);
		};

		this.selectMDPModel = function(model) {
			if (this.model.currentMDPModel !== model) {
				this.model.currentMDPModel = model;
				this.MDPModelUpdatedFunc();
			}
		};

		this.init();
	};

	var PostsManager = {
		submitPost: function(post) {
			this.serverConn.execute(this.serverConn.URL_ADD_POST, {post: post});
			if (this.model.currentMDPModel === this.model.recentPostsMDPModel) {
				this.getRecentPosts();
			}
			else if (this.model.currentMDPModel === this.model.myPostsMDPModel) {
				this.getMyPosts();
			}
		},

		commentOnPost: function(commentOnPostId, comment) {
			this.serverConn.execute(this.serverConn.URL_ADD_COMMENT, {comment: comment, commentOnPostId:  commentOnPostId});
			if (this.model.currentMDPModel === this.model.recentPostsMDPModel) {
				this.getRecentPosts();
			}
			else if (this.model.currentMDPModel === this.model.myPostsMDPModel) {
				this.getMyPosts();
			}
		},

		deletePost: function(postId) {
			this.serverConn.execute(this.serverConn.URL_DELETE_POST, {postId: postId});
			this.deletePostFromList(this.model.recentPostsMDPModel.listItems, postId);
			this.deletePostFromList(this.model.myPostsMDPModel.listItems, postId);
			this.deletePostFromList(this.model.likedPostsMDPModel.listItems, postId);
		},

		likePost: function(postId) {
			var posts;
			var tmpPost;

			this.serverConn.execute(this.serverConn.URL_LIKE_POST, {postId: postId});
			this.updatePostInList(this.model.recentPostsMDPModel.listItems, postId, {likedByCurrentUser: true});
			this.updatePostInList(this.model.myPostsMDPModel.listItems, postId, {likedByCurrentUser: true});
			this.updatePostInList(this.model.friendsPostsMDPModel.listItems, postId, {likedByCurrentUser: true});
		},

		unlikePost: function(postId) {
			var posts;
			var tmpPost;

			this.serverConn.execute(this.serverConn.URL_UNLIKE_POST, {postId: postId});
			this.updatePostInList(this.model.recentPostsMDPModel.listItems, postId, {likedByCurrentUser: false});
			this.updatePostInList(this.model.myPostsMDPModel.listItems, postId, {likedByCurrentUser: false});
			this.updatePostInList(this.model.friendsPostsMDPModel.listItems, postId, {likedByCurrentUser: false});
			this.deletePostFromList(this.model.likedPostsMDPModel.listItems, postId);
		},

		getRecentPosts: function() {
			var posts;
			var tmpPost;

			this.selectMDPModel(this.model.recentPostsMDPModel);
			if (this.model.recentPostsMDPModel.listItems.length() == 0) {
				posts = this.serverConn.execute(this.serverConn.URL_GET_RECENT_POSTS, {sincePostId: undefined});
				this.model.recentPostsMDPModel.listItems.addAll(posts);
			}
			else {
				tmpPost = this.model.recentPostsMDPModel.listItems.get(0);
				posts = this.serverConn.execute(this.serverConn.URL_GET_RECENT_POSTS, {sincePostId: tmpPost.postId});
				this.model.recentPostsMDPModel.listItems.insertAll(0, posts);
			}
		},

		getMyPosts: function() {
			var posts;
			var tmpPost;

			this.selectMDPModel(this.model.myPostsMDPModel);
			if (this.model.myPostsMDPModel.listItems.length() == 0) {
				posts = this.serverConn.execute(this.serverConn.URL_GET_MY_POSTS, {sincePostId: undefined});
				this.model.myPostsMDPModel.listItems.addAll(posts);
			}
			else {
				tmpPost = this.model.myPostsMDPModel.listItems.get(0);
				posts = this.serverConn.execute(this.serverConn.URL_GET_MY_POSTS, {sincePostId: tmpPost.postId});
				this.model.myPostsMDPModel.listItems.insertAll(0, posts);
			}
		},

		getLikedPosts: function() {
			var posts;

			this.selectMDPModel(this.model.likedPostsMDPModel);
			posts = this.serverConn.execute(this.serverConn.URL_GET_LIKED_POSTS);
			this.model.likedPostsMDPModel.listItems.empty();
			this.model.likedPostsMDPModel.listItems.addAll(posts);
		},

		getFriendsPosts: function() {
			var posts;
			var tmpPost;

			this.selectMDPModel(this.model.friendsPostsMDPModel);
			if (this.model.friendsPostsMDPModel.listItems.length() == 0) {
				posts = this.serverConn.execute(this.serverConn.URL_GET_FRIENDS_POSTS, {sincePostId: undefined});
				this.model.friendsPostsMDPModel.listItems.addAll(posts);
			}
			else {
				tmpPost = this.model.friendsPostsMDPModel.listItems.get(0);
				posts = this.serverConn.execute(this.serverConn.URL_GET_FRIENDS_POSTS, {sincePostId: tmpPost.postId});
				this.model.friendsPostsMDPModel.listItems.insertAll(0, posts);
			}
		},

		deletePostFromList: function(posts, postId) {
			var tmpPost;

			for (var i = posts.length() - 1; i >= 0; i--) {
				tmpPost = posts.get(i);
				if (tmpPost.postId == postId) {
					posts.remove(i);
				}
			}
		},

		updatePostInList: function(posts, postId, newValues) {
			var tmpPost;

			for (var i = 0; i < posts.length(); i++) {
				tmpPost = posts.get(i);
				if (tmpPost.postId == postId) {
					for (var prop in newValues) {
						if (newValues[prop] !== undefined) {
							tmpPost[prop] = newValues[prop];
						}
					}
					posts.replace(i, tmpPost);
				}
			}
		}
	};

	var FollowersManager = {
		followUser: function(followeeId) {
			this.serverConn.execute(serverConn.URL_FOLLOW_USER, {followeeId: followeeId});
			this.updateUserInList(this.model.currentMDPModel.listItems, followeeId, {followedByCurrentUser: true});
		},

		unfollowUser: function(followeeId) {
			this.serverConn.execute(serverConn.URL_UNFOLLOW_USER, {followeeId: followeeId});
			if (this.model.currentMDPModel === this.model.followeesMDPModel) {
				this.deleteUserFromList(this.model.currentMDPModel.listItems, followeeId);
			}
			else {
				this.updateUserInList(this.model.currentMDPModel.listItems, followeeId, {followedByCurrentUser: false});
			}
		},

		getAllUsers: function() {
			var users;

			this.selectMDPModel(this.model.allUsersMDPModel);
			users = this.serverConn.execute(this.serverConn.URL_GET_ALL_USERS);
			this.model.allUsersMDPModel.listItems.empty();
			this.model.allUsersMDPModel.listItems.addAll(users);
		},

		getFollowers: function() {
			var users;

			this.selectMDPModel(this.model.followersMDPModel);
			users = this.serverConn.execute(this.serverConn.URL_GET_FOLLOWERS);
			this.model.followersMDPModel.listItems.empty();
			this.model.followersMDPModel.listItems.addAll(users);
		},

		getFollowees: function() {
			var users;

			this.selectMDPModel(this.model.followeesMDPModel);
			users = this.serverConn.execute(this.serverConn.URL_GET_FOLLOWEES);
			this.model.followeesMDPModel.listItems.empty();
			this.model.followeesMDPModel.listItems.addAll(users);
		},

		getLoggedInUser: function() {
			if (this.model.currentUser === undefined) {
				this.model.currentUser = this.serverConn.execute(this.serverConn.URL_GET_LOGGEDIN_USER);
			}
			return this.model.currentUser;
		},

		deleteUserFromList: function(users, userId) {
			var tmpUser;

			for (var i = users.length() - 1; i >= 0; i--) {
				tmpUser = users.get(i);
				if (tmpUser.userId == userId) {
					users.remove(i);
				}
			}
		},

		updateUserInList: function(users, userId, newValues) {
			var tmpUser;

			for (var i = 0; i < users.length(); i++) {
				tmpUser = users.get(i);
				if (tmpUser.userId == userId) {
					for (var prop in newValues) {
						if (newValues[prop] !== undefined) {
							tmpUser[prop] = newValues[prop];
						}
					}
					users.replace(i, tmpUser);
				}
			}
		}
	};

	module.Controller = Controller;

	return module;
}(ConnectFriends || {}));
