define([
    'jquery',
    'labels',
    'utils',
    'modules/BaseModule',

], function ($, labels, Utils, BaseModule) {
    'use strict';

    return BaseModule.extend({
        initialize: function (options) {
            this.page = options.page;
            this.pageTitle = options.pageTitle;
            this.search = options.search;
            this.replace = options.replace;
            this.searchin = options.searchin;
            this.caseSensitive = options.caseSensitive;

            this.editor = options.editor;

            this.getPageFile()
        },

        getPageFile: function () {
            var pos = (this.page.indexOf("-") >= 0) ? this.page.indexOf("-") - 1 : this.page.length;
            this.module = this.page.substr(1).substr(0, pos);

            var that = this;
            $.ajax({
                url: "../../courses/" + this.editor.courseFolder + "/content/module" + that.module + "/" + that.page + "_" + Utils.lang + ".html",
                type: 'GET',
                async: true,
                cache: false,
                timeout: 30000,
                error: function () {
                    console.error("Error while getting page file");
                    return true;
                },
                success: function (data) {
                    that.pageContent = data;
                    that.setupContent();
                }
            });
        },

        setupContent: function () {
            this.results = [];
            this.replacedResults = [];

            if (this.editor.replacing()) {
                this.makeReplacements();
            }

            if (this.searchin == "text") {
                var $replace = $("<div>");
                $replace.html(this.pageContent)
                this.pageContent = $replace.text();
            }
            this.getResults(this.pageContent, this.search, this.results);

            if (this.editor.replacing()) {
                this.getResults(this.replacedPageContent, this.replace, this.replacedResults);
            }

            this.editor.displayResults(this);
        },

        makeReplacements: function () {
            if (this.searchin == "code") {
                if (this.caseSensitive) {
                    this.replacedPageContent = this.pageContent.replace(new RegExp(this.search, 'g'), this.replace);
                }
                else {
                    this.replacedPageContent = this.pageContent.replace(new RegExp(this.search, 'ig'), this.replace);
                }
            }
            else if (this.searchin == "text") {
                var $replace = $("<div>");
                $replace.html(this.replace)
                this.replace = $replace.text();

                this.replacedPageContent = this.pageContent;

                var that = this;
                $replace = $("<div>");
                $replace.html(this.replacedPageContent)
                $replace.find("*:not(:has(*))").each(function () {
                    if (that.caseSensitive) {
                        $(this).text($(this).text().replace(new RegExp(that.search, 'g'), that.replace));
                    }
                    else {
                        $(this).text($(this).text().replace(new RegExp(that.search, 'ig'), that.replace));
                    }
                });
                this.replacedPageContent = $replace.html();
            }

            this.saveContent(this.replacedPageContent);

            if (this.searchin == "text") {
                $replace = $("<div>");
                $replace.html(this.replacedPageContent)
                this.replacedPageContent = $replace.text();
            }
        },

        getResults: function (content, highlight, arr) {
            var originalHighlight = highlight;

            var at = -1
            do {
                highlight = originalHighlight;

                if (this.caseSensitive) {
                    at = content.indexOf(highlight, at + 1);
                }
                else {
                    at = content.toLowerCase().indexOf(highlight.toLowerCase(), at + 1);

                    highlight = content.substring(at, at + highlight.length);
                }
                var n = 25;
                var result;

                if (at >= 0) {
                    if (at <= n) {
                        result = content.substring(0, at + highlight.length + n);

                        if (this.searchin == "code") {
                            result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                            highlight = highlight.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                        }

                        result = this.replaceAt(result, highlight, "<span class=\"search-highlight\">" + highlight + "</span>", at, at + highlight.length);
                    }
                    else {
                        result = content.substring(at - n, (at + highlight.length + n));

                        if (this.searchin == "code") {
                            result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                            highlight = highlight.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                        }

                        var pos = result.indexOf(highlight)
                        result = this.replaceAt(result, highlight, "<span class=\"search-highlight\">" + highlight + "</span>", pos, pos + highlight.length);
                    }

                    arr.push(result);
                }
            }
            while (at >= 0);
        },

        replaceAt: function (input, search, replace, start, end) {
            return input.slice(0, start)
                + input.slice(start, end).replace(search, replace)
                + input.slice(end);
        },

        saveContent: function (content) {
            var that = this;
            $.post('../../editor.php', {
                action: "page",
                filename: "courses/" + this.editor.courseFolder + "/content/module" + that.module + "/" + that.page + "_" + Utils.lang + ".html",
                content: content
            }, function () {

            }).fail(function () {
                console.error("Posting failed while updating page " + that.page + ".");
            });
        }
    });
});

