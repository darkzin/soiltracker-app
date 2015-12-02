/*
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function (document) {
    'use strict';

    window.addEventListener('WebComponentsReady', function() {
    });
    // Grab a reference to our auto-binding template
    // and give it some initial binding values
    // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
    var app = document.querySelector('#app');

    app.properties = {
        conditions: {
            type: Array,
            value: function () {
                return [];
            },
            observer: "_conditionsChanged"
        },
        conditionNames: {
            type: Array,
            value: function () {
                return [];
            },
        },
    };

    app._conditionsChanged = function (newValue, oldValue) {
        // this observer used for a setter of condition property,
        // and set conditionNames property.
        // I don't use computed method for conditionNames because setting order of conditions.
        var conditions;

        if (!!newValue.Items) {
            conditions = newValue.Items;
        }
        else {
            conditions = newValue;
        }

        this.conditions = conditions;
        this.conditionNames = this._aggregateConditionNames(conditions);
    };

    app._aggregateConditionNames = function (conditions) {
        return conditions.map(function (item) {
            return item.condition_name;
        });
    };

    app.selectCondition = function(e){
        // when you click the list item, fill content of setConditionPage, then move to that page.
        var selectedCondition = document.querySelector('#selectedCondition');
        var listbox = e.target;
        var item = e.detail.item;
        var index = listbox.indexOf(item);
        selectedCondition.data = {};

        // copy data, not reference. because template object holded data-binding.
        // if you copy the reference, you'll loose data-binding.
        for(var propertyName in this.conditions[index]){
            selectedCondition.set("data." + propertyName, this.conditions[index][propertyName]);
        }

        // set old-condition-name same as condition-name.
        // this is used to check whether this data is new or not.
        selectedCondition.old_condition_name = selectedCondition.condition_name;

        this.set("route", "set-condition");
    };

    app.saveCondition = function(e){
        var ajaxElement = document.querySelector("iron-ajax#saveCondition");
        var selectedCondition = document.querySelector("#selectedCondition");

        ajaxElement.body = selectedCondition.data;
        //ajaxElement.body = selectedCondition
        ajaxElement.generateRequest();
    };

    app.handleAjaxResponse = function(res){
        console.log(res);
    };

    app.route = "conditions";

    // App configuration. this is global option.
    app.set("config", {});
    app.set("config.invokeUrl", "https://acqc5u2aol.execute-api.us-west-2.amazonaws.com/prod");
    //app.config.invokeUrl = "https://acqc5u2aol.execute-api.us-west-2.amazonaws.com/prod";

    app.displayInstalledToast = function () {
        // Check to make sure caching is actually enabled—it won't be in the dev environment.
        if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
            Polymer.dom(document).querySelector('#caching-complete').show();
        }
    };

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page
    app.addEventListener('dom-change', function () {
        preparePages();
    });

    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function () {
        // imports are loaded and elements have been registered
    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onDataRouteClick = function () {
        var drawerPanel = Polymer.dom(document).querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

    // Scroll page to top and expand header
    app.scrollPageToTop = function () {
        //app.$.headerPanelMain.scrollToTop(true);
    };

})(document);


