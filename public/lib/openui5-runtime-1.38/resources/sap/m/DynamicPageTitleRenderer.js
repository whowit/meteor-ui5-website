/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var D={};D.render=function(r,d){var a=d._getOverflowToolbar(),l=d.getHeading(),s=d.getSnappedContent(),e=d.getExpandedContent();r.write("<div");r.writeControlData(d);r.writeAccessibilityState({role:"heading",level:2});r.addClass("sapContrastPlus");r.addClass("sapMDynamicPageTitle");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMDynamicPageTitleLeft");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMDynamicPageTitleLeftInner");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMDynamicPageTitleLeftHeading");r.writeClasses();r.write(">");r.renderControl(l);r.write("</div>");if(s.length>0||e.length>0){r.write("<div");r.addClass("sapMDynamicPageTitleLeftSnappedExpandContent");r.writeClasses();r.write(">");D._renderSnappedContent(r,d,s);D._renderExpandContent(r,d,e);r.write("</div>");}r.write("</div>");r.write("</div>");r.write("<div");r.addClass("sapMDynamicPageTitleRight");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMDynamicPageTitleRightActions");r.writeClasses();r.write(">");if(a.getContent().length>0){r.renderControl(a);}r.write("</div>");r.write("</div>");r.write("</div>");};D._renderExpandContent=function(r,d,e){if(e.length>0){r.write("<div");r.writeAttributeEscaped("id",d.getId()+'-expand-wrapper');r.writeClasses();r.write(">");e.forEach(r.renderControl);r.write("</div>");}};D._renderSnappedContent=function(r,d,s){if(s.length>0){r.write("<div");r.writeAttributeEscaped("id",d.getId()+'-snapped-wrapper');if(!d._getShowSnapContent()){r.addClass("sapUiHidden");}r.addClass("sapMDynamicPageTitleSnapped");r.writeClasses();r.write(">");s.forEach(r.renderControl);r.write("</div>");}};return D;},true);