var ConnectFriends = (function(module) {
	var EventBindable = DKG_UI.EventBindable;
	var ObservableList = DKG_UI.ObservableList;
	var Action = DKG_UI.Action;
	var ActionControl = DKG_UI.ActionControl;
	var SimpleActionListControl = DKG_UI.SimpleActionListControl;
	var CreatePostControl = module.CreatePostControl;

	var PostInfoControl = function(_postInfo) {
		var self = this;

		this.init = function() {
			this.postInfo = _postInfo;
			if (this.postInfo.postedBy.photo === undefined || this.postInfo.postedBy.photo === "") {
				this.postInfo.postedBy.photo = "no_photo.gif";
			}
			this.commentControlVisible = undefined;

			this.actions = new ObservableList();
			this.actions.add(new Action("Comment", "showComment"));
			if (this.postInfo.permissions.canDelete === true) {
				this.actions.add(new Action("Delete", "deletePost"));
			}
			if (this.postInfo.likedByCurrentUser === true) {
				this.actions.add(new Action("Unlike", "unlikePost"));
			}
			else {
				this.actions.add(new Action("Like", "likePost"));
			}
			this.actionListControl = new SimpleActionListControl(this.actions, ActionControl);
			this.actionListControl.bind("actionPerformed", this.actionPerformed);

			this.createCommentControl = new CreatePostControl(this.postInfo.currentUser, {prompt: "Comment", insideInputPrompt: "Enter Comment"});
			this.createCommentControl.bind("CreatePostControlEvent", this.handleCommentControlEvent);

			this.createControlElement();
			EventBindable.mixin(this, this.controlElement);
			this.controlElement.find(".buttons-panel").append(this.actionListControl.getControlElement());
			this.controlElement.find(".buttons-panel").append($("<div style='clear: both;'></div>"));
			this.controlElement.find(".comment-entry-container").append(this.createCommentControl.getControlElement());

			this.hideCommentControl();
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
		};

		this.actionPerformed = function(e) {
			if (e.action === "showComment") {
				self.showCommentControl();
			}
			else if (e.action === "deletePost") {
				self.trigger({type: "PostInfoControlEvent", subType: "DeletePost", postId: self.postInfo.postId});
			}
			else if (e.action === "likePost") {
				self.trigger({type: "PostInfoControlEvent", subType: "LikePost", postId: self.postInfo.postId});
			}
			else if (e.action === "unlikePost") {
				self.trigger({type: "PostInfoControlEvent", subType: "UnlikePost", postId: self.postInfo.postId});
			}
		};

		this.handleCommentControlEvent = function(e) {
			if (e.subType === "Shrink") {
				self.hideCommentControl();
			}
			else if (e.subType === "Submit") {
				self.trigger({type: "PostInfoControlEvent", subType: "SubmitComment", comment: e.post, commentOnPostId: self.postInfo.postId});
			}
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.toHTML = function() {
			var template;
			var html;

			template  = "";
			template += "<div class='post-info-control'>";
			template += "	<div class='photo'><img src=':photo:'></div>";
			template += "	<div class='details'>";
			template += "		<div class='name'>:userFullName:</div>";
			template += "		<div class='post'>:post:</div>";
			template += "		<div class='buttons-panel'></div>";
			template += "		<div class='comment-entry-container'></div>";
			template += "	</div>";
			template += "	<div style='clear: both;'></div>";
			template += "</div>";

			html = template
				.replace(/:photo:/g, "images/" + this.postInfo.postedBy.photo)
				.replace(/:userFullName:/g, this.postInfo.postedBy.firstName + " " + this.postInfo.postedBy.lastName)
				.replace(/:post:/g, this.postInfo.post);

			return html;
		};

		this.hideCommentControl = function() {
			this.controlElement.find(".comment-entry-container").hide();
			this.commentControlVisible = false;
		};

		this.showCommentControl = function() {
			if (this.commentControlVisible === false) {
				this.controlElement.find(".comment-entry-container").show();
				this.commentControlVisible = true;
			}
		};

		this.init();
	};

	module.PostInfoControl = PostInfoControl;

	return module;
}(ConnectFriends || {}));
