define(['utils'], function (Utils) {
    'use strict';

    /* liste des constantes du framework */

    var labels = {
        choose: (Utils.lang === "en")
            ? "Choose"
            : "Choisir",

        tools: {
            previewtoggle: (Utils.lang === "en")
                ? "Show/Hide Preview"
                : "Voir/Cacher aperçu",
            layout: (Utils.lang === "en")
                ? "Change Layout"
                : "Changer disposition",
            template: (Utils.lang === "en")
                ? "Save as Template"
                : "Sauvegarder le Gabarit",
            a11y: (Utils.lang === "en")
                ? "Accessibility Scan"
                : "Scan d'accessibilité",
            searchreplace: (Utils.lang === "en")
                ? "Search/Replace in the course"
                : "Rechercher/remplacer dans le cours",
            deletepage: (Utils.lang === "en")
                ? "Delete Page"
                : "Supprimer la page",
            deleteconfirm: (Utils.lang === "en")
                ? "Delete current page?"
                : "Supprimer la page actuelle?",
            newpage: (Utils.lang === "en")
                ? "New Page"
                : "Nouvelle page",
            test: (Utils.lang === "en")
                ? "test"
                : "test",
            localView: (Utils.lang === "en")
                ? "Local View"
                : "Vue Locale",
            globalView: (Utils.lang === "en")
                ? "Global View"
                : "Vue D'ensemble",
            colors: (Utils.lang === "en")
                ? "Build Theme"
                : "Construire le thème"
        },
        modes: {
            preview: (Utils.lang === "en")
                ? "Preview"
                : "Visualiser",
            pageEdit: (Utils.lang === "en")
                ? "Page Edit"
                : "Édition de la page",
            structure: (Utils.lang === "en")
                ? "Structure Edit"
                : "Édition de la structure",
            theme: (Utils.lang === "en")
                ? "Theme Edit"
                : "Édition du thème",
            settings: (Utils.lang === "en")
                ? "Settings Edit"
                : "Configuration",
            resources: (Utils.lang === "en")
                ? "Toolbox Edit"
                : "Édition de la boîte à outil",
            courses: (Utils.lang === "en")
                ? "Course Editing"
                : "Édition de cours",
            users: (Utils.lang === "en")
                ? "Users Editing"
                : "Édition d'utilisateurs",
            overview: (Utils.lang === "en")
                ? "Overview"
                : "Vue d'ensemble",
            chat: (Utils.lang === "en")
                ? "Chat"
                : "Chat",
            notifications: (Utils.lang === "en")
                ? "Notifications"
                : "Notifications",
            boards: (Utils.lang === "en")
                ? "Boards"
                : "Boards",
            announcements: (Utils.lang === "en")
                ? "Announcements"
                : "Annonces",
            review: (Utils.lang === "en")
                ? "Review"
                : "Révision",

        },
        login: {
            login: (Utils.lang === "en")
                ? "Login"
                : "Connexion",
            logout: (Utils.lang === "en")
                ? "Log out"
                : "Déconnexion",
            username: (Utils.lang === "en")
                ? "Username"
                : "Nom d'utilisateur",
            password: (Utils.lang === "en")
                ? "Password"
                : "Mot de passe",
            menuTitle: (Utils.lang === "en")
                ? "User Menu"
                : "Menu utilisateur",
            welcome: (Utils.lang === "en")
                ? "Welcome "
                : "Bienvenue ",
            switch: (Utils.lang === "en")
                ? "Switch role to: "
                : "Changer de rôle&nbsp;: ",
            roles: {
                admin: (Utils.lang === "en")
                    ? "Admin"
                    : "Administrateur(trice)",
                manager: (Utils.lang === "en")
                    ? "Manager"
                    : "Gestionnaire",
                designer: (Utils.lang === "en")
                    ? "Designer"
                    : "Designer",
                editor: (Utils.lang === "en")
                    ? "Editor"
                    : "Éditeur(trice)",
                reviewer: (Utils.lang === "en")
                    ? "Reviewer"
                    : "Réviseur(euse)",
                user: (Utils.lang === "en")
                    ? "User"
                    : "Utilisateur(trice)"
            }
        },
        layout: {
            choose: (Utils.lang === "en")
                ? "Choose Your Layout"
                : "Choisissez votre disposition"
        },
        frame: {
            add: (Utils.lang === "en")
                ? "Add Element"
                : "Ajouter Un Élément"
        },
        element: {
            type: {
                default: (Utils.lang === "en")
                    ? "Element"
                    : "Élément",
                text: (Utils.lang === "en")
                    ? "Text"
                    : "Texte",
                title: (Utils.lang === "en")
                    ? "Title"
                    : "Titre",
                html: (Utils.lang === "en")
                    ? "Custom Element"
                    : "Élément personalisé",
                exam: (Utils.lang === "en")
                    ? "Exam"
                    : "Examen",
                activity: (Utils.lang === "en")
                    ? "Activity"
                    : "Activité",
                submit: (Utils.lang === "en")
                    ? "Submit"
                    : "Soumettre",
                accordion: (Utils.lang === "en")
                    ? "Accordion"
                    : "Accordéon",
                tabs: (Utils.lang === "en")
                    ? "Tabbed interface"
                    : "Interface à onglets",
                details: (Utils.lang === "en")
                    ? "Box"
                    : "Boîte",
                audio: (Utils.lang === "en")
                    ? "Audio"
                    : "Audio",
                video: (Utils.lang === "en")
                    ? "Video"
                    : "Vidéo",
                btngroup: (Utils.lang === "en")
                    ? "Button Group"
                    : "Groupe de boutons",
                button: (Utils.lang === "en")
                    ? "Button"
                    : "Bouton",
                carousel: (Utils.lang === "en")
                    ? "Carousel"
                    : "Caroussel",
                custom: (Utils.lang === "en")
                    ? "Ask a developer"
                    : "Demander à un développeur",
                faq: (Utils.lang === "en")
                    ? "Frequently Asked Questions"
                    : "Questions fréquentes",
                image: (Utils.lang === "en")
                    ? "Image"
                    : "Image",
                lightbox: (Utils.lang === "en")
                    ? "Lightbox"
                    : "Fenêtre contextuelle",
                question: (Utils.lang === "en")
                    ? "Question"
                    : "Question",
                answer: (Utils.lang === "en")
                    ? "Answer"
                    : "Réponse"
            },
            editview: {
                add: (Utils.lang === "en")
                    ? "Add"
                    : "Ajouter",
                edit: (Utils.lang === "en")
                    ? "Edit"
                    : "Éditer",
                config: (Utils.lang === "en")
                    ? "Config"
                    : "Configurer",
                delete: (Utils.lang === "en")
                    ? "Delete"
                    : "Supprimer",
                save: (Utils.lang === "en")
                    ? "Save"
                    : "Sauvegarder",
                move: (Utils.lang === "en")
                    ? "Move Element"
                    : "Déplacer Élément",

                QS: {
                    begin: (Utils.lang === "en")
                        ? "Start the exam"
                        : "Commencer l'examen",
                    right: (Utils.lang === "en")
                        ? "Correct!"
                        : "Bonne réponse!",
                    wrong: (Utils.lang === "en")
                        ? "Incorrect."
                        : "Mauvaise réponse.",
                    secondChance: (Utils.lang === "en")
                        ? "Please try again."
                        : "Veuillez réessayer.",
                    generic: (Utils.lang === "en")
                        ? "Explanations"
                        : "Explications",
                    nbQuestion: (Utils.lang === "en")
                        ? "current question number"
                        : "numéro de la question actuelle",
                    nbTotal: (Utils.lang === "en")
                        ? "total number of questions"
                        : "nombre total de questions",
                    insertText: (Utils.lang === "en")
                        ? "[Insert Question Text]"
                        : "[Insérer le texte de la question]",
                    selectCorrect: (Utils.lang === "en")
                        ? "Select the correct answer"
                        : "Sélectionnez la bonne réponse",
                    results: (Utils.lang === "en")
                        ? "Results"
                        : "Résultats",
                    prev: (Utils.lang === "en")
                        ? "Previous Question"
                        : "Question précédente",
                    next: (Utils.lang === "en")
                        ? "Next Question"
                        : "Question suivante",
                    restartExam: (Utils.lang === "en")
                        ? "Restart the exam"
                        : "Recommencer l'examen",
                    yougot: (Utils.lang === "en")
                        ? "You have successfully answered"
                        : "Vous avez répondu correctement à",
                    scoreof: (Utils.lang === "en")
                        ? "for a score of"
                        : "pour un score de",
                    insertNbQuestion: (Utils.lang === "en")
                        ? "Insert Current Question Number"
                        : "Insérer le numéro de la question actuelle",
                    insertNbTotal: (Utils.lang === "en")
                        ? "Insert Total Number of Questions"
                        : "Insérer le nombre total de questions",
                    resetRetry: (Utils.lang === "en")
                        ? "Reset and retry the exam"
                        : "Réinitialiser et recommencer l'examen",
                    getBack: (Utils.lang === "en")
                        ? "Get back to where you were"
                        : "Retournez là où vous étiez",
                    pleaseAnswer: (Utils.lang === "en")
                        ? "Please answer the following question(s) before validating:"
                        : "Veuillez répondre aux questions suivantes avant de valider:",
                    pleaseReview: (Utils.lang === "en")
                        ? "Please review your answers to the exam questions."
                        : "Passez en revue la ou les questions ci-après.",
                    defaultNotFirstTime: (Utils.lang === "en")
                        ? "Looks like it's not your first time, would you like to:"
                        : "Il semblerait que ce n'est pas votre première visite, souhaitez-vous:",
                    finalPositiveFeedback: (Utils.lang === "en")
                        ? "<p>Congratulations! You have successfully completed the exam.</p><p>This course will remain in your GCcampus account, and you may refer to it at any time.</p><p>To learn how to print your certificate, follow the instructions provided in&nbsp;<a href='https://learn-apprendre.csps-efpc.gc.ca/application/en/content/how-print-certificate-or-see-your-transcripts' rel='external' target='_blank' title='How to print a certificate or see your Transcripts'>GCcampus</a>.</p><p>If the certificate does not appear, you may need to turn off your browser’s pop up blocker. If you are still experiencing difficulties in printing your certificate, please contact your IT team.</p>"
                        : "<p>Félicitations! Vous avez complété l'examen avec succès.</p><p>Le cours sera conservé dans votre compte GCcampus. Vous pouvez le consulter à tout moment.</p><p>Pour imprimer votre certificat, suivez les instructions qui sont indiquées dans&nbsp;<a href='https://learn-apprendre.csps-efpc.gc.ca/application/fr/content/comment-imprimer-un-certificat-et-voir-vos-formations-completees' rel='external' target='_blank' title='Comment imprimer un certificat et voir vos formations complétées'>GCcampus</a>.</p><p>Si le certificat ne s’affiche pas, essayez de désactiver le système de blocage des fenêtres contextuelles de votre navigateur. Si vous ne parvenez pas à imprimer vos certificats malgré cela, communiquez avec l’équipe responsable des technologies de l’information.</p>",
                    finalNegativeFeedback: (Utils.lang === "en")
                        ? "<p>You have not successfully completed the exam. You must achieve a score of 70% or higher. Please review the course material and try again.</p>"
                        : "<p>Vous avez échoué à l’examen. Vous devez obtenir une cote d’au moins 70 %. Passez de nouveau en revue les documents de formation, puis réessayez.</p>",
                    toRestart: (Utils.lang === "en")
                        ? "To restart the exam, press the “Restart the exam” button."
                        : "Pour reprendre l’examen depuis le début, cliquez sur le bouton",
                    defaultIntro: (Utils.lang === "en")
                        ? "<p>Now that you have completed the first modules, please complete the exam.</p><p>The exam includes&nbsp;<strong>20&nbsp;questions</strong>&nbsp;and the pass grade is&nbsp;<strong>70%</strong>. The questions will be presented one at a time with instructions along the way. There is no time limit, however,&nbsp;<strong>if you have to exit before completion</strong>, you will be required to restart the exam from the beginning when you re-enter the course.</p><p>Upon completion you will be shown your score. If you have not obtained a passing grade, you will be asked to try again.</p>"
                        : "<p>Maintenant que vous avez terminé les premiers modules, vous devez passer l’examen.</p><p>Pour réussir cet examen, qui comprend 20 questions, vous devez obtenir une note d’au moins <strong>70 %</strong>. Les questions vous seront présentées l’une après l’autre et elles seront accompagnées d’instructions. Vous n’avez aucune limite de temps. Toutefois, <strong>si vous devez quitter avant la fin</strong>, vous devrez recommencer l’examen depuis le début lorsque vous rouvrirez le cours.</p><p>Votre note s’affichera à la fin de l’examen. Si vous n’avez pas obtenu la note de passage, vous serez invité à réessayer.</p>",
                    addQPool: (Utils.lang === "en")
                        ? "Add Question Pool"
                        : "Ajouter une banque de questions",
                    prevQPool: (Utils.lang === "en")
                        ? "Previous Question Pool"
                        : "Banque de questions précédente",
                    nextQPool: (Utils.lang === "en")
                        ? "Next Question Pool"
                        : "Banque de questions suivante",
                    deleteQPool: (Utils.lang === "en")
                        ? "Delete Current Question Pool"
                        : "Supprimer la banque de questions actuelle",
                    emptyActivity: (Utils.lang === "en")
                        ? "There is at least one activity, exam or question pool on this page that contains no question. Please add at least one question to each activity/exam and to each question pool in exams before going into preview mode."
                        : "Il y a au moins une activité, un examen ou une banque de questions sur cette page qui ne contient aucune question. Veuillez ajouter au moins une question dans chaque activité/examen et dans chaque banque de question des examens avant d'activer le mode de visualisation.",
                },
                linkToPage: {
                    insert: (Utils.lang === "en")
                        ? "Insert a Link to a Page"
                        : "Insérer un lien vers une page",
                    edit: (Utils.lang === "en")
                        ? "Edit Link to a Page"
                        : "Modifier le lien vers une page",
                    title: (Utils.lang === "en")
                        ? "Insert a Link to a Page in the Course"
                        : "Insérer un lien vers une page dans le cours",
                    label: (Utils.lang === "en")
                        ? "Page"
                        : "Page",
                },
                classPicker: {
                    btn: (Utils.lang === "en")
                        ? "Edit Classes"
                        : "Modifier les classes",
                    lbxTitle: (Utils.lang === "en")
                        ? "Edit custom classes"
                        : "Édition des classes personnalisées",
                    add: (Utils.lang === "en")
                        ? "Add Class"
                        : "Ajouter une classe",
                    delete: (Utils.lang === "en")
                        ? "Delete class"
                        : "Supprimer la classe",
                    label: (Utils.lang === "en")
                        ? "Class:"
                        : "Classe :",
                    current: (Utils.lang === "en")
                        ? "Current custom class(es)"
                        : "Classe(s) personnalisée(s) actuelle(s)",
                    noCurrent: (Utils.lang === "en")
                        ? "This element has no custom classes."
                        : "Cet élément n'a pas de classe personnalisée",
                    currentClasses: (Utils.lang === "en")
                        ? "This element has the following custom class(es):"
                        : "Cet élément a la/les classe(s) personnalisée(s) suivante(s) :",
                },
                style: {
                    btn: (Utils.lang === "en")
                        ? "Style Editor"
                        : "Éditeur de style",
                    lbxTitle: (Utils.lang === "en")
                        ? "Style Editor"
                        : "Éditeur de style",
                },
                review: {
                    btn: (Utils.lang === "en")
                        ? "Reviews"
                        : "Révisions",
                    lbxTitle: (Utils.lang === "en")
                        ? "Reviews"
                        : "Révisions",
                }
            },
            default: {
                details: (Utils.lang === "en")
                    ? "[Accordion]"
                    : "[Accordéon]",
                graphDesc: (Utils.lang === "en")
                    ? "Graphic Description"
                    : "Description du graphique",
                tabs: (Utils.lang === "en")
                    ? "[Tab]"
                    : "[Onglet]",
                text: (Utils.lang === "en")
                    ? "[ Insert your content here... ]"
                    : "[ Insérez votre contenu ici... ]",
                customTitle: (Utils.lang === "en")
                    ? "Ask a Developper's Help"
                    : "Demander l'aide d'un développeur",
                customContent: (Utils.lang === "en")
                    ? "<p>Don't worry, we got this.</p><p>You can write a description of what you need and we'll build it.</p>"
                    : "<p>Ne vous inquiétez pas, nous sommes là pour vous.</p><p>Vous pouvez écrire une description de ce dont vous avez besoin et nous le construirons pour vous.</p>",
                transcript: (Utils.lang === "en")
                    ? "[HTML Transcript]"
                    : "[Transcription HTML]",
                lbxTitle: (Utils.lang === "en")
                    ? "[Title]"
                    : "[Titre]",
                button: (Utils.lang === "en")
                    ? "Button"
                    : "Bouton"
            }
        },
        page404: {
            title: (Utils.lang === "en")
                ? "SNAP!"
                : "SNAP!",
            pagenotfound: (Utils.lang === "en")
                ? "Page Not Found"
                : "Page inexistante",
            whattodo: (Utils.lang === "en")
                ? "What would you like to do?"
                : "Que désirez-vous faire?",
            editormode: (Utils.lang === "en")
                ? "Editor Mode"
                : "Mode Éditeur",
            createscratch: (Utils.lang === "en")
                ? "Create a new page from scratch"
                : "Créer une nouvelle page du début",
            createtemplate: (Utils.lang === "en")
                ? "Create a new page from a template"
                : "Créer une nouvelle page à partir d'un gabarit"

        },
        structureMode: {
            editpage: (Utils.lang === "en")
                ? "Edit Page"
                : "Modifier la page",
            editfolder: (Utils.lang === "en")
                ? "Edit Folder"
                : "Modifier le dossier",
            deletepage: (Utils.lang === "en")
                ? "Delete Page"
                : "Supprimer la page",
            deletefolder: (Utils.lang === "en")
                ? "Delete Folder"
                : "Supprimer le dossier",
            title: (Utils.lang === "en")
                ? "Structure Editing"
                : "Édition de la structure",
            addPage: (Utils.lang === "en")
                ? "Add Page"
                : "Ajouter une page",
            addFolder: (Utils.lang === "en")
                ? "Add Folder"
                : "Ajouter un dossier",
        },
        settingsmode: {
            settingsTitle: (Utils.lang === "en")
                ? "Settings"
                : "Paramètres",
            mainSettingsTitle: (Utils.lang === "en")
                ? "Main Settings"
                : "Paramètres généraux",
            courseLegacyCode: {
                name: (Utils.lang === "en")
                    ? "Course Legacy Code"
                    : "Code legacy",
                description: (Utils.lang === "en")
                    ? "Code attributed to the course"
                    : "Code fourni pour identifier le cours"
            },
            courseTitle_en: {
                name: (Utils.lang === "en")
                    ? "Course Title (English)"
                    : "Titre du cours (anglais)",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            courseTitle_fr: {
                name: (Utils.lang === "en")
                    ? "Course Title (French)"
                    : "Titre du cours (français)",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            courseSubtitle_en: {
                name: (Utils.lang === "en")
                    ? "Course Subtitle (English)"
                    : "Sous-titre du cours (anglais)",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            courseSubtitle_fr: {
                name: (Utils.lang === "en")
                    ? "Course Subtitle (French)"
                    : "Sous-titre du cours (français)",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            seriesTitle_en: {
                name: (Utils.lang === "en")
                    ? "Series Title (English)"
                    : "Titre de la série (anglais)",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            seriesTitle_fr: {
                name: (Utils.lang === "en")
                    ? "Series Title (French)"
                    : "Titre de la série (français)",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            toolbarTitle: (Utils.lang === "en")
                ? "Toolbar Options"
                : "Options de la barre d'outils",
            langTitle: (Utils.lang === "en")
                ? "Language"
                : "Langue",
            showLangSwitch: {
                name: (Utils.lang === "en")
                    ? "Language Toggle"
                    : "Changement de langue",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            mainBtnsTitle: (Utils.lang === "en")
                ? "Main Buttons"
                : "Boutons principaux",
            showHome: {
                name: (Utils.lang === "en")
                    ? "Home Button"
                    : "Bouton Accueil",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            showHelp: {
                name: (Utils.lang === "en")
                    ? "Help Button"
                    : "Bouton Aide",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            showSitemap: {
                name: (Utils.lang === "en")
                    ? "Sitemap Button"
                    : "Bouton Plan de site",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            showExit: {
                name: (Utils.lang === "en")
                    ? "Exit Button"
                    : "Bouton Quitter",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            toolboxTitle: (Utils.lang === "en")
                ? "Toolbox"
                : "Boîte à outils",
            showGlossary: {
                name: (Utils.lang === "en")
                    ? "Glossary Button"
                    : "Bouton Glossaire",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            showResources: {
                name: (Utils.lang === "en")
                    ? "Resources Button"
                    : "Bouton Ressources",
                description: (Utils.lang === "en")
                    ? ""
                    : ""
            },
            save: (Utils.lang === "en")
                ? "Save Settings"
                : "Sauvegarder les paramètres",

        },
        resourcesEdit: {
            note: (Utils.lang === "en")
                ? "<strong>Note: </strong>This mode edits the content of the “Glossary” and “Resources” pages contained in the course's toolbox."
                : "<strong>Note&nbsp;: </strong>Ce mode permet de modifier les pages «&nbsp;Glossaire&nbsp;» et «&nbsp;Ressources&nbsp;» de la boîte à outil du cours.",
            noGlossary: (Utils.lang === "en")
                ? "The Glossary page is deactivated in the course. Activate it using the Settings edit mode in order to edit its content."
                : "La page Glossaire n'est pas activée dans le cours. Veuillez l'activer dans le mode Configuration pour modifier son contenu.",
            noResources: (Utils.lang === "en")
                ? "The Resources page is deactivated in the course, activate it using the Settings edit mode in order to edit its content."
                : "La page Ressources n'est pas activée dans le cours. Veuillez l'activer dans le mode Configuration pour modifier son contenu.",
            save: (Utils.lang === "en")
                ? "Save Toolbox Pages"
                : "Sauvegarder les pages de la boîte à outils",
            resourcesTitle: (Utils.lang === "en")
                ? "Resources"
                : "Ressources",

            glossary: {
                glossaryTitle: (Utils.lang === "en")
                    ? "Glossary"
                    : "Glossaire",
                term: (Utils.lang === "en")
                    ? "Term"
                    : "Terme",
                def: (Utils.lang === "en")
                    ? "Definition"
                    : "Définition",
                insertTerm: (Utils.lang === "en")
                    ? "Insert the term here"
                    : "Insérer le terme ici",
                insertDefinition: (Utils.lang === "en")
                    ? "Insert the definition here"
                    : "Insérer la définition ici",
                delete: (Utils.lang === "en")
                    ? "Delete term "
                    : "Supprimer le terme ",
                add: (Utils.lang === "en")
                    ? "Add a term "
                    : "Ajouter un terme",
                saveDone: (Utils.lang === "en")
                    ? "Glossary saved"
                    : "Glossaire sauvegardé",
                insert: (Utils.lang === "en")
                    ? "Insert a Glossary Term"
                    : "Insérer un terme du glossaire",
                edit: (Utils.lang === "en")
                    ? "Edit Glossary Term"
                    : "Modifier le terme de glossaire"
            },
            abbr: {
                abbrTitle: (Utils.lang === "en")
                    ? "Abbreviations"
                    : "Abbréviations",
                term: (Utils.lang === "en")
                    ? "Abbreviation"
                    : "Abbréviation",
                def: (Utils.lang === "en")
                    ? "Description"
                    : "Description",
                insertTerm: (Utils.lang === "en")
                    ? "Insert the abbreviation here"
                    : "Insérer l'abbréviation ici",
                insertDefinition: (Utils.lang === "en")
                    ? "Insert the description here"
                    : "Insérer la description ici",
                delete: (Utils.lang === "en")
                    ? "Delete abbreviation "
                    : "Supprimer l'abbréviation ",
                add: (Utils.lang === "en")
                    ? "Add an abbreviation "
                    : "Ajouter une abbréviation",
                saveDone: (Utils.lang === "en")
                    ? "Abbreviations saved"
                    : "Abbréviations sauvegardées",
                insert: (Utils.lang === "en")
                    ? "Insert an Abbreviation"
                    : "Insérer une abbréviation",
                edit: (Utils.lang === "en")
                    ? "Edit Abbreviation"
                    : "Modifier l'abbréviation",
            },
            ext: {
                extTitle: (Utils.lang === "en")
                    ? "External Links"
                    : "Liens externes",
                text: (Utils.lang === "en")
                    ? "Link text"
                    : "Texte du lien",
                link: (Utils.lang === "en")
                    ? "Link destination"
                    : "Destination du lien",
                desc: (Utils.lang === "en")
                    ? "Link description"
                    : "Description du lien",
                insertText: (Utils.lang === "en")
                    ? "Insert the link text here"
                    : "Insérer le texte du lien ici",
                insertLink: (Utils.lang === "en")
                    ? "Insert the link destination here"
                    : "Insérer la destination du lien ici",
                insertDesc: (Utils.lang === "en")
                    ? "Insert the link description here"
                    : "Insérer la description du lien ici",
                delete: (Utils.lang === "en")
                    ? "Delete external link "
                    : "Supprimer le lien externe ",
                add: (Utils.lang === "en")
                    ? "Add an external link "
                    : "Ajouter un lien externe",
                saveDone: (Utils.lang === "en")
                    ? "External links saved"
                    : "Liens externes sauvegardés",
                saveNotDone: (Utils.lang === "en")
                    ? "External links were not saved"
                    : "Les liens externes n'ont pas été sauvegardés",
                errorStart: (Utils.lang === "en")
                    ? "The link for &ldquo;"
                    : "L'adresse pour le lien «&nbsp;",
                spaceError: (Utils.lang === "en")
                    ? "&rdquo; contains (a) space(s). Therefore it is not valid. Please fix this error in order to save the external links."
                    : "&nbsp;» contient un/des espace(s), elle n'est donc pas valide. Veuillez corriger cette erreur afin de pouvoir sauvegarder les liens externes.",
                httpError: (Utils.lang === "en")
                    ? "&rdquo; does not contain a protocol (e.g. &ldquo;http://&rdquo; or &ldquo;https://&rdquo; at the start of the URL). Therefore, it is going to be treated as a local link."
                    : "&nbsp;» ne contient pas de protocole (c.-à-d. «&nbsp;http://&nbsp;» ou «&nbsp;https://&nbsp;» au début de l'URL). Ainsi, le lien sera traité comme un lien local.",
                insert: (Utils.lang === "en")
                    ? "Insert an External Link"
                    : "Insérer un lien externe",
                edit: (Utils.lang === "en")
                    ? "Edit External Link"
                    : "Modifier le lien externe",
                label: (Utils.lang === "en")
                    ? "Link"
                    : "Lien"
            }
        },
        interface: {
            prompts: {
                getfilename: (Utils.lang === "en")
                    ? "Please enter the Template Name"
                    : "Veuillez entrer le nom du gabarit",
                invalidChar: (Utils.lang === "en")
                    ? "Invalid character"
                    : "Caractère invalide",
                enterValid: (Utils.lang === "en")
                    ? "Please enter a valid character."
                    : "Veuillez entrer un caractère valide.",
                noEmpty: (Utils.lang === "en")
                    ? "You cannot leave this answer empty."
                    : "Vous ne pouvez pas laisser une réponse vide.",
                resetTextValue: (Utils.lang === "en")
                    ? "Do you want to reset the text values?"
                    : "Est-ce que vous souhaitez réinitialiser les valeurs des textes?"
            }
        }
    };


    return labels;
});
