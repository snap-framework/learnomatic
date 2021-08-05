define([

    'jquery',
    'settings-core',
    './../pageEdit/elementClass',
    'utils'
], function ($, CoreSettings, ElementClass, Utils) {
    'use strict';
    return ElementClass.extend({
        initialize: function (options) {
            this.options = options;
        },
        //
        //this was originally initDom but gotta separate it.
        //this happens BEFORE the object is loaded into the actual DOM
        initDefaultDomValues: function ($template) {
            $template.find(".qs-elearning-activity").attr("id", this.id + "_act");
            switch (this.subtype) {
                case "exam":
                    $template = this.defaultDomExam($template);
                    break;
                default:
                    $template = this.defaultDomActivity($template);
            }
            return $template;
        },

        changePermissions: function () {
            this.permissions.editButtons.add = false;
            this.permissions.editButtons.config = true;
            this.permissions.editButtons.classPicker = false;
            this.permissions.subElements.multiplechoice = true;
            this.permissions.subElements.checkbox = true;
            this.permissions.functionalities.delaySubElements = true;
        },

        initDom: function () {
            //setting vars for quick reference
            this.$activite = this.$el.children(".qs-elearning-activity");
            this.$exercises = this.$activite.children(".qs-exercise");

            switch (this.subtype) {
                case "exam":
                    this.domExam();
                    break;
                default:
                    this.domActivity();
            }

            this.checkSettings();

            return false;
        },

        getCustomHolderSelector: function () {
            return ".qs-exercise.LOM-holder";
        },

        setLabels: function () {
            switch (this.subtype) {
                case "exam":
                    this.typeName = this.labels.type.exam;
                    this.labels.yougot = (this.lang === "en") ?
                        "You have successfully answered" :
                        "Vous avez obtenu";
                    this.labels.begin = (this.lang === "en") ?
                        "Begin Exam" :
                        "Débuter l'examen";
                    break;
                default:

                    this.typeName = this.labels.type.activity;
            }

            this.labels.notFirstTime = (this.lang === "en") ?
                "You have successfully answered" :
                "Vous avez obtenu";

            this.setLabelsDone = true;
            return false;
        },

        addElementBtnTxt: function () {
            return (Utils.lang === "en") ? "Add Question" : "Ajouter une question";
        },

        /*---------------------------------------------------------------------------------------------
        -------------------------CONFIGURATION
        ---------------------------------------------------------------------------------------------*/
        changeDefaultLbxSettings: function (params) {
            params.title = (Utils.lang === "en") ? "Activity Configuration" : "Configuration de l'activité";
            if (this.subtype == "exam") {
                params.title = (Utils.lang === "en") ? "Exam Configuration" : "Configuration de l'examen";
            }
            params.saveBtn = (Utils.lang === "en") ? "Save" : "Sauvegarder";
            return params;
        },

        configSettings: function () {
            var config = this.defaultConfigSettings();
            config.$paramTarget = this.$el.find(".qs-elearning-activity");
            config.files = ["../../templates/LOM-Elements/element_config_activity_" + Utils.lang + ".html"];
            return config;

        },
        initializeCustomFiles: function ($lbx, params) {
            var $activity = params.config.$paramTarget;
            var $exercises = $activity.find(".qs-exercise");
            var $questions = $exercises.find(".qs-question");

            var $bkp = this.getBkp();
            var $bkpActivity = $bkp.find("#" + params.config.$paramTarget.attr("id"));
            var $bkpExercises = $bkpActivity.find(".qs-exercise");
            var $bkpQuestions = $bkpExercises.find(".qs-question");

            this.checkSettings();

            if (this.feedbackTypeDeferred) {
                $lbx.find("#feedback-type-deferred").prop("checked", true);
                $lbx.find("#feedback-type-instant").prop("checked", false);
            } else {
                $lbx.find("#feedback-type-deferred").prop("checked", false);
                $lbx.find("#feedback-type-instant").prop("checked", true);
            }

            $lbx.find("#score").val(Number($activity.attr("data-trigger-completion-score")));

            if ($activity.attr("data-trigger-scorm-completion") == "true") {
                $lbx.find("#trigger-completion").prop("checked", true);
            } else {
                $lbx.find("#trigger-completion").prop("checked", false);
            }

            if (this.randomQuestions) {
                $lbx.find("#random-questions-yes").prop("checked", true);
                $lbx.find("#random-questions-no").prop("checked", false);
            } else {
                $lbx.find("#random-questions-yes").prop("checked", false);
                $lbx.find("#random-questions-no").prop("checked", true);
            }

            if (this.subtype != "exam") $lbx.find(".exam-only").hide();

            return params;
        },

        //Checks if the settings should be changed in order to activate the deffered feedback type
        checkSettings: function () {
            this.feedbackTypeDeferred = false;
            this.randomQuestions = false;

            var $activity = $("#" + this.id).find(".qs-elearning-activity");
            var $exercises = $activity.find(".qs-exercise");
            var $questions = $exercises.find(".qs-question");

            var $bkp = this.getBkp();
            var $bkpActivity = $bkp.find("#" + this.id).find(".qs-elearning-activity");
            var $bkpExercises = $bkpActivity.find(".qs-exercise");
            var $bkpQuestions = $bkpExercises.find(".qs-question");

            var questionsHaveDeferred = false;
            $questions.each(function () {
                if ($(this).attr("data-feedback-type") == "deferred") {
                    questionsHaveDeferred = true;
                }
            });

            var exercisesHaveDeferred = false;
            $exercises.each(function () {
                if ($(this).attr("data-feedback-type") == "deferred") {
                    exercisesHaveDeferred = true;
                }
            });

            if (($activity.attr("data-question-skipping") == "true" || $activity.attr("data-submit-all-at-once") == "true" || questionsHaveDeferred || exercisesHaveDeferred) && this.subtype == "exam") {
                this.feedbackTypeDeferred = true;

                $activity.attr("data-question-skipping", true);
                $bkpActivity.attr("data-question-skipping", true);

                $activity.attr("data-submit-all-at-once", true);
                $bkpActivity.attr("data-submit-all-at-once", true);

                $exercises.attr("data-feedback-type", "deferred");
                $bkpExercises.attr("data-feedback-type", "deferred");

                $questions.attr("data-feedback-type", "deferred");
                $bkpQuestions.attr("data-feedback-type", "deferred");

                $questions.find(".qs-answers .qs-submit").remove();
                $bkpQuestions.find(".qs-answers .qs-submit").remove();

                this.deferredButtons($questions, $bkpQuestions, $activity, $bkpActivity);
                this.saveBkp($bkp);
            } else if (this.subtype == "exam") {
                this.instantButtons($questions, $bkpQuestions, $activity, $bkpActivity);
                this.saveBkp($bkp);
            }

            var exercisesHaveRandomQuestions = false;
            $exercises.each(function () {
                if ($(this).attr("data-random-questions") == "true") {
                    exercisesHaveRandomQuestions = true;
                }
            });

            if ((exercisesHaveRandomQuestions || $activity.attr("data-random-questions") == "true")) {
                this.randomQuestions = true;

                $activity.attr("data-random-questions", true);
                $bkpActivity.attr("data-random-questions", true);

                $exercises.attr("data-random-questions", true);
                $bkpExercises.attr("data-random-questions", true);

                this.saveBkp($bkp);
            }
        },

        submitCustomConfig: function ($lbx, params) {

            var $activity = params.config.$paramTarget;
            var $exercises = $activity.find(".qs-exercise");
            var $questions = $exercises.find(".qs-question");

            var $bkp = this.getBkp();
            var $bkpActivity = $bkp.find("#" + params.config.$paramTarget.attr("id"));
            var $bkpExercises = $bkpActivity.find(".qs-exercise");
            var $bkpQuestions = $bkpExercises.find(".qs-question");

            var feedbackType = $lbx.find("input[name=\"feedback-type\"]:checked").val();
            var score = $lbx.find("input#score").val();
            var triggerCompletion = $lbx.find("input#trigger-completion").is(":checked");
            var randomQuestions = ($lbx.find("input[name=\"random-questions\"]:checked").val() == "true");

            //Set feedback type
            if (feedbackType == "deferred") {
                if (this.subtype == "exam") {
                    this.feedbackTypeDeferred = true;

                    $activity.attr("data-question-skipping", true);
                    $bkpActivity.attr("data-question-skipping", true);

                    $activity.attr("data-submit-all-at-once", true);
                    $bkpActivity.attr("data-submit-all-at-once", true);

                    $exercises.attr("data-feedback-type", "deferred");
                    $bkpExercises.attr("data-feedback-type", "deferred");

                    $questions.attr("data-feedback-type", "deferred");
                    $bkpQuestions.attr("data-feedback-type", "deferred");

                    this.deferredButtons($questions, $bkpQuestions, $activity, $bkpActivity);
                }
            } else if (feedbackType == "instant") {
                if (this.subtype == "exam") {
                    this.feedbackTypeDeferred = false;

                    $activity.attr("data-question-skipping", false);
                    $bkpActivity.attr("data-question-skipping", false);

                    $activity.attr("data-submit-all-at-once", false);
                    $bkpActivity.attr("data-submit-all-at-once", false);

                    $exercises.attr("data-feedback-type", "instant");
                    $bkpExercises.attr("data-feedback-type", "instant");

                    $questions.attr("data-feedback-type", "instant");
                    $bkpQuestions.attr("data-feedback-type", "instant");

                    this.instantButtons($questions, $bkpQuestions, $activity, $bkpActivity);
                }
            }

            if (this.subtype == "exam") {
                //Set the passing score
                $activity.attr("data-trigger-completion-score", score);
                $bkpActivity.attr("data-trigger-completion-score", score);

                //Set completion trigger
                $activity.attr("data-trigger-scorm-completion", triggerCompletion);
                $bkpActivity.attr("data-trigger-scorm-completion", triggerCompletion);
            }

            //Set random answers
            $activity.attr("data-random-questions", randomQuestions);
            $bkpActivity.attr("data-random-questions", randomQuestions);

            $exercises.attr("data-random-questions", randomQuestions);
            $bkpExercises.attr("data-random-questions", randomQuestions);

            this.saveBkp($bkp);

            return params;
        },

        deferredButtons: function ($questions, $bkpQuestions, $activity, $bkpActivity) {
            //Remove the submit buttons
            $questions.find(".qs-answers .qs-submit").remove();
            $bkpQuestions.find(".qs-answers .qs-submit").remove();

            //Remove the continue button for the last question
            $questions.find(".qs-feedback .qs-continue").remove();
            $bkpQuestions.find(".qs-feedback .qs-continue").remove();

            //Show the navigation
            $activity.find(".qs-navgroup").removeAttr("style");
            $bkpActivity.find(".qs-navgroup").removeAttr("style");
        },

        instantButtons: function ($questions, $bkpQuestions, $activity, $bkpActivity) {
            //Add the submit buttons
            $questions.each(function () {
                if ($(this).find(".qs-answers .qs-submit").length == 0) {
                    $(this).find(".qs-answers").append("<button class=\"qs-submit snap-sm ico-QS-check\">" + ((Utils.lang === "en") ? "Submit" : "Soumettre") + "</button>");
                }
            });
            $bkpQuestions.each(function () {
                if ($(this).find(".qs-answers .qs-submit").length == 0) {
                    $(this).find(".qs-answers").append("<button class=\"qs-submit snap-sm ico-QS-check\">" + ((Utils.lang === "en") ? "Submit" : "Soumettre") + "</button>");
                }
            });

            //Add the continue button for the last question
            $questions.each(function () {
                if ($(this).find(".qs-feedback .qs-continue").length == 0) {
                    $(this).find(".qs-feedback").append("<input class=\"qs-continue btn btn-default\" type=\"button\" value=\"" + ((Utils.lang === "en") ? "Next" : "Suivant") + "\">")
                }
            });
            $bkpQuestions.each(function () {
                if ($(this).find(".qs-feedback .qs-continue").length == 0) {
                    $(this).find(".qs-feedback").append("<input class=\"qs-continue btn btn-default\" type=\"button\" value=\"" + ((Utils.lang === "en") ? "Next" : "Suivant") + "\">")
                }
            });

            //Hide the navigation
            $activity.find(".qs-navgroup").css({
                display: "none"
            });
            $bkpActivity.find(".qs-navgroup").css({
                display: "none"
            });
        },

        /*---------------------------------------------------------------------------------------------
        -------------------------MODIFY activity to be an exam
        ---------------------------------------------------------------------------------------------*/
        domExam: function () {
            this.$exercises.addClass("hidden-holder");
            this.$exercises.eq(0).removeClass("hidden-holder");
        },
        defaultDomExam: function ($template) {

            //qs-elearning-activity
            $template.find(".qs-elearning-activity")
                .attr("data-question-skipping", "true")
                .attr("data-submit-all-at-once", "true")
                .attr("data-trigger-completion-score", "70")
                .attr("data-trigger-scorm-completion", "true")
                .attr("data-force-final-recap", "true")
                .attr("data-tracking", "true")
                .attr("data-submit-aao-disable-right-answers", "false");


            //qs-exercise
            $template.find(".qs-exercise")
                .attr("data-feedback-type", "deferred")
                .attr("data-question-type", "type-1")
                .attr("data-random-questions", "true")
                .attr("data-random-answers", "false")
                .attr("data-pool-picks-placeholder", "20");


            //exam title at the top
            $template.children().removeClass("activity").addClass("exam");
            //you got label
            $template.find(".yougot").text(this.labels.editview.QS.yougot);
            //for a score of label
            $template.find(".scoreof").text(this.labels.editview.QS.scoreof);
            //begin in QS start
            $template.find(".qs-start").text(this.labels.editview.QS.begin);
            //heading
            $template.find(".qs-elearning-activity").children("h2").text(this.labels.type.exam);
            //default intro text
            $template.find(".qs-start-activity").children(".qs-start-intro").html(this.labels.editview.QS.defaultIntro);
            //default back next
            $template.find(".qs-prevquestion").html(this.labels.editview.QS.prev);
            $template.find(".qs-nextquestion").html(this.labels.editview.QS.next);
            //default not first time
            $template.find(".qs-not-first-time").html(this.labels.editview.QS.defaultNotFirstTime);
            //resetRetry
            $template.find(".qs-resetretry").html(this.labels.editview.QS.resetRetry);

            //getback
            $template.find(".qs-getbacktoit").attr("value", this.labels.editview.QS.getBack);
            //pleaseAnswer
            $template.find(".qs-finallinkto-unanswered-placeholder").html(this.labels.editview.QS.pleaseAnswer);
            //positive
            $template.find(".qs-final-positive-feedback").html(this.labels.editview.QS.finalPositiveFeedback);
            //negative
            $template.find(".qs-final-negative-feedback").html(this.labels.editview.QS.finalNegativeFeedback);
            //toRestart
            $template.find(".qs-restart-msg").html(this.labels.editview.QS.toRestart);
            //pleaseReview
            $template.find(".recap").html(this.labels.editview.QS.pleaseReview);
            //restartExam
            $template.find(".qs-retry-activity").html(this.labels.editview.QS.restartExam);
            //results
            $template.find(".qs-feedback-final").children("h3").html(this.labels.editview.QS.results);


            return $template;
        },
        domActivity: function () {
            return false;
        },
        defaultDomActivity: function ($template) {
            //
            $template.find(".qs-start-activity").remove();
            $template.find(".qs-feedback-final").remove();
            $template.find(".qs-navgroup").remove();


            $template.find(".qs-elearning-activity").children("h2").text(this.labels.type.activity);
            return $template;
        },
        /* *****************************************************
         * BROWSER THROUGH EXERCISES MULTIPLE HOLDERS
         * *****************************************************/
        //adding some custom buttons, this might be moved back to element class
        initCustomButton: function () {
            if (this.subtype === "exam" && this.$exercises.length > 0) {
                this.initPrevHolderBtn();
                this.initNextHolderBtn();
                this.initAddHolderBtn();
                this.initDeleteHolderBtn();
            }
            //exercises

        },
        initPrevHolderBtn: function () {
            var that = this;
            var icon = "QS-left";
            var text = this.labels.editview.QS.prevQPool;
            var $btn;
            this.$el.children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
            $btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
            // setup hover effect
            $btn.hover(
                function () {
                    $(this).parent().children("span").text(text);
                },
                function () {
                    $(this).parent().children("span").text("");
                }
            );
            //setup click effect
            $btn.click(function () {
                that.prevHolder();
            });
            if (this.$exercises.length <= 1) {
                $btn.prop("disabled", true);
            }



        },
        initNextHolderBtn: function () {
            var that = this;
            var icon = "QS-right";
            var text = this.labels.editview.QS.nextQPool;
            var $btn;
            this.$el.children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
            $btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
            $btn.hover(
                function () {
                    $(this).parent().children("span").text(text);
                },
                function () {
                    $(this).parent().children("span").text("");
                }
            );
            $btn.click(function () {
                that.nextHolder();
            });
            if (this.$exercises.length <= 1) {
                $btn.prop("disabled", true);
            }
        },

        initAddHolderBtn: function () {
            var that = this;
            var icon = "LOM-plus";
            var text = this.labels.editview.QS.addQPool;
            var $btn;
            this.$el.children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
            $btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
            $btn.hover(
                function () {
                    $(this).parent().children("span").text(text);
                },
                function () {
                    $(this).parent().children("span").text("");
                }
            );
            $btn.click(function () {
                that.addHolder();
            });
        },

        initDeleteHolderBtn: function () {
            var that = this;
            var icon = "LOM-trash";
            var text = this.labels.editview.QS.deleteQPool;
            var $btn;
            this.$el.children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
            $btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
            $btn.hover(
                function () {
                    $(this).parent().children("span").text(text);
                },
                function () {
                    $(this).parent().children("span").text("");
                }
            );

            $btn.click(function () {
                that.deleteCurrentHolder();
            });

            if (this.$exercises.length == 1) {
                $btn.prop("disabled", true);
            }
        },

        nextHolder: function () {

            if (this.$holder.attr("id") === this.$holder.parent().children(".qs-exercise").last().attr("id")) {
                this.$holder = this.$holder.parent().children(".qs-exercise").eq(0);
            } else {
                this.$holder = this.$holder.next(".qs-exercise");
            }
            this.setCurrentHolder();
        },

        prevHolder: function () {

            if (this.$holder.attr("id") === this.$holder.parent().children(".qs-exercise").first().attr("id")) {
                this.$holder = this.$holder.parent().children(".qs-exercise").last();
            } else {
                this.$holder = this.$holder.prev(".qs-exercise");
            }
            this.setCurrentHolder();

        },

        addHolder: function () {
            //Get the attributes of the last holder
            var attrs = [];
            $.each(this.$exercises.eq(this.$exercises.length - 1)[0].attributes, function (i, a) {
                if (a.name != "id") {
                    var attr = {
                        attr: a.name,
                        value: a.value
                    };
                    attrs.push(attr);
                }
            });

            var $bkp = this.getBkp();

            //Create a placeholder element
            this.$exercises.eq(this.$exercises.length - 1).after("<div class=\"holder-placeholder\"></div>")
            $bkp.find("#" + this.id + "_act").find(".qs-exercise").eq($bkp.find("#" + this.id + "_act").find(".qs-exercise").length - 1).after("<div class=\"holder-placeholder\"></div>");

            var $placeholder = this.$el.find(".holder-placeholder");
            var $bkpPlaceholder = $bkp.find("#" + this.id).find(".holder-placeholder");

            //Add the last holder's attributes to the placeholder
            for (var i = 0; i < attrs.length; i++) {
                $placeholder.attr(attrs[i].attr, attrs[i].value).addClass("hidden-holder");
                $bkpPlaceholder.attr(attrs[i].attr, attrs[i].value).addClass("hidden-holder");
            }

            //Create an id for the new holder
            var id = this.editor.generateId(this.id + "_holder")
            $placeholder.attr("id", id);
            $bkpPlaceholder.attr("id", id);

            this.saveBkp($bkp);

            //Update the list of exercises
            this.$exercises = this.$activite.children(".qs-exercise");

            //If there is now more than one holder, enable the delete button
            if (this.$exercises.length > 1) {
                this.$el.find(".LOM-edit-view button.ico-LOM-trash").removeAttr("disabled");
                this.$el.find(".LOM-edit-view button.ico-QS-right").removeAttr("disabled");
                this.$el.find(".LOM-edit-view button.ico-QS-left").removeAttr("disabled");

            } else {
                this.$el.find(".LOM-edit-view button.ico-QS-right").prop("disabled", true);
                this.$el.find(".LOM-edit-view button.ico-QS-left").prop("disabled", true);

            }

            //Set the new holder as the current one
            this.$holder = $placeholder;
            this.setCurrentHolder();
        },

        deleteCurrentHolder: function () {
            if (this.$exercises.length > 1) {
                var $newHolder;

                //Determine if we should select the next or the previous holder after deleting this one
                if (this.$holder.attr("id") == this.$exercises.eq(0).attr("id")) {
                    $newHolder = this.$holder.next();
                } else {
                    $newHolder = this.$holder.prev();
                }

                //Delete the current holder
                var $bkp = this.getBkp();

                this.$holder.remove();
                $bkp.find("#" + this.id).find("#" + this.$holder.attr("id")).remove();

                this.saveBkp($bkp);

                //Update the list of exercises
                this.$exercises = this.$activite.children(".qs-exercise");

                //Set the new current holder
                this.$holder = $newHolder;
                this.setCurrentHolder();

                //If there is only one holder left, disable the delete button
                if (this.$exercises.length == 1) {
                    this.$el.find(".LOM-edit-view button.ico-LOM-trash").prop("disabled", true);
                    this.$el.find(".LOM-edit-view button.ico-QS-right").prop("disabled", true);
                    this.$el.find(".LOM-edit-view button.ico-QS-left").prop("disabled", true);
                }
            }
        },

        setCurrentHolder: function () {
            // make sure whatever we save in the old html is saved in the correct holder
            this.holderId = this.$holder.attr("id");

            // hide other holders
            this.$el.find(".qs-exercise").addClass("hidden-holder");
            this.$holder.removeClass("hidden-holder");

            //removing the add button from other holders/pools
            this.$el.children(".LOM-holder").children(".ico-LOM-plus").remove();

            //Adding the "add element" (add question for this)
            this.appendAddBtn();

        },

        /*---------------------------------------------------------------------------------------------
        -------------------------
        ---------------------------------------------------------------------------------------------*/

        //-------------------------
        doSomething: function () {


        }
    });
});