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

    // Grab a reference to our auto-binding template
    // and give it some initial binding values
    // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
    var app = document.querySelector('#app');

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page
    app.addEventListener('dom-change', function () {
        var pageSelector = document.querySelector("iron-pages");
        pageSelector.addEventListener('iron-select', function (e) {
            var page = e.detail.item;
            var ajaxElements = page.querySelectorAll("iron-ajax");
            var length = ajaxElements.length;

            for (var i = 0; i < length; i++) {
                var element = ajaxElements[i];
                // need this process because compound binding bug T.T
                if (!!element.body && !!element.body.match && element.body.match(/\{.*\}/) == null) {
                    element.body = "{" + element.body;
                }
                ;
                element.generateRequest();
            }
            ;
        });
    });

    app.properties = {
        config: {
            type: Object,
            value: function () {
                return {
                    userName: "amoretspero",
                    invokeUrl: "https://acqc5u2aol.execute-api.us-west-2.amazonaws.com/prod/",
                    deviceId: "snucse2015-iot",
                }
            },
        },
        device: {
            type: Object,
            value: function () {
                return {};
            },
        },
        chartPeriod: {
            type: String,
            value: "1d",
        },
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
        chartData: {
            type: Object,
            value: function (){
                return {};
            }
        },
        sensorData: {
            type: Object,
            computed: "getSensorDataFrom(chartData, sensorName)",
        },
        sensorName: String
    };

    app.toInteger = function(number){
        return parseInt(number);
    }

    app._conditionsChanged = function (newValue, oldValue) {
        if (!!newValue.Items) {
            this.conditions = newValue.Items;
        }
        this.conditionNames = this._aggregateConditionName(newValue);
    };

    app._aggregateConditionName = function () {
        return app.conditions.map(function (item) {
            return item.condition_name;
        });
    };

    app.sensorChartSelected = function(e){
        var paperIconButton = e.path["1"];
        var sensorType = paperIconButton.dataset.sensor;
        this.sensorName = sensorType;
        app.route = "chart";
    };

    app.getSensorDataFrom = function(fetchData, sensorName){
        return fetchData[sensorName];
    };

    app.chartPeriodChanged = function (e) {
        app.set("chartPeriod", e.detail.item.textContent.replace(/(^\s*)|(\s*$)/gi, ""));
        var ajaxElement = app.$.chartAjax;
        if (!!ajaxElement.body && ajaxElement.body.match(/\{.*\}/) == null) {
            ajaxElement.body = "{" + ajaxElement.body;
        }
        ;
        ajaxElement.generateRequest();
    };

    app.stringifyTime = function (period) {

        var unit = "";
        var quantity = parseInt(period);

        switch (period[period.length - 1]) {
            case "h":
                unit = "hours";
                break;

            case "d":
                unit = "days";
                break;

            case "m":
                unit = "months";
                break;
        }
        var now = moment();
        app.set("timeNow", now.format("YYYYMMDDHHmmss"));
        return now.subtract(unit, quantity).format("YYYYMMDDHHmmss");
    };

    app.conditionSelected = function (e) {
        // when you click the list item, fill content of setConditionPage, then move to that page.
        var selectedCondition = document.querySelector('#selectedCondition');
        var listbox = e.target;
        var item = e.detail.item;
        var index = listbox.indexOf(item);
        selectedCondition.data = {};

        // copy data, not reference. because template object holded data-binding.
        // if you copy the reference, you'll loose data-binding.
        for (var propertyName in this.conditions[index]) {
            selectedCondition.set("data." + propertyName, this.conditions[index][propertyName]);
        }

        // set old-condition-name same as condition-name.
        // this is used to check whether this data is new or not.
        selectedCondition.old_condition_name = selectedCondition.condition_name;

        this.set("route", "set-condition");
    };

    app.saveCondition = function (e) {
        var ajaxElement = document.querySelector("iron-ajax#saveCondition");
        var selectedCondition = document.querySelector("#selectedCondition");

        ajaxElement.body = selectedCondition.data;
        ajaxElement.generateRequest();

        this.set("route", "conditions");
    };

    app.route = "device";

    app.displayInstalledToast = function () {
        // Check to make sure caching is actually enabled—it won't be in the dev environment.
        if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
            Polymer.dom(document).querySelector('#caching-complete').show();
        }
    };

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page

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
})(document);