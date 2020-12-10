define([
    'jquery',
    'labels',
    'settings-core',
    "settings-general",
    './../../../courses/_default/core/settings/settings-core',
    'utils',
    'modules/BaseModule',
    './../../plugins/ckeditor/ckeditor',

], function ($, labels, CoreSettings, GeneralSettings, OriginalSettings, Utils, BaseModule, CKEDITOR) {
    'use strict';

    return BaseModule.extend({
        initialize: function (options) {
            this.parent = options.parent; //masterStructure.editor
            this.editor = this.parent;
            this.master = this.parent.parent; //masterStructure

            this.$glossaryContent;
            this.$glossary;

            this.$resourcesContent;
            this.$abbrs;

            this.labels = options.labels;

            this.initTemplate();
        },

        /*---------------------------------------------------------------------*/
        /*------------------------------ DOM INIT -----------------------------*/
        /*---------------------------------------------------------------------*/

        setDom: function () {
            $(CoreSettings.contentContainer).html(this.$template.html()).hide().fadeIn();

            this.setLabels()

            if (!CoreSettings.showGlossary) {
                $("#glossaryEdit").html(this.labels.resourcesEdit.noGlossary)
            }
            if (!CoreSettings.showResources) {
                $("#abbrEdit").html(this.labels.resourcesEdit.noResources)
            }
            if (!CoreSettings.showResources) {
                $("#extEdit").html(this.labels.resourcesEdit.noResources)
            }

            this.glossaries = this.master.resourcesManager.glossaries;
            this.glossaryIDs = Object.keys(this.glossaries);
            this.glossaryObjs = Object.values(this.glossaries);
            if (CoreSettings.showGlossary) {
                this.getGlossaryFile();
                this.loadGlossaryList();
            }

            this.abbrs = this.master.resourcesManager.abbrs;
            this.abbrIDs = Object.keys(this.abbrs);
            this.abbrObjs = Object.values(this.abbrs);

            this.exts = this.master.resourcesManager.exts;
            this.extIDs = Object.keys(this.exts);
            this.extObjs = Object.values(this.exts);

            if (CoreSettings.showResources) {
                this.getResourcesFile();
                this.loadAbbrList();
                this.loadExtList();
            }

            var that = this
            $(".LOM-save-resources").click(function () {
                that.saveClicked();
            });

            $("#add-glossary-term").click(function () {
                that.addTerm(that.labels.resourcesEdit.glossary.insertTerm, "[" + that.labels.resourcesEdit.glossary.insertDefinition + "]", "glossary");
            });
            $("#add-abbr-term").click(function () {
                that.addTerm(that.labels.resourcesEdit.abbr.insertTerm, "[" + that.labels.resourcesEdit.abbr.insertDefinition + "]", "abbr");
            });
            $("#add-ext-link").click(function () {
                that.addTerm(that.labels.resourcesEdit.ext.insertText, that.labels.resourcesEdit.ext.insertLink, "ext", "[" + that.labels.resourcesEdit.ext.insertDesc + "]");
            });
        },

        setLabels: function () {
            $("h1#resources-edit-title").html(this.labels.modes.resources);
            $("#resources-note").html(this.labels.resourcesEdit.note);
            $("h2#glossary-title").html(this.labels.resourcesEdit.glossary.glossaryTitle);
            $("#glossaryEdit #glossaryList .col-md-3 h3").html(this.labels.resourcesEdit.glossary.term);
            $("#glossaryEdit #glossaryList .col-md-9 h3").html(this.labels.resourcesEdit.glossary.def);
            $("#add-glossary-term").html(this.labels.resourcesEdit.glossary.add);

            $("h2#resources-title").html(this.labels.resourcesEdit.resourcesTitle);
            $("h3#abbr-title").html(this.labels.resourcesEdit.abbr.abbrTitle);
            $("#abbrEdit #abbrList .col-md-3 h4").html(this.labels.resourcesEdit.abbr.term);
            $("#abbrEdit #abbrList .col-md-9 h4").html(this.labels.resourcesEdit.abbr.def);
            $("#add-abbr-term").html(this.labels.resourcesEdit.abbr.add);
            $(".LOM-save-resources").html(this.labels.resourcesEdit.save);

            $("h3#ext-title").html(this.labels.resourcesEdit.ext.extTitle);
            $("#extEdit #extList .col-md-3 h4").html(this.labels.resourcesEdit.ext.text);
            $("#extEdit #extList .col-md-4 h4").html(this.labels.resourcesEdit.ext.link);
            $("#extEdit #extList .col-md-5 h4").html(this.labels.resourcesEdit.ext.desc);
            $("#add-ext-link").html(this.labels.resourcesEdit.ext.add);
        },

        /*---------------------------------------------------------------------*/
        /*-------------------------------- INIT -------------------------------*/
        /*---------------------------------------------------------------------*/

        initTemplate: function () {
            var that = this;
            $.ajax({
                url: "../../templates/resources-ui.html",
                type: 'GET',
                async: true,
                cache: false,
                timeout: 30000,
                error: function () {
                    console.error("Error while getting resources edit ui template");
                    return true;
                },
                success: function (tpl) {
                    that.$template = $(tpl);
                }
            });
        },

        getGlossaryFile: function () {
            var that = this;
            $.ajax({
                url: "../../courses/" + this.editor.courseFolder + "/content/tools/glossary_" + Utils.lang + ".html",
                type: 'GET',
                async: true,
                cache: false,
                timeout: 30000,
                error: function () {
                    console.error("Error while getting glossary file");
                    return true;
                },
                success: function (data) {
                    //console.log("Loaded glossary file");
                    that.$glossaryContent = $(data);
                    that.$glossary = $(data).find(".modal-body").find("ul#glossaryIndex");
                }
            });
        },

        getResourcesFile: function () {
            var that = this;
            $.ajax({
                url: "../../courses/" + this.editor.courseFolder + "/content/tools/resources_" + Utils.lang + ".html",
                type: 'GET',
                async: true,
                cache: false,
                timeout: 30000,
                error: function () {
                    console.error("Error while getting resources file");
                    return true;
                },
                success: function (data) {
                    //console.log("Loaded resources file");
                    that.$resourcesContent = $(data);
                    that.$abbrs = $(data).find(".modal-body").find("#csps-Abbr #abbr-list");
                    that.$exts = $(data).find(".modal-body").find(".external-list");
                }
            });
        },

        /*---------------------------------------------------------------------*/
        /*-------------------------- Functionnalities -------------------------*/
        /*---------------------------------------------------------------------*/

        loadGlossaryList: function () {
            var that = this;
            $.each(this.glossaryObjs, function (index, gloss) {
                var term = gloss.term.trim();
                var def = gloss.definition.trim();

                that.addDomForTerm(term, def, that.glossaryIDs[index], "glossary");
            });
        },

        loadAbbrList: function () {
            var that = this;
            $.each(this.abbrObjs, function (index, abbr) {
                var term = that.abbrIDs[index];
                var def = abbr.description.trim();

                that.addDomForTerm(term, def, that.abbrIDs[index], "abbr");
            });
        },

        loadExtList: function () {
            var that = this;

            $.each(this.extObjs, function (index, ext) {
                var text = ext.description.trim();
                var link = ext.$aTag.attr("href").trim();
                var desc = ext.linkTo;

                that.addDomForLink(text, link, desc, that.extIDs[index]);
            });
        },

        getDefinitionValue: function (id) {
            return CKEDITOR.instances[id].getData();
        },

        getIDNum: function (type) {
            var ids = [];
            $("#" + type + "List ." + type + "-term").each(function () {
                if ($(this).data("id").indexOf("added_" + type + "_") != -1) {
                    ids.push($(this).data("id"));
                }
            });

            if (ids.length == 0) {
                return 1;
            }
            else {
                var num = 1;
                while (true) {
                    if ($("#" + type + "List ." + type + "-term[data-id=\"added_" + type + "_" + num + "\"]").length == 0) {
                        break;
                    }
                    num++;
                }

                return num;
            }
        },

        getExtNum: function () {
            var ids = [];
            $("#extList .ext-term").each(function () {
                if ($(this).data("id").indexOf("ext-wb-") != -1) {
                    ids.push($(this).data("id"));
                }
            });

            if (ids.length == 0) {
                return 1;
            }
            else {
                var num = 1;
                while (true) {
                    if ($("#extList .ext-term[data-id=\"ext-wb-" + num + "\"]").length == 0) {
                        break;
                    }
                    num++;
                }

                return num;
            }
        },

        addDomForTerm: function (term, def, id, type) {
            $("#" + type + "List").append("<div class=\"" + type + "-term\" data-id=\"" + id + "\"></div>");
            $("#" + type + "List ." + type + "-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-3 term\"><input type=\"text\" id=\"" + id + "_term\" name=\"" + id + "_term\" value=\"" + term + "\"></div>");
            $("#" + type + "List ." + type + "-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-8 definition\"><textarea id=\"" + id + "_definition\" name=\"" + id + "_definition\">" + def + "</textarea></div>");

            switch (type) {
                case "glossary":
                    $("#" + type + "List ." + type + "-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-1\"><button class=\"snap-xs ico-SNAP-delete\" title=\"" + this.labels.resourcesEdit.glossary.delete + "&ldquo;" + term + "&rdquo;\" data-remove-term=\"" + id + "\">" + this.labels.resourcesEdit.glossary.delete + "&ldquo;" + term + "&rdquo;</button></div>");
                    break;
                case "abbr":
                    $("#" + type + "List ." + type + "-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-1\"><button class=\"snap-xs ico-SNAP-delete\" title=\"" + this.labels.resourcesEdit.abbr.delete + "&ldquo;" + term + "&rdquo;\" data-remove-term=\"" + id + "\">" + this.labels.resourcesEdit.abbr.delete + "&ldquo;" + term + "&rdquo;</button></div>");
                    break;
            }

            CKEDITOR.inline(id + "_definition", this.configCke());

            var that = this
            $(".snap-xs.ico-SNAP-delete").click(function () {
                var id = $(this).data("remove-term");
                that.deleteTerm(id, type);
            });
        },

        addDomForLink: function (text, link, desc, id) {
            $("#extList").append("<div class=\"ext-term\" data-id=\"" + id + "\"></div>");
            $("#extList .ext-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-3 text\"><input type=\"text\" id=\"" + id + "_text\" name=\"" + id + "_text\" value=\"" + text + "\"></div>");
            $("#extList .ext-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-4 link\"><input type=\"text\" id=\"" + id + "_link\" name=\"" + id + "_link\" value=\"" + link + "\"></div>");
            $("#extList .ext-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-4 desc\"><textarea id=\"" + id + "_desc\" name=\"" + id + "_desc\">" + desc + "</textarea></div>");

            $("#extList .ext-term[data-id=\"" + id + "\"]").append("<div class=\"col-md-1\"><button class=\"snap-xs ico-SNAP-delete\" title=\"" + this.labels.resourcesEdit.ext.delete + "&ldquo;" + text + "&rdquo;\" data-remove-term=\"" + id + "\">" + this.labels.resourcesEdit.ext.delete + "&ldquo;" + text + "&rdquo;</button></div>");

            CKEDITOR.inline(id + "_desc", this.configCke());

            var that = this;
            $(".snap-xs.ico-SNAP-delete").click(function () {
                var id = $(this).data("remove-term");
                that.deleteTerm(id, "ext");
            });
        },

        addTerm: function (term, def, type, desc) {
            var id;

            if (type !== "ext") {
                id = "added_" + type + "_" + this.getIDNum(type);
                this.addDomForTerm(term, def, id, type);
            }
            else {
                id = "ext-wb-" + this.getExtNum();
                this.addDomForLink(term, def, desc, id);
            }
        },

        deleteTerm: function (id, type) {
            $("." + type + "-term[data-id=\"" + id + "\"]").remove();
        },

        saveClicked: function () {
            $(".msg").remove();

            if (CoreSettings.showGlossary) {
                this.saveGlossary();
            }
            if (CoreSettings.showResources) {
                this.saveAbbrs();
                this.saveExts();
            }

            this.master.editor.ui.addVisualFeedback($(".LOM-save-resources"));
        },

        saveGlossary: function () {
            this.$glossary.html("");

            var that = this;
            $(".glossary-term").each(function () {
                that.$glossary.append("<li><dl id=\"" + $(this).data("id") + "\"><dt><p>" + $("#" + $(this).data("id") + "_term").val() + "</p></dt><dd>" + that.getDefinitionValue($(this).data("id") + "_definition").trim() + "</dd></dl></li>");
            });

            this.$glossaryContent.find("ul#glossaryIndex").html(this.$glossary.html());

            this.fileWrite(this.$glossaryContent[0].outerHTML, "glossary");
        },

        saveAbbrs: function () {
            this.$abbrs.html("");

            var that = this;
            $(".abbr-term").each(function () {
                $("#" + $(this).data("id") + "_term").val($("#" + $(this).data("id") + "_term").val().replace(/\s/g, "").toUpperCase());

                that.$abbrs.append("<dt>" + $("#" + $(this).data("id") + "_term").val() + "</dt><dd>" + that.getDefinitionValue($(this).data("id") + "_definition").trim() + "</dd>");
            });

            this.$resourcesContent.find("#abbr-list").html(this.$abbrs.html());

            this.fileWrite(this.$resourcesContent[0].outerHTML, "abbr");
        },

        saveExts: function () {
            this.$exts.html("");

            var errors = false;
            var check;

            var that = this;

            $(".alert").remove();

            $(".ext-term").each(function () {
                that.$exts.append("<dt><a target=\"_blank\" href=\"" + $("#" + $(this).data("id") + "_link").val() + "\" id=\"" + $(this).data("id") + "\">" + $("#" + $(this).data("id") + "_text").val() + "</a></dt><dd>" + that.getDefinitionValue($(this).data("id") + "_desc").trim() + "</dd>");

                check = that.checkLink($(this).data("id"));
                if (check.preventSave) {
                    errors = true;
                }
                if (check.isError) {
                    $(this).append(check.error);
                }
            });

            this.$resourcesContent.find(".external-list").html(this.$exts.html());

            if (!errors) {
                if (!this.resourcesBusy) {
                    this.fileWrite(this.$resourcesContent[0].outerHTML, "ext");
                }
                else {
                    $(document).one("ajaxStop", function () {
                        that.fileWrite(that.$resourcesContent[0].outerHTML, "ext");
                    });
                }
            }
            else {
                $(CoreSettings.contentContainer).append("<p class=\"msg error\">" + this.labels.resourcesEdit.ext.saveNotDone + "</p>");
            }
        },

        checkLink: function (id) {
            var url = $("#extList .ext-term[data-id=\"" + id + "\"] .link input").val();
            var text = $("#extList .ext-term[data-id=\"" + id + "\"] .text input").val();

            var err;
            var toReturn = { isError: false, error: "", preventSave: false };

            //http:// or https://
            if (url.indexOf("http://") == -1 && url.indexOf("https://") == -1) {
                err = "<p class=\"alert alert-warning\">" + this.labels.resourcesEdit.ext.errorStart + text + this.labels.resourcesEdit.ext.httpError + "</p>";
                toReturn.error += err;
                toReturn.isError = true;
            }
            //contains a space
            if (url.indexOf(" ") != -1) {
                err = "<p class=\"alert alert-danger\">" + this.labels.resourcesEdit.ext.errorStart + text + this.labels.resourcesEdit.ext.spaceError + "</p>"
                toReturn.error += err;
                toReturn.isError = true;
                toReturn.preventSave = true;
            }

            if (toReturn.isError) {
                toReturn.error = "<div class=\"col-md-12\">" + toReturn.error + "</div>";
            }

            return toReturn;
        },

        fileWrite: function (content, type) {
            var that = this;
            var filename;

            switch (type) {
                case "glossary":
                    filename = type;
                    break
                case "abbr":
                    filename = "resources";
                    this.resourcesBusy = true;
                    break;
                case "ext":
                    filename = "resources";
                    this.resourcesBusy = true;
                    break;
            }

            $.post('../../editor.php', {
                action: "page",
                filename: "courses/" + this.editor.courseFolder + "/content/tools/" + filename + "_" + Utils.lang + ".html",
                content: content
            }, function () {
                that.saveDone(type);
            }).fail(function () {
                alert("Posting failed while writing file for " + type + ".");
            });
        },

        saveDone: function (type) {
            this.master.resourcesManager.initialize({ master: this.master });

            switch (type) {
                case "glossary":
                    this.glossaries = this.master.resourcesManager.glossaries;
                    this.glossaryIDs = Object.keys(this.glossaries);
                    this.glossaryObjs = Object.values(this.glossaries);
                    $(CoreSettings.contentContainer).append("<p class=\"msg\">" + this.labels.resourcesEdit.glossary.saveDone + "</p>");
                    break;
                case "abbr":
                    this.abbrs = this.master.resourcesManager.abbrs;
                    this.abbrIDs = Object.keys(this.abbrs);
                    this.abbrObjs = Object.values(this.abbrs);

                    $(CoreSettings.contentContainer).append("<p class=\"msg\">" + this.labels.resourcesEdit.abbr.saveDone + "</p>");

                    this.resourcesBusy = false;

                    break;
                case "ext":
                    this.exts = this.master.resourcesManager.exts;
                    this.extIDs = Object.keys(this.exts);
                    this.extObjs = Object.values(this.exts);

                    $(CoreSettings.contentContainer).append("<p class=\"msg\">" + this.labels.resourcesEdit.ext.saveDone + "</p>");

                    this.resourcesBusy = false;

                    break;
            }
        },

        /*---------------------------------------------------------------------*/
        /*-------------------------------- CKE --------------------------------*/
        /*---------------------------------------------------------------------*/

        configCke: function () {
            var editorConfig = {
                toolbar: []
            };
            //FULL TEXT
            editorConfig.toolbar.push({
                name: 'cutpaste',
                items: ['Copy', 'Cut', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
            });
            editorConfig.toolbar.push({
                name: 'basicstyles',
                items: ['Bold', 'Italic', 'Subscript', 'Superscript', '-', 'Language', 'SpecialChar']
            });
            editorConfig.toolbar.push({
                name: 'paragraph',
                items: ['NumberedList', 'BulletedList' /*, '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' */]
            });
            /*editorConfig.toolbar.push({
                name: 'links',
                items: ['Link', 'Unlink', 'Anchor']
            });*/
            editorConfig.toolbar.push("/");
            /*editorConfig.toolbar.push({
                name: 'document',
                items: ['Format']
            });*/
            editorConfig.toolbar.push({
                name: 'resources',
                items: [/*'Abbr', 'Glossary', 'ext-links'*/]
            });

            editorConfig.extraPlugins = "abbr, glossary, ext-links";

            return editorConfig;

        },

        doSomething: function () {

        }

    });
});

