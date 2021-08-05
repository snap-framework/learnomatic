define([

    'jquery',
    'settings-core',
    './../pageEdit/elementClass',
    'utils',
    './../pageEdit/editBoxObj',
], function ($, CoreSettings, ElementClass, Utils, EditBoxObj) {
    'use strict';
    return ElementClass.extend({
        initialize: function (options) {

            this.options = options;
            //console.log(this.subtype);
            if (this.subtype === "multipleanswers") {
                this.autoLoaded = ["checkbox", "checkbox", "checkbox"];
                this.autoAddElement = "checkbox";
            } else {
                this.autoLoaded = ["radiobtn", "radiobtn", "radiobtn"];
                this.autoAddElement = "radiobtn";
            }
            this.autoAddButton = false;
        },

        initDom: function () {
            setTimeout(function () {
                $(".random-answers-removed").attr("data-random-answers", true).removeClass("random-answers-removed");
            }, 2000);

            this.checkSecondChanceAllowed();
            this.parent.checkSettings();
        },

        changePermissions: function () {
            this.permissions.editButtons.add = true;
            this.permissions.editButtons.config = true;
            this.permissions.editButtons.classPicker = false;
            this.permissions.subElements.radiobtn = true;
        },

        setLabels: function () {
            this.typeName = this.labels.type.question;
            this.setLabelsDone = true;
            return false;
        },

        initDefaultDomValues: function ($template) {

            //selectCorrect
            $template.find(".qs-select-correct").html(this.labels.editview.QS.selectCorrect);
            $template.find(".qs-text").children(".LOM-editable").html(this.labels.editview.QS.insertText);
            $template.find(".qs-right").children(".LOM-editable").html(this.labels.editview.QS.right);
            $template.find(".qs-wrong").children(".LOM-editable").html(this.labels.editview.QS.wrong);
            $template.find(".qs-second-chance").children(".LOM-editable").html(this.labels.editview.QS.secondChance);
            $template.find(".qs-generic").children(".LOM-editable").html(this.labels.editview.QS.generic);

            $template.find(".qs-question").attr("id", "quest_" + this.id);
            if (this.subtype === "multipleanswers") {
                $template.find(".qs-question").attr("data-question-type", "type-2");
            }

            if (this.parent.subtype === "exam") {
                $template.find(".qs-submit").remove();
            }
            $template.find(".qs-submit").text(this.labels.type.submit);
            return $template;
        },

        getCustomHolderSelector: function () {
            return ".qs-answer-container.LOM-holder";
        },

        /*---------------------------------------------------------------------------------------------
        -------------------------CONFIGURATION
        ---------------------------------------------------------------------------------------------*/
        changeDefaultLbxSettings: function (params) {
            params.title = (Utils.lang === "en") ? "Question Configuration" : "Configuration de la question";
            params.saveBtn = (Utils.lang === "en") ? "Save" : "Sauvegarder";
            return params;
        },

        configSettings: function () {
            var config = this.defaultConfigSettings();
            config.$paramTarget = this.$el.find(".qs-question");
            config.files = ["../../templates/LOM-Elements/element_config_radio_" + Utils.lang + ".html"];
            return config;

        },
        initializeCustomFiles: function ($lbx, params) {
            var $question = params.config.$paramTarget;
            var $feedback = $question.find(".qs-feedback");

            if ($question.attr("data-random-answers") === "true") {
                $lbx.find("input#random-answers-yes").attr("checked", true);
                $lbx.find("input#random-answers-no").attr("checked", false);
            } else {
                $lbx.find("input#random-answers-yes").attr("checked", false);
                $lbx.find("input#random-answers-no").attr("checked", true);
            }

            if ($feedback.find(".qs-second-chance").length) {
                $lbx.find("input#second-chance").prop("checked", true);
            } else {
                $lbx.find("input#second-chance").prop("checked", false);
            }

            this.checkSecondChanceAllowed();
            if (!this.secondChanceAllowed) {
                $lbx.find("input#second-chance").hide();
                $lbx.find("input#second-chance").siblings("label").hide();
            }

            return params;
        },

        //Checks if the question is allowed to have a second chance. If not, deletes the .qs-second-chance element
        checkSecondChanceAllowed: function () {
            this.secondChanceAllowed = true;

            var $bkp = this.getBkp();

            var $question = $("#" + this.id).find(".qs-question");
            var $bkpQuestion = $bkp.find("#" + this.id).find(".qs-question");
            var $feedback = $question.find(".qs-feedback");
            var $bkpFeedback = $bkpQuestion.find(".qs-feedback");

            if ($question.closest(".qs-elearning-activity").attr("data-question-skipping") == "true" || $question.closest(".qs-elearning-activity").attr("data-submit-all-at-once") == "true" || $question.attr("data-feedback-type") == "deferred" || $question.closest(".qs-exercise").attr("data-feedback-type") == "deferred") {
                this.secondChanceAllowed = false;

                $feedback.find(".qs-second-chance").remove();
                $bkpFeedback.find(".qs-second-chance").remove();

                var id = this.editor.generateId("LOM-edit-" + $question.parent().attr("id") + "-");
                for (var i = 0; i < this.editor.edits.length; i++) {
                    if (this.editor.edits[i].id == id) {
                        this.editor.edits.splice(i, 1);
                    }
                }
            }

            this.saveBkp($bkp);
        },

        submitCustomConfig: function ($lbx, params) {

            var $bkp = this.getBkp();

            var $question = params.config.$paramTarget;
            var $bkpQuestion = $bkp.find("#" + this.id).find("#" + params.config.$paramTarget.attr("id"));
            var $feedback = $question.find(".qs-feedback");
            var $bkpFeedback = $bkpQuestion.find(".qs-feedback");

            var randomAnswers = ($lbx.find("input[name=\"random-answers\"]:checked").val()) === "true";
            var secondChance = $lbx.find("input#second-chance").is(":checked");

            //Set random answers
            $question.attr("data-random-answers", randomAnswers);
            $bkpQuestion.attr("data-random-answers", randomAnswers);

            //Set second chance
            if (secondChance && this.secondChanceAllowed) {
                var id = this.editor.generateId("LOM-edit-" + $question.parent().attr("id") + "-");
                if ($feedback.find(".qs-second-chance").length == 0) {
                    $feedback.find(".qs-wrong").before("<div class=\"qs-second-chance\"><div class=\"LOM-editable\" id=\"" + id + "\">" + this.labels.editview.QS.secondChance + "</div></div>");
                    $bkpFeedback.find(".qs-wrong").before("<div class=\"qs-second-chance\"><div class=\"LOM-editable\" id=\"" + id + "\">" + this.labels.editview.QS.secondChance + "</div></div>");

                    this.editor.edits[this.editor.edits.length] = new EditBoxObj({
                        id: id,
                        class: "LOM-editable",
                        $el: $feedback.find(".qs-second-chance"),
                        parent: this.editor,
                        parentElement: this,
                        isRogue: false
                    });
                    for (var i = 0; i < this.editor.edits.length; i++) {
                        if (this.editor.edits[i].id == id) {
                            this.editor.edits[i]
                        }
                    }
                }
            } else {
                $feedback.find(".qs-second-chance").remove();
                $bkpFeedback.find(".qs-second-chance").remove();

                for (var j = 0; j < this.editor.edits.length; j++) {
                    if (this.editor.edits[j].id == id) {
                        this.editor.edits.splice(j, 1);
                    }
                }
            }

            this.saveBkp($bkp);

            return params;
        },

        //---------------------CORRECT ANSWER---------------------------

        submitCorrectAnswer: function (answerId) {

            var $radio;
            var radioId;

            for (var i = 0; i < this.elements.length; i++) {
                $radio = this.elements[i].$el.children("input");
                radioId = $radio.attr("id");
                radioId = radioId.replace("answer_", "");

                this.elements[i].setCorrect(answerId === radioId);

            }
            this.editor.refreshHtml();


        },



        //-------------------------
        doSomething: function () {


        }
    });
});