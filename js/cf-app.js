var ConnectFriends = (function(module) {
	var ObservableList = DKG_UI.ObservableList;
	var Action = DKG_UI.Action;
	var ActionControl = DKG_UI.ActionControl;
	var Panel = DKG_UI.Panel;
	var ListControl = DKG_UI.ListControl;
	var MainDisplayPanelModel = module.MainDisplayPanelModel;
	var MainDisplayPanel = module.MainDisplayPanel;
	var CreatePostControl = module.CreatePostControl;
	var UserInfoControl = module.UserInfoControl;
	var PostInfoControl = module.PostInfoControl;
	var Controller = module.Controller;

	var App = function(_serverConn) {
		var self = this;

		this.init = function() {
			this.serverConn = _serverConn;

			this.initModel();
			this.initController();
			this.initView(this.controller.getLoggedInUser());

			this.controller.getRecentPosts();
		};

		this.initModel = function() {
			this.model = {
				currentMDPModel:      undefined,
				currentUser:          undefined,
				recentPostsMDPModel:  new MainDisplayPanelModel(new ObservableList(), PostInfoControl, "images/recent-posts.png", "Recent Posts"),
				myPostsMDPModel:      new MainDisplayPanelModel(new ObservableList(), PostInfoControl, "images/my-posts.png", "My Posts"),
				friendsPostsMDPModel: new MainDisplayPanelModel(new ObservableList(), PostInfoControl, "images/friends-posts.png", "Friends' Posts"),
				likedPostsMDPModel:   new MainDisplayPanelModel(new ObservableList(), PostInfoControl, "images/favorite-posts.png", "Favorite Posts"),
				allUsersMDPModel:     new MainDisplayPanelModel(new ObservableList(), UserInfoControl, "", "All Users"),
				followersMDPModel:    new MainDisplayPanelModel(new ObservableList(), UserInfoControl, "images/following-me.png", "Following Me"),
				followeesMDPModel:    new MainDisplayPanelModel(new ObservableList(), UserInfoControl, "images/im-following.png", "I'm Following")
			};
		};

		this.initView = function(currentUser) {
			var postsActions;
			var usersActions;

			postsActions = new ObservableList();
			postsActions.add(new Action("Recent Posts", "showRecentPosts", "images/recent-posts.png"));
			postsActions.add(new Action("My Posts", "showMyPosts", "images/my-posts.png"));
			postsActions.add(new Action("Favorite Posts", "showLikedPosts", "images/favorite-posts.png"));
			postsActions.add(new Action("Friends' Posts", "showFriendsPosts", "images/friends-posts.png"));

			usersActions = new ObservableList();
			usersActions.add(new Action("All Users", "showAllUsers"));
			usersActions.add(new Action("Following Me", "showFollowers", "images/following-me.png"));
			usersActions.add(new Action("I'm Following", "showFollowees", "images/im-following.png"));

			this.view = {
				postsActionPanel: new Panel({icon: "", title: "Posts"}),
				postsActionList: new ListControl(postsActions, ActionControl),
				usersActionPanel: new Panel({icon: "", title: "Colleagues"}),
				usersActionList: new ListControl(usersActions, ActionControl),
				createPostControl: new CreatePostControl(currentUser, {prompt: "", insideInputPrompt: "Enter Status"}),
				mainDisplayPanel: new MainDisplayPanel()
			};
			this.view.postsActionPanel.append(this.view.postsActionList.getControlElement());
			this.view.usersActionPanel.append(this.view.usersActionList.getControlElement());
			this.setupEventHandlers();
		};
		
		this.initController = function() {
			this.controller = new Controller(this.model, this.serverConn, this.mainDisplayPanelUpdatedFunc);
		};

		this.setupEventHandlers = function() {
			this.view.postsActionList.bind("actionPerformed", this.actionPerformed);
			this.view.postsActionList.bind("ListControlEvent", this.listEventHandler);
			this.view.usersActionList.bind("actionPerformed", this.actionPerformed);
			this.view.usersActionList.bind("ListControlEvent", this.listEventHandler);
			this.view.createPostControl.bind("CreatePostControlEvent", this.createPostEventHandler);
			this.view.mainDisplayPanel.bind("PostInfoControlEvent", this.postEventHandler);
			this.view.mainDisplayPanel.bind("UserInfoControlEvent", this.userEventHandler);
		};

		this.actionPerformed = function(e) {
			if (e.action === "showRecentPosts") {
				self.controller.getRecentPosts();
			}
			else if (e.action === "showMyPosts") {
				self.controller.getMyPosts();
			}
			else if (e.action === "showLikedPosts") {
				self.controller.getLikedPosts();
			}
			else if (e.action === "showFriendsPosts") {
				self.controller.getFriendsPosts();
			}
			else if (e.action === "showAllUsers") {
				self.controller.getAllUsers();
			}
			else if (e.action === "showFollowers") {
				self.controller.getFollowers();
			}
			else if (e.action === "showFollowees") {
				self.controller.getFollowees();
			}
		};

		this.listEventHandler = function(e) {
			if (e.subType === "EntrySelected") {
				if (e.list === self.view.postsActionList) {
					self.view.usersActionList.setOptions({showSelectedEntry: false});
					self.view.postsActionList.setOptions({showSelectedEntry: true});
				}
				else if (e.list === self.view.usersActionList) {
					self.view.postsActionList.setOptions({showSelectedEntry: false});
					self.view.usersActionList.setOptions({showSelectedEntry: true});
				}
			}
		};

		this.mainDisplayPanelUpdatedFunc = function() {
			self.view.mainDisplayPanel.setModel(this.model.currentMDPModel);
		};

		this.postEventHandler = function(e) {
			if (e.subType === "SubmitComment") {
				self.controller.commentOnPost(e.commentOnPostId, e.comment);
			}
			else if (e.subType === "LikePost") {
				self.controller.likePost(e.postId);
			}
			else if (e.subType === "DeletePost") {
				self.controller.deletePost(e.postId);
			}
			else if (e.subType === "UnlikePost") {
				self.controller.unlikePost(e.postId);
			}
		};

		this.userEventHandler = function(e) {
			if (e.subType === "FollowUser") {
				self.controller.followUser(e.userId);
			}
			if (e.subType === "UnfollowUser") {
				self.controller.unfollowUser(e.userId);
			}
		};

		this.createPostEventHandler = function(e) {
			if (e.subType === "Submit") {
				self.controller.submitPost(e.post);
			}
		};

		this.init();
	};

	module.App = App;

	return module;
}(ConnectFriends || {}));
