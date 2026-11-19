/**
 * Return Shelf Machine — contenu du projet (Scan Everything 2026, brief « Test, Fail, Fix », ECAL MaDXD).
 * Groupe : Shinyoung Park & Emilie Muller (dossier étudiant « Shinyoung_Emilie »).
 *
 * Même schéma que rectify.js. RÈGLE ABSOLUE : les textes étudiants sont copiés tels quels.
 * Ne jamais les corriger, reformuler, raccourcir ni traduire.
 *
 * Sources (dossier ~/Documents/ECAL/AS_9/TEST-FAIL_FIX/Test-Fail-Fix/Shinyoung_Emilie/) :
 * - Text_and_images/<chapitre>/*Text.txt : chaque texte y est étiqueté avec les images qu'il
 *   accompagne (« [1-Test-02~04] ») : texte puis galerie de ces images, dans l'ordre du fichier ;
 * - UserTestBrief_…pdf et UserBehaviorDiscovery_…pdf : gardés dans `extra` et en lien.
 * Les textes de ce fichier ont été extraits par script des fichiers sources, pas retapés.
 *
 * Les champs `alt` et les libellés d'interface (« Next chapter »…) ne viennent PAS des étudiants.
 * Les images sont référencées par leur chemin relatif à `src/lib/assets/projects/return-shelf-machine/`.
 */

/** @type {import('../types.js').Project} */
const returnShelfMachine = {
	slug: "return-shelf-machine",
	title: "Return Shelf Machine",
	edition: "Scan Everything 2026",
	// Noms dans les fichiers : « ParkShinyoung_MullerEmilie » (nom puis prénom, comme « NeyroudThomas » pour Rectify)
	authors: ["Shinyoung Park", "Emilie Muller"],
	year: "2026",
	documentation: {
		label: "UserBehaviorDiscovery_Shinyoung_Emilie_22052026.pdf",
		href: "/projects/return-shelf-machine/UserBehaviorDiscovery_Shinyoung_Emilie_22052026.pdf",
	},

	/** Page d'accueil du projet — route /return-shelf-machine (layout « cover ») */
	home: {
		layout: "cover",
		theme: "orange",
		// Pas de dessin isométrique fourni par le groupe.
		blocks: [
				// verbatim — Intro/…IntroText.txt, [Introduction] (libellé = étiquette du fichier)
				{
					type: "textRow",
					label: "Introduction",
					text: "The Return Shelf Machine is a scanning interface for the design library. It reimagines the \"return shelf\" as a discovery tool, surfacing what a catalogue can't capture about a physical book.\n\nWhen a designer places a book on the scan tray, the system recognizes it and shows information in the designer's own vocabulary, then links it to other books with similar qualities. This opens up a more serendipitous way of finding references.",
				},
				// verbatim — Intro/…IntroText.txt, [Context] (libellé = étiquette du fichier)
				{
					type: "textRow",
					label: "Context",
					text: "For a designer, gathering editorial references works differently from a general information search. The designer does not start with a clear question, so keyword search has nothing to go on.\nLegacy systems like OPAC, however, sort books by subject and content, not by the qualities designers actually work with. This project proposes a new way of navigating books through a design lexicon.",
				},
			{ type: "credits" },
		],
		next: { label: "Next chapter", number: "01", title: "Test", to: "test" },
	},

	chapters: [
		/* ------------------------------------------------------------------ TEST */
		{
			slug: "test",
			number: "01",
			title: "Test",
			layout: "chapter",
			theme: "white",
			blocks: [
				// verbatim — test/…TestText.txt, 1re phrase de [1-Test-01]
				{
					type: "headline",
					text: "We started from observation.",
				},
				// verbatim — suite de [1-Test-01]
				{
					type: "textRow",
					label: "",
					text: "At the design library, we looked at how the space sits in its normal state and how designers move through it.\nFrom this observation, three ways of finding references emerged. Ones existing catalogues cannot capture in the physical library:\n\n(1) Designer - other books by the same designer\n(2) Returned With - other books taken alongside this one\n(3) Materiality - size, binding, and physical format",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test-01.png", alt: "Observation: returned books piled on tables and trolleys at the design library." }, // test/…TestImages_01.png
					],
				},
				// verbatim — [1-Test-02~04]
				{
					type: "textRow",
					label: "",
					text: "Then we designed the first version of the prototype: a physical setup (shelf, tray, screen placement) and a digital interface for surfacing related books, along with the user flow tying them together.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test-02.png", alt: "Schemas of the library space and of the setup: shelf, table and screen." }, // test/…TestImages_02.png
						{ image: "test-03.png", alt: "Tangible setup (v1) with books on the tray, and digital setup (v1) on the tablet." }, // test/…TestImages_03.png
						{ image: "test-04.png", alt: "User flow: take a book from the tray, the scanner detects it, the screen displays related books." }, // test/…TestImages_04.png
					],
				},
				// verbatim — [1-Test-05]
				{
					type: "textRow",
					label: "",
					text: "The visual identity borrows from the shelf itself. Stacked books and pile-like layouts mirror how returned books actually sit in the library.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test-05.png", alt: "Visual identity: stacked book covers, tags « Designer », « Returned with » and « Materiality »." }, // test/…TestImages_05.png
					],
				},
			],
			next: { label: "Next chapter", number: "02", title: "Fail", to: "fail" },
		},

		/* ------------------------------------------------------------------ FAIL */
		{
			slug: "fail",
			number: "02",
			title: "Fail",
			layout: "chapter",
			theme: "white",
			blocks: [
				// verbatim — Fail/…FailText.txt, [2-Fail-01~02] (une seule phrase)
				{
					type: "headline",
					text: "We ran a usability test session to check whether the concept works as a whole, and to evaluate the usability of both the physical and digital setup.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "fail-01.png", alt: "v1 objective: the research question of the test." }, // Fail/…Failimages_01.png
						{ image: "fail-02.png", alt: "v1 objectives: self-explanatory, navigation system, unexpected recommendation, sense of gain." }, // Fail/…Failimages_02.png
					],
				},
				// verbatim — [2-Fail-03], paragraphe d'introduction
				{
					type: "textRow",
					label: "",
					text: "The session conducted with 3 tasks on an early prototype. Our 5 participants varied in editorial-design experience and in how they navigate libraries.",
				},
				// verbatim — [2-Fail-03], tâche 1 (libellé = titre de la tâche)
				{
					type: "textRow",
					label: "Task 1 - Precise exploration (3 min)",
					text: "You want to learn more about the book Words Form Language.\nYour goal is to:\n→ Pick up the right book.\n→ Navigate the interface to find another book by the same designer.\n→ Find its location in the library.",
				},
				// verbatim — [2-Fail-03], tâche 2 (libellé = titre de la tâche)
				{
					type: "textRow",
					label: "Task 2 - Navigate via tag (5 min)",
					text: "For design research, you want to find more references with the same materiality as MacGuffin Magazine.\nYour goal is to:\n→ Pick up the right book.\n→ Find a book with similar materiality.\n→ Find its location in the library.\n→ Check the \"Returned With\" tag and see if you can find the location of the first stack.",
				},
				// verbatim — [2-Fail-03], tâche 3 (libellé = titre de la tâche)
				{
					type: "textRow",
					label: "Task 3 - Multiple books (5 min)",
					text: "For your design project, you want to check out several books. Add two more to the one you already have: take the Brigade Cynophile poster book and Words Form Language from the shelf.\nYour goal is to:\n→ Pick up the right books.\n→ Try scrolling from one book to another.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "fail-03.png", alt: "Test protocol: intro, pre-test questionnaire, testing tasks 1 to 3, post-test interview." }, // Fail/…Failimages_03.png
					],
				},
				// verbatim — [2-Fail-04~09]
				{
					type: "textRow",
					label: "",
					text: "Participants were asked to think aloud throughout. The scanning step was faked using a Wizard-of-Oz setup with a custom-built controller, and all observations were analysed through affinity mapping.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "fail-04.png", alt: "Test sessions in context: participants taking books from the shelf and using the screen.", group: "Sessions" }, // Fail/…Failimages_04.png
						{ image: "fail-06.png", alt: "Raw data spreadsheet of the usability test.", group: "Raw data" }, // Fail/…Failimages_06.png
						{ image: "fail-07.png", alt: "Observations by task, on sticky notes.", group: "Sticky notes" }, // Fail/…Failimages_07.png
						{ image: "fail-08.png", alt: "Post-test feedback on sticky notes.", group: "Sticky notes" }, // Fail/…Failimages_08.png
						{ image: "fail-09.png", alt: "Affinity mapping of all the observations.", group: "Sticky notes" }, // Fail/…Failimages_09.png
					],
				},
				// Failimages_05 (vidéo de [2-Fail-04~09]) : après la galerie, pour ne pas couper le bureau en deux.
				{
					type: "video",
					columns: 1,
					items: [
						{
							src: "/projects/return-shelf-machine/videos/fail-05.mp4", // Fail/…Failimages_05.mp4
							poster: "/projects/return-shelf-machine/videos/fail-05.webp",
							width: 1404,
							height: 754,
							label: "The tablet interface during the test, next to the phone used to control it.",
						},
					],
				},
			],
			next: { label: "Next chapter", number: "03", title: "Fix", to: "fix" },
		},

		/* ------------------------------------------------------------------ FIX */
		{
			slug: "fix",
			number: "03",
			title: "Fix",
			layout: "chapter",
			theme: "white",
			blocks: [
				// verbatim — Fix/…FixText.txt, [3-Fix-01] (une seule phrase)
				{
					type: "headline",
					text: "Based on the test, we evaluated the v1 prototype against our original objectives.",
				},
				{
					type: "gallery",
					columns: 1,
					fit: "contain",
					items: [
						{ image: "fix-01.png", alt: "v1 evaluation: self-explanatory and clear understanding partially met, serendipitous discovery met, overall experience met with new expectations." }, // Fix/…Fixmages_01.png
					],
				},
				// verbatim — [3-Fix-02~08]
				{
					type: "textRow",
					label: "",
					text: "We then iterated toward v2, addressing the main problems the test surfaced across the navigation, the interface, and the physical setup.",
				},
				// Comparaisons V1 / V2 découpées pour le bloc « gallery » (vue viewer), chaque côté avec ses notes
				// « V1 → … » / « V2 → … ». Le titre en bas de l'image d'origine (« Legible Navigation »…) n'est pas repris.
				{
					type: "gallery",
					variant: "viewer",
					columns: 1,
					fit: "contain",
					items: [
						// fix-02.png (Fix/…Fixmages_02.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/fix-02-before.png",
							alt: "Legible navigation, V1: tags often misread, confusing text hierarchy.",
							after: { image: "fix/fix-02-after.png", alt: "Legible navigation, V2: clearer text hierarchy, a description for each tag, clickable items." },
						},
						// fix-03.png (Fix/…Fixmages_03.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/fix-03-before.png",
							alt: "First encounter, V1: the interface with book covers and no scan feedback.",
							after: { image: "fix/fix-03-after.png", alt: "First encounter, V2: “Returned Book Shelf” with a scanning feedback." },
						},
						// fix-05.png (Fix/…Fixmages_05.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/fix-05-before.png",
							alt: "Physical embodiment, V1: the prototype is too low and the books lie flat.",
							after: { image: "fix/fix-05-after.png", alt: "Physical embodiment, V2: a higher prototype, the books stand on their side." },
						},
					],
				},
				{
					type: "gallery",
					columns: 1,
					fit: "contain",
					items: [
						{ image: "fix-08.png", alt: "Potential amelioration: comparing two picked books, Words form language and The Life of Things." }, // Fix/…Fixmages_08.png
					],
				},
				// Fixmages_04, 06 et 07 (vidéos de [3-Fix-02~08]) : après les comparaisons, dans l'ordre.
				// [À CONFIRMER] 04 et 06 ont une piste audio : parole ou ambiance ? (sous-titres si parole)
				{
					type: "video",
					columns: 1,
					items: [
						{
							src: "/projects/return-shelf-machine/videos/fix-04.mp4", // Fix/…Fixmages_04.mp4
							poster: "/projects/return-shelf-machine/videos/fix-04.webp",
							width: 1556,
							height: 1080,
							label: "V2 first encounter: the scanned book appears on the screen, then its details open.",
						},
						{
							src: "/projects/return-shelf-machine/videos/fix-06.mp4", // Fix/…Fixmages_06.mp4
							poster: "/projects/return-shelf-machine/videos/fix-06.webp",
							width: 1546,
							height: 1080,
							label: "V2 navigation: related books linked to their place on the library shelves.",
						},
						{
							src: "/projects/return-shelf-machine/videos/fix-07.mp4", // Fix/…Fixmages_07.mp4
							poster: "/projects/return-shelf-machine/videos/fix-07.webp",
							width: 1546,
							height: 1080,
							label: "V2 navigation: switching between the Designer, Returned with and Materiality tags.",
						},
					],
				},
			],
			next: {
				label: "Next chapter",
				number: "04",
				title: "Conclusion",
				to: "conclusion",
			},
		},

		/* ------------------------------------------------------------------ CONCLUSION */
		{
			slug: "conclusion",
			number: "04",
			title: "Conclusion",
			layout: "cover",
			theme: "orange",
			blocks: [
				// Pas de titre : le groupe n'a pas de texte de conclusion (à compléter avec Martial).
				{
					type: "figure",
					image: "main-01.png", // Showcase_image/…Intro2.png
					alt: "The Returned Book Shelf: books standing on a shelf next to a tablet on a stand.",
				},
				// [À CONFIRMER] piste audio : parole ou musique ? (les sous-titres sont incrustés dans l'image)
				{
					type: "video",
					columns: 1,
					items: [
						{
							src: "/projects/return-shelf-machine/videos/demo.mp4", // Intro/…TestFailFix_Demo.mp4
							poster: "/projects/return-shelf-machine/videos/demo.webp",
							width: 1920,
							height: 1080,
							label: "Demo: a book is taken from the shelf, and the tablet shows related books in the library.",
						},
					],
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{ image: "main-02.png", alt: "Close-up of the tablet showing “Returned Book Shelf” next to the book Words form language." }, // Showcase_image/…Intro1.png
						{ image: "main-03.png", alt: "The shelf with books and the tablet, front view." }, // Showcase_image/2.png
					],
				},
				{ type: "credits" },
			],
			next: {
				label: "Back to the start",
				number: "",
				title: "Return Shelf Machine",
				to: "",
				arrow: "up",
			},
		},
	],

	/**
	 * Infos supplémentaires du groupe, pas affichées par le gabarit actuel. Textes verbatim.
	 */
	extra: {
		sourceFolder: "Shinyoung_Emilie",
		links: {
			prototype: "https://www.figma.com/design/089kB8d2ol3Zjf9aOg57UK/-Scan-Everything--Design?node-id=563-545&t=kjLCIQpSClTZmk9H-1",
			presentation: "https://www.figma.com/deck/4bnW7cmudVOYAuuW71jMXs/-Scan-Everything--Final-Presentation?node-id=1-354&viewport=-114%2C-75%2C0.54&t=PzJSlEYDBZpg9dsO-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1",
		},
		documents: {
			userTestBrief: "/projects/return-shelf-machine/UserTestBrief_Shinyoung_Emilie_22052026.pdf",
		},
		// UserTestBrief…pdf
		targetUser: "A designer visiting the design library to gather material and visual references for an editorial design project.",
		researchQuestion: "Does the interface allow a designer to discover material and visual references they would not have found through conventional search, and does the experience feel natural and self-explanatory?",
		// UserBehaviorDiscovery…pdf, fin de « 5.2. v2 improvement objectives »
		v2Decision: "Decision made to work mainly on Objective 1,2, and partially on 3.\nLeave Objective 4 as a future improvement.",
		// Médias non utilisés : vidéos Showcase_image/…Demo.mp4 (= Intro/…Demo.mp4, utilisée) et
		// WizardOfOz_RemoteControllerSetup….mov, variantes Intro/…Intro2 copy*.png et .psd, 2 .docx (= les 2 PDF).
	},
};

export default returnShelfMachine;
