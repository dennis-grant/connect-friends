var ConnectFriends = (function(module) {
	var ObservableList = DKG_UI.ObservableList;
	var Panel = DKG_UI.Panel;
	var ListControl = DKG_UI.ListControl;
	var EventBindable = DKG_UI.EventBindable;

	var MainDisplayPanel = function(_model) {
		var self = this;

		this.init = function() {
			if (_model === undefined) {
				this.model =  new MainDisplayPanelModel(new ObservableList(), undefined, "", "MDP Title");
			}
			else {
				this.model = _model;
			}
			this.panel = new Panel({icon: this.model.icon, title: this.model.title});
			this.panel.getControlElement().addClass("main-display-panel");
			this.displayList = new ListControl(this.model.listItems, this.model.itemRendererClass);
			this.displayList.setOptions({showSelectedEntry: false});
			this.panel.append(this.displayList.getControlElement());
			EventBindable.mixin(this, this.panel.getControlElement());
		};

		this.getControlElement = function() {
			return this.panel.getControlElement();
		};

		this.setModel = function(newModel) {
			this.model = newModel;
			this.panel.setOptions({icon: this.model.icon, title: this.model.title});
			this.displayList.rendererClass = this.model.itemRendererClass;
			this.displayList.setModel(this.model.listItems);
		};

		this.setOptions = function(newOptions) {
			this.panel.setOptions(newOptions);
		};

		this.showHeader = function() {
			this.panel.showHeader();
		};

		this.hideHeader = function() {
			this.panel.hideHeader();
		};

		this.init();
	};

	var MainDisplayPanelModel = function(_listItems, _itemRendererClass, _icon, _title) {
		this.init = function() {
			this.listItems = _listItems;
			this.itemRendererClass = _itemRendererClass;
			this.icon = _icon;
			this.title = _title;
		};

		this.init();
	};

	module.MainDisplayPanel = MainDisplayPanel;
	module.MainDisplayPanelModel = MainDisplayPanelModel;

	return module;
}(ConnectFriends || {}));
