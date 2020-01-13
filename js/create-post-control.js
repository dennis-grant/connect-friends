var ConnectFriends = (function(module) {
	var EventBindable = DKG_UI.EventBindable;

	var CreatePostControl = function(_currentUser, _options) {
		var self = this;

		this.init = function() {
			this.options = {prompt: "", insideInputPrompt: "", maxLength: 1000};
			this.currentUser = _currentUser;
			if (_options !== undefined) {
				$.extend(this.options, _options);
			}
			this.createControlElement();
			EventBindable.mixin(this, this.controlElement);
			this.shrink();
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
			this.controlElement.find("textarea")
				.bind("keyup", this.inputFieldKeyUped)
				.bind("focus", this.inputFieldFocused)
				.bind("blur", this.inputFieldBlured);
			this.controlElement.find("button").bind("click", this.postButtonClicked);
			this.controlElement.find("button").bind("mouseenter", this.postButtonOver);
			this.controlElement.find("button").bind("mouseleave", this.postButtonOut);
			this.updateCharCount();
		};

		this.inputFieldKeyUped = function() {
			self.updateCharCount()
		};

		this.inputFieldFocused = function() {
			self.expand();
		};

		this.inputFieldBlured = function() {
			self.shrink();
		};

		this.postButtonClicked = function() {
			self.trigger({type: "CreatePostControlEvent", subType: "Submit", post: self.getVal()});
			self.setVal("");
			self.shrink();
		};

		this.postButtonOver = function() {
			var button;
			button = $(this);
			button.addClass("hover");
		};

		this.postButtonOut = function() {
			var button;
			button = $(this);
			button.removeClass("hover");
		};

		this.toHTML = function() {
			var html;
			var template;

			template  = '';
			template += '<div class="submit-post-control">';
			template += '	<div class="current-user-name">:fullName:</div>';
			template += '	<div class="title">';
			template += '		<div class="prompt">:prompt:</div>';
			template += '		<div class="chars-remaining"></div>';
			template += '		<div style="clear: both;"></div>';
			template += '	</div>';
			template += '	<textarea></textarea>';
			template += '	<div class="button-panel">';
			template += '		<button>Post</button>';
			template += '		<div style="clear: both;"></div>';
			template += '	</div>';
			template += '</div>';

			html = template
				.replace(/:fullName:/g, this.currentUser.firstName + " " + this.currentUser.lastName)
				.replace(/:prompt:/g, this.options.prompt);

			return html;
		};

		this.getVal = function() {
			return this.controlElement.find("textarea").val();
		};

		this.setVal = function(val) {
			self.controlElement.find("textarea").val(val);
			self.updateCharCount();
		};

		this.updateCharCount = function() {
			var val;
			var charsRemaining;

			val = this.getVal();
			charsRemaining = self.options.maxLength - val.length;
			if (charsRemaining < 0) {
				charsRemaining = 0;
				this.setVal(val.substring(0, self.options.maxLength));
			}
			this.controlElement.find(".title .chars-remaining").text(charsRemaining);
		};

		this.shrink = function() {
			if (this.options.insideInputPrompt !== undefined && $.trim(this.getVal()) === "") {
				this.controlElement.find(".title").hide();
				this.controlElement.find("textarea").removeClass("expanded").addClass("shrunken");
				this.controlElement.find(".button-panel").hide();
				this.setVal(this.options.insideInputPrompt);
				this.trigger({type: "CreatePostControlEvent", subType: "Shrink", control: this});
			}
		};

		this.expand = function() {
			if (this.options.insideInputPrompt !== undefined && $.trim(this.getVal()) === this.options.insideInputPrompt) {
				this.controlElement.find(".title").show();
				this.controlElement.find("textarea").removeClass("shrunken").addClass("expanded");
				this.controlElement.find(".button-panel").show();
				this.setVal("");
				this.trigger({type: "CreatePostControlEvent", subType: "Expand", control: this});
			}
		};

		this.init();
	};

	module.CreatePostControl = CreatePostControl;

	return module;
}(ConnectFriends || {}));
