var ConnectFriends = (function(module) {
	var EventBindable = DKG_UI.EventBindable;
	var ObservableList = DKG_UI.ObservableList;
	var Action = DKG_UI.Action;
	var SimpleActionListControl = DKG_UI.SimpleActionListControl;
	var ActionControl = DKG_UI.ActionControl;

	var UserInfoControl = function(_userInfo) {
		var self = this;

		this.init = function() {
			this.userInfo = _userInfo;

			if (this.userInfo.photo === undefined || this.userInfo.photo === "") {
				this.userInfo.photo = "no_photo.gif";
			}
			this.actions = new ObservableList();
			if (this.userInfo.followedByCurrentUser === true) {
				this.actions.add(new Action("Unfollow", "unfollowUser"));
			}
			else {
				this.actions.add(new Action("Follow", "followUser"));
			}
			this.actionListControl = new SimpleActionListControl(this.actions, ActionControl);
			this.actionListControl.bind("actionPerformed", this.actionPerformed);

			this.createControlElement();
			EventBindable.mixin(this, this.controlElement);
			this.controlElement.find(".buttons-panel").append(this.actionListControl.getControlElement());
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
		};

		this.actionPerformed = function(e) {
			if (e.action === "followUser") {
				self.trigger({type: "UserInfoControlEvent", subType: "FollowUser", userId: self.userInfo.userId});
			}
			else if (e.action === "unfollowUser") {
				self.trigger({type: "UserInfoControlEvent", subType: "UnfollowUser", userId: self.userInfo.userId});
			}
			else {
				alert(e.action);
			}
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.toHTML = function() {
			var template;
			var html;

			template  = "";
			template += "<div class='user-info-control'>";
			template += "	<div class='photo'><img src=':photo:'></div>";
			template += "	<div class='details'>";
			template += "		<div class='name'>:lastName:, :firstName:</div>";
			template += "		<div class='position'>:position:</div>";
			template += "		<div class='buttons-panel'></div>";
			template += "	</div>";
			template += "	<div style='clear: both;'></div>";
			template += "</div>";

			html = template
				.replace(/:photo:/g, "images/" + this.userInfo.photo)
				.replace(/:firstName:/g, this.userInfo.firstName)
				.replace(/:lastName:/g, this.userInfo.lastName)
				.replace(/:position:/g, this.userInfo.position);

			return html;
		};

		this.init();
	};

	module.UserInfoControl = UserInfoControl;

	return module;
}(ConnectFriends || {}));
