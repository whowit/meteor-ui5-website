sap.ui.define([
	"sap/m/Page"
], function (Page, SourceCodeViewer) {
	"use strict";
	return Page.extend("meteor-ui5-demo.control.DemoCodePage", {
		metadata : {
			properties : {
				demoView: 	{type : "string"}
			}
		},
		onBeforeRendering: function(){
				debugger;
		},

		init : function () {
				debugger;
		},
		renderer: {}
	});
});
