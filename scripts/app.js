// variables and functions used for app globally.
(function (document) {
    var app = document.querySelector('#app');

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
        models: {
            type: Object,
            value: function () {
                return {
                    device: {},
                    devices: {},
                    conditions: {},
                    condition: {},
                    chart: {},
                    options: {},
                };
            },
        },
    };

    app.toFixed = function (number, digit) {
        return number.toFixed(digit);
    };

})(document);

(function (document) {
    'use strict';

    // elements on page binding part.
    var app = document.querySelector('#app');
    app.addEventListener("dom-change", function () {
        var chartPage = document.querySelector("section#chart");
        var dropdown = chartPage.querySelector("paper-menu.dropdown-content");

        dropdown.addEventListener("iron-select", function (e) {
            app.set("models.chart.period", e.detail.item.textContent.replace(/(^\s*)|(\s*$)/gi, ""));
            app.models.chart.updateDatetimeWithPeriod();

            var ajaxElement = app.$.chartAjax;
            if (!!ajaxElement.body && ajaxElement.body.match(/\{.*\}/) == null) {
                ajaxElement.body = "{" + ajaxElement.body;
            }
            ajaxElement.generateRequest();
        });

        var setConditionPage = document.querySelector("section#set-condition");
        var selectButton = setConditionPage.querySelector("paper-icon-button#select");
        var saveButton = setConditionPage.querySelector("paper-icon-button#save");

        saveButton.addEventListener("tap", function (e) {
            var condition = app.models.condition;
            condition.save(setConditionPage.querySelector("iron-ajax.save-condition"));
        });

        selectButton.addEventListener("tap", function (e) {
            var condition = app.models.condition;
            var ajax = setConditionPage.querySelector("iron-ajax.select-condition");

            if (!!ajax.body && !!ajax.body.match && ajax.body.match(/\{.*\}/) == null) {
                ajax.body = "{" + ajax.body;
            }

            ajax.addEventListener("response", function(e) {
                page.redirect("/device");
            });

            ajax.generateRequest();
        });
    });

    app.addEventListener('dom-change', function () {
        // Model setting part. This must be replaced by Class instance.
        var device = app.models.device;

        var devices = app.models.devices;

        devices.getDeviceNames = function () {
            var length = this.Items.length;
            var deviceNames = [];

            for (var i = 0; i < length; i++) {
                deviceNames.push(this.Items[i].device_id);
            }

            return deviceNames;
        }

        devices.ajaxComplete = function () {
            app.set("models.devices.deviceNames", this.getDeviceNames());
        };

        devices.deviceSelected = function (e) {
            var device = app.models.device;
            // when you click the list item, fill content of setConditionPage, then move to that page.
            var listbox = e.target;
            var item = e.detail.item;
            var index = listbox.indexOf(item);
            //var index = app.params.id;

            // copy data, not reference. because template object holded data-binding.
            // if you copy the reference, you'll loose data-binding.
            for (var propertyName in devices.Items[index]) {
                app.set("models.device." + propertyName, devices.Items[index][propertyName]);
            }

            page.redirect("/device");
        }
        var chart = app.models.chart;
        chart.period = "1d";
        chart.sensorName = "light";

        chart.updateDatetimeWithPeriod = function () {
            var unit = this._parsePeriodUnit();
            var quantity = parseInt(this.period);
            var now = moment();

            app.set("models.chart.timeNow", now.format("YYYYMMDDHHmmss"));
            app.set("models.chart.timeAgo", now.subtract(unit, quantity).format("YYYYMMDDHHmmss"));
        };

        chart.ajaxComplete = function () {
            app.set("models.chart.sensorData", chart._getSensorData());
        };

        chart._parsePeriodUnit = function () {
            var unit = "";

            switch (this.period[this.period.length - 1]) {
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
            return unit;
        };

        chart._getSensorData = function () {
            if (!!this.data) {
                return this.data[this.sensorName];
            }
            else {
                return null;
            }
        };

        var conditions = app.models.conditions;

        conditions.getConditionNames = function () {
            var length = this.Items.length;
            var conditionNames = [];

            for (var i = 0; i < length; i++) {
                conditionNames.push(this.Items[i].condition_name);
            }

            return conditionNames;
        }

        conditions.ajaxComplete = function () {
            app.set("models.conditions.conditionNames", this.getConditionNames());
        };

        conditions.conditionSelected = function (e) {
            var condition = app.models.condition;
            // when you click the list item, fill content of setConditionPage, then move to that page.
            //var listbox = e.target;
            //var item = e.detail.item;
            //var index = listbox.indexOf(item);
            var index = app.params.id;

            // copy data, not reference. because template object holded data-binding.
            // if you copy the reference, you'll loose data-binding.
            for (var propertyName in conditions.Items[index]) {
                app.set("models.condition." + propertyName, conditions.Items[index][propertyName]);
            }

            // set old-condition-name same as condition-name.
            // this is used to check whether this data is new or not.
            condition.old_condition_name = condition.condition_name;

            //app.set("route", "set-condition");
        }

        var condition = app.models.condition;
        condition.save = function (ajaxElement) {
            condition.user_name = "amoretspero";
            var request = condition._toJSON();
            if(request.condition_name == request.old_condition_name){
                delete request.old_condition_name;
            }
            ajaxElement.body = request;
            ajaxElement.addEventListener("response", function(e){
                page.redirect("/conditions");
            });
            ajaxElement.generateRequest();
        };

        condition._toJSON = function () {
            var json = {};
            for (var property in this) {
                if (!!this.hasOwnProperty(property) && typeof(condition[property]) != "function") {
                    json[property] = this[property];
                }
            }
            return json;
        }


        // Page setting part.
        var pageSelector = document.querySelector("iron-pages");

        pageSelector.addEventListener('iron-select', function (e) {
            if (e.srcElement != this) {
                return;
            }
            var page = this.selectedItem;

            switch (page.id) {
                case "device":
                    break;
                case "chart":
                    chart.updateDatetimeWithPeriod();
                    break;
                case "conditions":
                    break;
                case "set-condition":
                    if(!!app.params.id) {
                        conditions.conditionSelected();
                    }
                    break;
            }

            var ajaxElements = page.querySelectorAll("iron-ajax[data-model]");
            var length = ajaxElements.length;

            for (var i = 0; i < length; i++) {
                var element = ajaxElements[i];
                // need this process because compound binding bug T.T
                if (!!element.body && !!element.body.match && element.body.match(/\{.*\}/) == null) {
                    element.body = "{" + element.body;
                }
                element.generateRequest();
            }
        });
    });

    app.addEventListener("dom-change", function () {
        // Ajax auto binding part.
        var ajaxElements = document.querySelectorAll("iron-ajax[data-model]");
        var length = ajaxElements.length;

        for (var i = 0; i < length; i++) {
            var ajax = ajaxElements[i];

            ajax.addEventListener("response", function (e) {
                var modelName = this.dataset.model;
                var fieldName = this.dataset.field;
                var path = "models." + modelName;

                if (app.models[modelName] == null) {
                    app.models[modelName] = {};
                }

                if (!!fieldName) {
                    if (!!!app.models[modelName][fieldName]) {
                        app.models[modelName][fieldName] = {};
                    }
                    path += "." + fieldName;
                }

                var response = e.detail.response;

                if (!!!response) {
                    return;
                }

                for (var property in response) {
                    if (response.hasOwnProperty(property)) {
                        app.set(path + "." + property, response[property]);
                    }
                }

                // call after hook function.
                if (!!app.models[modelName].ajaxComplete) {
                    app.models[modelName].ajaxComplete();
                }

                if (!!fieldName && !!app.models[modelName][fieldName].ajaxComplete) {
                    app.models[modelName][fieldName].ajaxComplete();
                }

            });
        }
    });

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