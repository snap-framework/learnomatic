define(['utils'], function (Utils) {
	'use strict';
	
/* liste des constantes du framework */

	var labels = {
		choose:(Utils.lang === "en")?
					"Choose":
					"Choisir",

		tools:{
			previewtoggle:(Utils.lang === "en")?
					"Show/Hide Preview":
					"Voir/Cacher aperçu",
			layout:(Utils.lang === "en")?
					"Change Layout":
					"Changer disposition",
			template:(Utils.lang === "en")?
					"Save as Template":
					"Sauvegarder le Gabarit",
			deletepage:(Utils.lang === "en")?
					"Delete Page":
					"Supprimer la page",
			deleteconfirm:(Utils.lang === "en")?
					"Delete current page?":
					"Supprimer la page actuelle?",
			newpage:(Utils.lang === "en")?
					"New Page":
					"Nouvelle page",
			test:(Utils.lang === "en")?
					"test":
					"test",
			localView:(Utils.lang === "en")?
					"Local View":
					"Vue Locale",
			globalView:(Utils.lang === "en")?
					"Global View":
					"Vue D'ensemble"
		},
		modes:{
			preview:(Utils.lang === "en")?
					"Preview":
					"Visualiser",
			pageEdit:(Utils.lang === "en")?
					"Page Edit":
					"Pége Viou",
			structure:(Utils.lang === "en")?
					"Structure Edit":
					"Structure",
			theme:(Utils.lang === "en")?
					"Theme Edit":
					"Thème",
			settings:(Utils.lang === "en")?
					"Settings Edit":
					"Configuration"
			
		},
		
		layout:{
			choose:(Utils.lang === "en")?
				"Choose Your Layout":
				"Choisissez votre disposition"
		},
		frame:{
			add : (Utils.lang === "en")?
					"Add Element":
					"Ajouter Un Élément"
		},
		element:{
			type:{
				default:(Utils.lang === "en")?
					"Element":
					"Élément",
				text:(Utils.lang === "en")?
					"Text":
					"Texte",
				title:(Utils.lang === "en")?
					"Title":
					"Titre",
				exam:(Utils.lang === "en")?
					"Exam":
					"Examen",
				activity:(Utils.lang === "en")?
					"Activity":
					"Activité"
			},
			editview:{
				add:(Utils.lang === "en")?
					"Add":
					"Ajouter",
				edit:(Utils.lang === "en")?
					"Edit":
					"Éditer",
				config:(Utils.lang === "en")?
					"Config":
					"Configurer",
				delete:(Utils.lang === "en")?
					"Delete":
					"Supprimer",
				save:(Utils.lang === "en")?
					"Save":
					"Sauvegarder",
				move:(Utils.lang === "en")?
					"Move Element":
					"Déplacer Élément"
			}
		},
		page404:{
			title:(Utils.lang === "en")?
					"SNAP!":
					"SNAP!",
			pagenotfound:(Utils.lang === "en")?
					"Page Not Found":
					"Page inexistante",
			whattodo:(Utils.lang === "en")?
					"What would you like to do?":
					"Que désirez-vous faire?",
			editormode:(Utils.lang === "en")?
					"Editor Mode":
					"Mode Éditeur",
			createscratch:(Utils.lang === "en")?
					"Create a new page from scratch":
					"Créer une nouvelle page du début",
			createtemplate:(Utils.lang === "en")?
					"Create a new page from a template":
					"Créer une nouvelle page à partir d'un gabarit"
			
		},
		structureMode:{
			editpage:(Utils.lang === "en")?
				"Edit Page":
				"Modifier la page",
			editfolder:(Utils.lang === "en")?
				"Edit Folder":
				"Modifier le dossier",
			deletepage:(Utils.lang === "en")?
				"Delete Page":
				"Supprimer la page",
			deletefolder:(Utils.lang === "en")?
				"Delete Folder":
				"Supprimer le dossier",
		},
		settingsmode:{
			courseLegacyCode:{
				name:(Utils.lang === "en")?
					"Course Legacy Code":
					"Code legacy",
				description:(Utils.lang === "en")?
					"Code attributed to the course":
					"Code fourni pour identifier le cours"
			},
			courseTitle_en:{
				name:(Utils.lang === "en")?
					"Course Title (English)":
					"Titre du cours (anglais)",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			courseTitle_fr:{
				name:(Utils.lang === "en")?
					"Course Title (French)":
					"Titre du cours (français)",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			courseSubtitle_en:{
				name:(Utils.lang === "en")?
					"Course Subtitle (en)":
					"Sous-titre du cours",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			courseSubtitle_fr:{
				name:(Utils.lang === "en")?
					"Course Subtitle (fr)":
					"Sous-titre du cours",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			seriesTitle_en:{
				name:(Utils.lang === "en")?
					"Series Title (en)":
					"Titre de la série",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			seriesTitle_fr:{
				name:(Utils.lang === "en")?
					"Series Title (fr)":
					"Titre de la série(fr)",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showLangSwitch:{
				name:(Utils.lang === "en")?
					"Language Toggle":
					"Changement de langue",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showHome:{
				name:(Utils.lang === "en")?
					"Home Button":
					"Bouton Accueil",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showHelp:{
				name:(Utils.lang === "en")?
					"Help Button":
					"Bouton Aide",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showSitemap:{
				name:(Utils.lang === "en")?
					"Sitemap Button":
					"Bouton Plan de site",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showGlossary:{
				name:(Utils.lang === "en")?
					"Glossary Button":
					"Bouton Glossaire",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showResources:{
				name:(Utils.lang === "en")?
					"Resources Button":
					"Bouton Ressources",
				description:(Utils.lang === "en")?
					"":
					""				
			},
			showExit:{
				name:(Utils.lang === "en")?
					"Exit Button":
					"Bouton Quitter",
				description:(Utils.lang === "en")?
					"":
					""				
			}
			
			
		}
	};


	return labels;
});