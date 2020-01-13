var DKG_UI = (function(module) {
	var EventBindable = {
		createEventListenerElem: function(eventListenerElem) {
			if (eventListenerElem === undefined) {
				this.eventListenerElem = $("<div></div>");
			}
			else {
				this.eventListenerElem = eventListenerElem;
			}
		},

		bind: function(eventName, eventHandler) {
			this.eventListenerElem.bind(eventName, eventHandler);
		},

		unbind: function(eventName, eventHandler) {
			this.eventListenerElem.unbind(eventName, eventHandler);
		},

		trigger: function(triggerOptions) {
			this.eventListenerElem.trigger(triggerOptions);
		},

		mixin: function(target, eventListenerElem) {
			for (var prop in EventBindable) {
				if (prop == "mixin") {
					continue;
				}
				target[prop] = EventBindable[prop];
			}
			target.createEventListenerElem(eventListenerElem);
		}
	};

	module.EventBindable = EventBindable;

	return module;
}(DKG_UI || {}));


var DKG_UI = (function(module) {
	var EventBindable = module.EventBindable;

	var ObservableList = function() {
		var self = this;

		this.init = function() {
			this.itemsArr = [];
			EventBindable.mixin(this);
		};

		this.length = function() {
			return this.itemsArr.length;
		};

		this.replace = function(index, _newItem) {
			var oldItem;

			if (index >= 0 && index <= (this.length() - 1)) {
				oldItem = this.itemsArr[index];
				this.itemsArr[index] = _newItem;
				this.trigger({type: "listChanged", action: "itemReplaced", replacePosition: index, oldItem: oldItem, newItem: _newItem});
			}
		};

		this.add = function(_newItem) {
			this.itemsArr[this.length()] = _newItem;
			this.trigger({type: "listChanged", action: "itemAdded", item: _newItem});
		};

		this.addAll = function(_newItems) {
			for (var i = 0; i < _newItems.length; i++) {
				this.add(_newItems[i]);
			}
		};

		this.insert = function(index, _newItem) {
			if (index >= 0 && index <= (this.length() - 1)) {
				this.itemsArr.splice(index, 0, _newItem);
				this.trigger({type: "listChanged", action: "itemInserted", insertPosition: index, item: _newItem});
			}
		};

		this.insertAll = function(index, _newItems) {
			for (var i = _newItems.length - 1; i >= 0; i--) {
				this.insert(index, _newItems[i]);
			}
		};

		this.remove = function(index) {
			var itemRemoved;

			if (index >= 0 && index <= (this.length() - 1)) {
				itemRemoved = this.itemsArr[index];
				this.itemsArr.splice(index, 1);
				this.trigger({type: "listChanged", action: "itemRemoved", deletePosition: index, item: itemRemoved});
			}
		};

		this.empty = function() {
			this.itemsArr = [];
			this.trigger({type: "listChanged", action: "emptied"});
		};

		this.get = function(index) {
			var item;

			if (index >= 0 && index <= (this.length() - 1)) {
				item = this.itemsArr[index];
			}
			else {
				item = undefined;
			}

			return item;
		};

		this.init();
	};

	module.ObservableList = ObservableList;

	return module;
}(DKG_UI || {}));


var DKG_UI = (function(module) {
	var EventBindable = module.EventBindable;
	var ObservableList = module.ObservableList;

	var ListControl = function(_model, _rendererClass, _width) {
		var self = this;

		this.init = function() {
			var tmpRendererControl;

			this.model = _model;
			this.width = _width;
			this.selectedEntry = undefined;
			this.options = {
				showRollOver: true,
				showSelectedEntry: true,
				emptyListMessage: "There are no items to display."
			};
			this.rendererClass = _rendererClass;
			this.rendererControls = new ObservableList();
			this.listElements = new ObservableList();
			this.createControlElement();

			for (var i = 0; i < this.model.length(); i++) {
				tmpRendererControl = this.createRendererControl(this.model.get(i));
				this.addEntry(tmpRendererControl);
			}

			this.model.bind("listChanged", this.modelChanged);
			EventBindable.mixin(this, this.controlElement);
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
			if (this.width != undefined) {
				this.controlElement.css({width: this.width});
			}
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.toHTML = function() {
			var html;

			html = "";
			html += "<div class='list-control'>";
			html += "	<div class='entries'></div>";
			html += "	<div class='empty-list-message'>" + this.options.emptyListMessage + "</div>";
			html += "</div>";

			return html;
		};

		this.entryWrapperHTML = function() {
			return "<div class='list-control-entry'></div>";
		};

		this.setModel = function(newModel) {
			var tmpRendererControl;

			this.model.unbind("listChanged");
			this.emptyEntries();

			this.model = newModel;
			for (var i = 0; i < this.model.length(); i++) {
				tmpRendererControl = this.createRendererControl(this.model.get(i));
				this.addEntry(tmpRendererControl);
			}
			this.model.bind("listChanged", this.modelChanged);
		};

		this.setOptions = function(newOptions) {
			if (newOptions.showRollOver !== undefined) {
				this.options.showRollOver = newOptions.showRollOver;
			}

			if (newOptions.showSelectedEntry !== undefined) {
				this.options.showSelectedEntry = newOptions.showSelectedEntry;
				if (this.options.showSelectedEntry === false && this.selectedEntry !== undefined) {
					this.selectedEntry.removeClass("selected-entry");
				}
				else if (this.options.showSelectedEntry === true && this.selectedEntry !== undefined) {
					this.selectedEntry.addClass("selected-entry");
				}
			}

			if (newOptions.emptyListMessage !== undefined) {
				this.options.emptyListMessage = newOptions.emptyListMessage;
				this.controlElement.find(".empty-list-message").html(this.options.emptyListMessage);
			}
		};

		this.hideEmptyListMessage = function() {
			this.controlElement.find(".empty-list-message").hide();
		};

		this.showEmptyListMessage = function() {
			this.controlElement.find(".empty-list-message").show();
		};

		this.highlightEntry = function(entry) {
			if (this.options.showRollOver === true) {
				entry.addClass("highlighted-entry");
			}
		};

		this.unhighlightEntry = function(entry) {
			entry.removeClass("highlighted-entry");
		};

		this.selectEntryAtPos = function(entryPos) {
			var entry;

			entry = this.listElements.get(entryPos);
			if (entry !== undefined) {
				this.selectEntry(entry);
			}
		};

		this.selectEntry = function(entry) {
			this.unselectEntry();
			this.selectedEntry = entry;
			this.selectedEntry.attr("selected", "yes");
			if (this.options.showSelectedEntry === true) {
				this.selectedEntry.addClass("selected-entry");
			}
			this.trigger({type: "ListControlEvent", subType: "EntrySelected", list: this});
		};

		this.unselectEntry = function() {
			if (this.selectedEntry !== undefined) {
				this.selectedEntry.attr("selected", "");
				this.selectedEntry.removeClass("selected-entry");
			}
		};

		this.entryMouseEnter = function(e) {
			self.highlightEntry($(this));
		};

		this.entryMouseLeave = function(e) {
			self.unhighlightEntry($(this));
		};

		this.entryClicked = function(e) {
			self.selectEntry($(this));
		};

		this.modelChanged = function(e) {
			if (e.action === "itemAdded") {
				self.addEntry(self.createRendererControl(e.item));
			}
			else if (e.action === "itemReplaced") {
				self.replaceEntry(e.replacePosition, self.createRendererControl(e.newItem));
			}
			else if (e.action === "itemInserted") {
				self.insertEntry(e.insertPosition, self.createRendererControl(e.item));
			}
			else if (e.action === "itemRemoved") {
				self.removeEntry(e.deletePosition);
			}
			else if (e.action === "emptied") {
				self.emptyEntries();
			}
		};

		this.createRendererControl = function(modelItem) {
			return new this.rendererClass(modelItem, this.width);
		};

		this.createWrappedElement = function(rendererControl) {
			var wrapperElement;

			wrapperElement = $(this.entryWrapperHTML());
			wrapperElement.append(rendererControl.getControlElement());
			wrapperElement.bind("mouseenter", this.entryMouseEnter);
			wrapperElement.bind("mouseleave", this.entryMouseLeave);
			wrapperElement.bind("click", this.entryClicked);

			return wrapperElement;
		};

		this.addEntry = function(rendererControl) {
			var newWrappedElement;

			newWrappedElement = this.createWrappedElement(rendererControl);
			this.controlElement.find(".entries").append(newWrappedElement);
			this.rendererControls.add(rendererControl);
			this.listElements.add(newWrappedElement);
			this.hideEmptyListMessage();
		};

		this.replaceEntry = function(index, rendererControl) {
			var tmpWrappedElement;
			var newWrappedElement;
			var isSelected;

			if (index >= 0 && index < this.listElements.length()) {
				tmpWrappedElement = this.listElements.get(index);
				newWrappedElement = this.createWrappedElement(rendererControl);
				isSelected = tmpWrappedElement.attr("selected");
				if (isSelected !== undefined && isSelected === "yes") {
					this.selectEntry(newWrappedElement);
				}
				tmpWrappedElement.replaceWith(newWrappedElement);
				this.rendererControls.replace(index, rendererControl);
				this.listElements.replace(index, newWrappedElement);
			}
		};

		this.insertEntry = function(index, rendererControl) {
			var tmpWrappedElement;
			var newWrappedElement;

			if (index >= 0 && index < this.listElements.length()) {
				tmpWrappedElement = this.listElements.get(index);
				newWrappedElement = this.createWrappedElement(rendererControl);
				tmpWrappedElement.before(newWrappedElement);
				this.rendererControls.insert(index, rendererControl);
				this.listElements.insert(index, newWrappedElement);
			}
		};

		this.removeEntry = function(index) {
			var tmpWrappedElement;
			var isSelected;

			if (index >= 0 && index < this.listElements.length()) {
				tmpWrappedElement = this.listElements.get(index);
				isSelected = tmpWrappedElement.attr("selected");
				if (isSelected !== undefined && isSelected === "yes") {
					this.unselectEntry();
				}
				tmpWrappedElement.remove();
				this.rendererControls.remove(index);
				this.listElements.remove(index);

				if (this.listElements.length() === 0) {
					this.showEmptyListMessage();
				}
			}
		};

		this.emptyEntries = function() {
			this.unselectEntry();
			this.controlElement.find(".entries").empty();
			this.rendererControls.empty();
			this.listElements.empty();
			this.showEmptyListMessage();
		};

		this.init();
	};

	module.ListControl = ListControl;

	return module;
}(DKG_UI || {}));


var DKG_UI = (function(module) {
	var EventBindable = module.EventBindable;
	var ObservableList = module.ObservableList;

	var Action = function(_label, _action, _icon) {
		this.init = function() {
			this.label = _label;
			this.action = _action;
			this.icon = _icon;
		};

		this.init();
	};

	var ActionControl = function(_action) {
		var self = this;

		this.init = function() {
			this.action = _action;
			this.createControlElement();
			EventBindable.mixin(this, this.controlElement);
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
			this.controlElement.bind("click", this.clicked);
		};

		this.clicked = function() {
			self.trigger({type: "actionPerformed", action: self.action.action});
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.toHTML = function() {
			var template;
			var html;
			var icon;

			template = "<div class='action-control' action=':action:'>:icon:<div class='label'>:label:</div><div style='clear: both;'></div></div>";
			if (this.action.icon !== undefined && this.action.icon !== "") {
				icon = "<img class='icon' src='" + this.action.icon + "'>";
			}
			else {
				icon = "";
			}
			html = template
				.replace(/:action:/g, this.action.action)
				.replace(/:icon:/g, icon)
				.replace(/:label:/g, this.action.label);

			return html;
		};

		this.init();
	};

	var SimpleActionListControl = function(_model, _rendererClass) {
		var self = this;

		this.init = function() {
			var tmpRendererControl;
			var newWrappedElement;

			this.model = _model;
			this.rendererClass = _rendererClass;
			this.rendererControls = new ObservableList();
			this.createControlElement();

			for (var i = 0; i < this.model.length(); i++) {
				tmpRendererControl = new this.rendererClass(this.model.get(i));
				newWrappedElement = $("<div class='simple-list-control-entry'></div>");
				newWrappedElement.append(tmpRendererControl.getControlElement());
				this.controlElement.append(newWrappedElement);
				this.rendererControls.add(tmpRendererControl);
			}
			this.controlElement.append($("<div style='clear: both;'></div>"));

			EventBindable.mixin(this, this.controlElement);
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.toHTML = function() {
			return "<div class='simple-action-list-control'></div>";
		};

		this.init();
	};

	module.Action = Action;
	module.ActionControl = ActionControl;
	module.SimpleActionListControl = SimpleActionListControl;

	return module;
}(DKG_UI || {}));


var DKG_UI = (function(module) {
	var Panel = function(_options) {
		var self = this;

		this.init = function() {
			this.options = _options;
			this.createControlElement();
		};

		this.createControlElement = function() {
			this.controlElement = $(this.toHTML());
		};

		this.getControlElement = function() {
			return this.controlElement;
		};

		this.append = function(elem) {
			this.controlElement.find(".content").append(elem);
		};

		this.showHeader = function() {
			this.controlElement.find(".header").show();
		};
		
		this.hideHeader = function() {
			this.controlElement.find(".header").hide();
		};

		this.setOptions = function(newOptions) {
			var icon;

			if (newOptions.icon !== undefined) {
				this.options.icon = newOptions.icon;
				if (this.options.icon !== "") {
					icon = "<img class='icon' src='" + this.options.icon + "'>";
				}
				else {
					icon = "<div class='icon'></div>";
				}
				this.controlElement.find(".icon").replaceWith(icon);
			}

			if (newOptions.title !== undefined) {
				this.options.title = newOptions.title;
				this.controlElement.find(".title").text(this.options.title);
			}
		};

		this.toHTML = function() {
			var template;
			var html;
			var icon;

			template = "";
			template += "<div class='panel-control'>";
			template += "	<div class='header'>";
			template += "		:icon:<div class='title'>:title:</div>";
			template += "	</div>";
			template += "	<div class='content'></div>";
			template += "</div>";

			if (this.options.icon !== undefined && this.options.icon !== "") {
				icon = "<img class='icon' src='" + this.options.icon + "'>";
			}
			else {
				icon = "<div class='icon'></div>";
			}
			html = template
				.replace(/:icon:/g, icon)
				.replace(/:title:/g, this.options.title);
			
			return html;
		};

		this.init();
	};

	module.Panel = Panel;

	return module;
}(DKG_UI || {}));


var DKG_UI = (function(module) {
	var ModeSelector = {
		DEFAULT_MODE: "__default__",

		DEFAULT_MODE_ATTR_NAME: "mode",

		MODE_CLASS_PAIR_PATTERN: /[^:]*:([^;]*);*/,

		mode: undefined,

		modeOptions: {modeAttributeName: "mode", searchDepth: -1},

		getMode: function() {
			return this.mode;
		},

		setMode: function(_mode) {
			var elemArr;
			var modeSearchPattern;
			var modeClassSearchPattern;
			var elemModeClass;

			if (_mode !== undefined && this.mode !== _mode) {
				this.mode = _mode;

				modeSearchPattern = new RegExp(
					"^" + this.mode + "$|" +
					"^" + this.mode + ",|" +
					"," + this.mode + ",|" +
					"," + this.mode + "$"
				);
				modeClassSearchPattern = new RegExp(
					"^" + this.mode + ":[^;]*$|" +
					"^" + this.mode + ":[^;]*;|" +
					";" + this.mode + ":[^;]*;|" +
					";" + this.mode + ":[^;]*$"
				);

				elemArr = $(this).find("*[mode],*[mode_class]");
				for (var i = 0; i < elemArr.length; i++) {
					this.toggleElement(elemArr[i], modeSearchPattern);
					elemModeClass = $(elemArr[i]).attr("mode_class");
					if (elemModeClass !== undefined && elemModeClass !== "") {
						this.setElementClass(elemArr[i], modeClassSearchPattern);
					}
				}
			}
		},

		toggleElement: function(elem, modeSearchPattern) {
			var elemMode;

			// hide/show element based on its modes
			elemMode = $(elem).attr("mode");
			if (elemMode !== undefined && elemMode !== "") {
				if (modeSearchPattern.test(elemMode) === true) {
					$(elem).show();
				}
				else {
					$(elem).hide();
				}
			}
		},

		setElementClass: function(elem, modeClassSearchPattern) {
			var elemModeClass;
			var matchResults;
			var modeClassMatchStr;
			var tmpClass;

			// change class attribute element based on its modeClasses
			if (this.mode === this.DEFAULT_MODE) {
				tmpClass = $(elem).attr("defaultClass");
				$(elem).removeClass().addClass(tmpClass);
			}
			else {
				elemModeClass = $(elem).attr("mode_class");
				if (elemModeClass !== undefined && elemModeClass !== "") {
					matchResults = elemModeClass.match(modeClassSearchPattern);
					if (matchResults !== null) {
						modeClassMatchStr = matchResults[0];
						matchResults = modeClassMatchStr.match(this.MODE_CLASS_PAIR_PATTERN);
						tmpClass = matchResults[1];
					}
					else {
						tmpClass = $(elem).attr("defaultClass");
					}
					$(elem).removeClass().addClass(tmpClass);
				}
			}
		},

		saveDefaultClass: function() {
			$(this).find("*[mode_class]").each(function(index, elem) {
				$(elem).attr("defaultClass", $(elem).attr("class"));
			});
		},

		resetMode: function() {
			this.setMode(this.DEFAULT_MODE);
		},

		setOptions: function(_options) {
			if (_options !== undefined) {
				for (var opt in _options) {
					this.modeOptions[opt] = _options[opt];
				}
			}
		},

		mixin: function(targetElement) {
			for (var prop in ModeSelector) {
				if (prop == "mixin") {
					continue;
				}
				targetElement[prop] = ModeSelector[prop];
			}
			targetElement.saveDefaultClass();
			targetElement.resetMode();
		}
	};

	module.ModeSelector = ModeSelector;

	return module;
}(DKG_UI || {}));
