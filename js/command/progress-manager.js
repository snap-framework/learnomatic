define([
	'modules/BaseModule',
    'jquery',
], function (BaseModule, $) {
    'use strict';
    return BaseModule.extend({
        initialize: function (options) {
            this.options = options;

            this.root = options.root;
            this.window = options.window;
        },

        showMessage: function (operation, type, progress) {
            $(".progress-manager").stop().fadeIn(200);
            this.isBusy = true;

            this.count++;
            this.id++;

            if (type == "progress") {
                $(".progress-manager").append("<div id=\"progress-msg-" + this.id + "\" class=\"progress-msg in-progress\" style=\"display: none;\"><p><strong>In progress: </strong><span class=\"operation\"></span><progress value=\"0\" max=\"100\"></progress><span id=\"progress\">0%</span></p></div>");
                $(".progress-msg#progress-msg-" + this.id).fadeIn(100);

                $(".in-progress#progress-msg-" + this.id + " .operation").html(operation);
                $(".in-progress#progress-msg-" + this.id + " progress").attr("value", progress);
                $(".in-progress#progress-msg-" + this.id + " #progress").html(progress + "%");
            } else if (type == "status") {
                $(".progress-manager").append("<div id=\"progress-msg-" + this.id + "\" class=\"progress-msg status\" style=\"display: none;\"><p><strong>In progress: </strong><span class=\"operation\"></span></p></div>");
                $(".progress-msg#progress-msg-" + this.id).fadeIn(100);

                $(".status#progress-msg-" + this.id + " .operation").html(operation);
            }

            return $(".progress-msg#progress-msg-" + this.id);
        },

        updateProgress: function ($el, progress) {
            $el.find(".operation").html(operation);
            $el.find("progress").attr("value", progress);
            $el.find("#progress").html(progress + "%");
        },

        removeMessage: function ($el) {
            this.count--;

            var that = this;
            setTimeout(function () {
                if (that.count == 0) {
                    that.isBusy = false;

                    $(".progress-manager").stop().fadeOut(200, function () {
                        $el.fadeOut(100, function () {
                            $(this).remove();
                        });
                    });
                } else if (that.count == that.errorCount) {
                    that.isBusy = false;
                    $el.fadeOut(100, function () {
                        $(this).remove();
                    });
                } else {
                    $el.fadeOut(100, function () {
                        $(this).remove();
                    });
                }
            }, 10);
        },

        handleError: function (data, error, errortext, msg) {
            $(".progress-manager").stop().fadeIn(200);

            this.count++;
            this.errorCount++;
            this.id++;

            $(".progress-manager").append("<div id=\"progress-msg-" + this.id + "\" class=\"progress-msg error\" style=\"color: #ff0000;\"></div>");

            switch (error) {
                case "timeout":
                    $(".progress-msg#progress-msg-" + this.id).html("<p>" + msg + " - \"The request timed out.\"</p>");
                    break;
                case "error":
                    $(".progress-msg#progress-msg-" + this.id).html("<p>" + msg + " - \"" + errortext + "\"</p>");
                    break;
                case "abort":
                    $(".progress-msg#progress-msg-" + this.id).html("<p>" + msg + " - \"The request aborted.\"</p>");
                    break;
                case "parsererror":
                    $(".progress-msg#progress-msg-" + this.id).html("<p>" + msg + " - \"There has been a parsing error.\"</p>");
                    break;
            }
        },

        initInterface: function () {
            this.count = 0;
            this.errorCount = 0;
            this.id = 0;
            this.isBusy = false;
            this.isNavigatingToDownload = false;

            $.get(this.root.relPath+"templates/command/interface-progress-manager.html", function (data) {
                $("main").append(data);
                $(".progress-manager").hide();
            });

            var that = this;
            this.window.onbeforeunload = function () {
                if (that.isBusy && !that.isNavigatingToDownload) {
                    return "An operation is running. Leaving this page could cause problems.";
                } else {
                    return;
                }
            }
        },

    });
});
