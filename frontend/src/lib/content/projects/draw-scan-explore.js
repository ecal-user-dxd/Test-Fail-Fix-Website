/**
 * Draw - Scan - Explore — contenu du projet (Scan Everything 2026, brief « Test, Fail, Fix », ECAL MaDXD).
 * Groupe : Youri Zermatten & Sina Fathollahi (dossier étudiant « Youri_Sina »).
 *
 * Le groupe appelle son projet « Scan Everything », comme le module. Titre affiché = leur sous-titre
 * « Draw - Scan - Explore » (documentation écrite), pour ne pas répéter le nom de l'édition.
 *
 * Même schéma que rectify.js. RÈGLE ABSOLUE : les textes étudiants sont copiés tels quels.
 * Ne jamais les corriger, reformuler, raccourcir ni traduire.
 *
 * Sources (dossier ~/Documents/ECAL/AS_9/TEST-FAIL_FIX/Test-Fail-Fix/Youri_Sina/) :
 * - Text_and_images/<chapitre>/*Text.txt : chaque texte y est étiqueté avec les images qu'il
 *   accompagne (« [1-Test-06~07] ») : texte puis galerie de ces images, dans l'ordre du fichier ;
 * - User Test_Documentation_WrittenFile_YZ_SF.pdf, « 11. Conclusion » : textes de la conclusion
 *   (retours à la ligne du PDF remplacés par des espaces).
 * Les textes de ce fichier ont été extraits par script des fichiers sources, pas retapés.
 *
 * Les champs `alt` et les libellés d'interface (« Next chapter »…) ne viennent PAS des étudiants.
 * Les images sont référencées par leur chemin relatif à `src/lib/assets/projects/draw-scan-explore/`.
 */

/** @type {import('../types.js').Project} */
const drawScanExplore = {
	slug: "draw-scan-explore",
	title: "Draw - Scan - Explore",
	edition: "Scan Everything 2026",
	// Ordre de leur documentation et présentation (« Youri Zermatten & Sina Fathollahi »)
	authors: ["Youri Zermatten", "Sina Fathollahi"],
	year: "2026",
	// Leurs PDF de documentation font 53 Mo (écrit) et 95 Mo (boards) : l'écrit est en ligne, recompressé
	// (2,8 Mo, images à 200 dpi, texte intact), fichier renommé sans espaces.
	documentation: { label: "User Test_Documentation_WrittenFile_YZ_SF.pdf", href: "/projects/draw-scan-explore/User_Test_Documentation_WrittenFile_YZ_SF.pdf" },

	/** Page d'accueil du projet — route /draw-scan-explore (layout « cover ») */
	home: {
		layout: "cover",
		theme: "orange",
		// Pas de dessin isométrique fourni par le groupe.
		blocks: [
				// verbatim — Intro/…IntroText.txt, [Introduction] (libellé = étiquette du fichier)
				{
					type: "textRow",
					label: "Introduction",
					text: "Scan Everything is an interactive installation for the Alimentarium food museum in Vevey. Visitors draw a fruit or vegetable on a paper card, slide it into a scanner, and an AI recognises the sketch and adds it to a shared, ever-growing collection that everyone can explore.",
				},
				// verbatim — Intro/…IntroText.txt, [Context] sans la dernière ligne (légendes des images, dans `extra`)
				{
					type: "textRow",
					label: "Context",
					text: "It pairs a hands-on, analog gesture - drawing by hand - with a living digital archive, turning a passive museum visit into a small act of authorship. For a museum, the challenge is participation: most interactive screens are either too complex or too shallow to leave any personal trace. Scan Everything keeps the meaningful moments physical and lets the digital layer do the recognition, feedback and collective memory.\n\nThe core journey stays simple: Understand -> Draw -> Scan -> Explore.\n\nA collaboration with Youri Zermatten, in the S2 \"Scan Everything\" module (Test / Fail / Fix), MA Digital Experience Design, ECAL.",
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
				// verbatim — Test/…TestText.txt, [1-Test-01~03] (une seule phrase)
				{
					type: "headline",
					text: "First we designed the installation and staged it in the ECAL studio: a touchscreen table paired with a custom-built scanner box, drawing tools and printed cards, arranged so a visitor moves naturally from drawing, to scanning, to exploring.",
				},
				// verbatim — [1-Test-04]
				{
					type: "textRow",
					label: "",
					text: "Six participants across five sessions - a mix of museum habits and digital comfort, one session tested as a duo - went through the whole flow while thinking aloud. Every session was recorded so we could review it afterwards.",
				},
				// verbatim — [1-Test-05]
				{
					type: "textRow",
					label: "",
					text: "We followed a clear procedure: consent, pre-test questions, a scenario, the think-aloud interaction, then during- and post-test questions.",
				},
				// verbatim — [1-Test-06~07]
				{
					type: "textRow",
					label: "",
					text: "We asked quantitative questions (age range / museum habits, touchscreen comfort 1-5, previous interactive experiences) and qualitative ones (how the drawing, scanning and collection felt, the emotions, and expectations for the future).",
				},
				// Un seul bureau après les 4 paragraphes ; libellés de groupe = titres des diapositives de la présentation,
				// choisis d'après ce que montrent les photos (docs/desk-legends.md). TestImages_07 retirée : fichier
				// identique à TestImages_06 (déjà dans le dossier des étudiants). TestImages_08 n'a pas d'étiquette dans le texte.
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test-01.jpg", alt: "The installation staged in the ECAL studio: touchscreen table, laptop, studio lights and cameras.", group: "Test Setups" }, // Test/…TestImages_01.jpg
						{ image: "test-02.jpg", alt: "Test setup in the studio: the touchscreen table, two chairs and cameras on tripods.", group: "Test Setups" }, // Test/…TestImages_02.jpg
						{ image: "test-03.jpg", alt: "A hand slides a drawing card into the white scanner box.", group: "Prototype Details" }, // Test/…TestImages_03.jpg
						{ image: "test-04.jpg", alt: "The touchscreen table showing drawings, with the scanner box underneath.", group: "Prototype Details" }, // Test/…TestImages_04.jpg
						{ image: "test-05.jpg", alt: "Hand-drawn sketch of the prototype setup: table, touchscreen, computer and scanner.", group: "Prototype Details" }, // Test/…TestImages_05.jpg
						{ image: "test-06.jpg", alt: "Two participants at the touchscreen table during a test session.", group: "Participants" }, // Test/…TestImages_06.jpg
						{ image: "test-08.jpg", alt: "A participant at the touchscreen table, on the “Draw a fruit or vegetable” screen.", group: "Participants" }, // Test/…TestImages_08.jpg
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
				// verbatim — Fail/…FailText.txt, 1re phrase de [2-Fail-01]
				{
					type: "headline",
					text: "The test gave us the results we needed in order to improve.",
				},
				// verbatim — suite de [2-Fail-01]
				{
					type: "textRow",
					label: "",
					text: "We mapped every observation into an analysis matrix - theme by participant - to see the patterns clearly.",
				},
				// verbatim — [2-Fail-02~03]
				{
					type: "textRow",
					label: "",
					text: "Overall impressions were warm: the experience felt intuitive and playful, and people loved seeing their drawing join a shared collection. But the recordings and the think-aloud surfaced clear friction, moment by moment.",
				},
				// verbatim — [2-Fail-04~07]
				{
					type: "textRow",
					label: "",
					text: "The failures, screen by screen:\n- Onboarding did not read as interactive - people did not know how to start.\n- The scanning moment was unclear; people expected to see their result immediately, and took time to find the physical scanner.\n- The collection looked \"locked\", its drawings did not read as tappable, and the map/list controls felt inverted.\n- The experience ended abruptly, with a hidden, too-small name field and low contrast throughout.",
				},
				// verbatim — [2-Fail-08]
				{
					type: "textRow",
					label: "",
					text: "In total: 17 points of friction and 14 requests - turned into a prioritised list of possible UI changes.",
				},
				// Un seul bureau après le dernier paragraphe (FailImages_03 et _04 n'existent pas) ; libellés de groupe =
				// titres des tableaux et intertitres de l'analyse dans la présentation, dans l'ordre du paragraphe
				// « The failures, screen by screen » (docs/desk-legends.md).
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "fail-01.png", alt: "User test data: analysis matrix of themes by participant, with friction and request matrices.", group: "User Test Data" }, // Fail/…FailImages_01.png
						{ image: "fail-02.png", alt: "Possible UI changes: a list of changes grouped by screen, with priorities.", group: "Possible UI Changes" }, // Fail/…FailImages_02.png
						{ image: "fail-05.jpg", alt: "Another board of possible UI changes, grouped by screen.", group: "Possible UI Changes" }, // Fail/…FailImages_05.jpg
						{ image: "fail-07.jpg", alt: "V1 entry screen: a lock icon and “Draw a fruit or vegetable”.", group: "Onboarding" }, // Fail/…FailImages_07.jpg
						{ image: "fail-08.jpg", alt: "V1 scan result: “Scan complete! Banana”, with “Yes, that’s a banana” and “No, that’s not a banana”.", group: "Scanning steps" }, // Fail/…FailImages_08.jpg
						{ image: "fail-06.jpg", alt: "V1 collection screen: drawings listed in a grid, with map and list controls.", group: "Collection (map/list)" }, // Fail/…FailImages_06.jpg
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
				// verbatim — Fix/…FixText.txt, 1re phrase de [3-Fix-01~05]
				{
					type: "headline",
					text: "Then we fixed it.",
				},
				// Comparaisons avant / après découpées pour le bloc « gallery » (vue viewer). Les légendes écrites
				// sous chaque image d'origine (« Onboarding - a lock screen… ») ne sont pas reprises (originaux gardés).
				{
					type: "gallery",
					variant: "viewer",
					columns: 1,
					fit: "contain",
					items: [
						// fix-01.png (Fix/…FixImages_01.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-01-before.png",
							alt: "Onboarding: a lock screen with “Draw a fruit or vegetable”.",
							after: { image: "fix-alpha/fix-01-after.png", alt: "Onboarding: “Be part of the collection.” with drawings floating in and “Touch to begin”." },
						},
						// fix-02.png (Fix/…FixImages_02.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-02-before.png",
							alt: "Drawing: the first instruction screen, “Pick a card and draw.”",
							after: { image: "fix-alpha/fix-02-after.png", alt: "Drawing: one step-by-step screen, “Pick a paper card and draw.”" },
						},
						// fix-03.png (Fix/…FixImages_03.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-03-before.png",
							alt: "Scanning: “Scanning your drawing…” in low contrast.",
							after: { image: "fix-alpha/fix-03-after.png", alt: "Scanning: a high-contrast scan with live detection feedback." },
						},
						// fix-04.png (Fix/…FixImages_04.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-04-before.png",
							alt: "Scan result: “Scan complete! Banana” with two confirmation buttons.",
							after: { image: "fix-alpha/fix-04-after.png", alt: "Scan result: “Scan complete! Banana” with a plain-language confirmation." },
						},
						// fix-05.png (Fix/…FixImages_05.png), découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-05-before.png",
							alt: "Ending: the collection list with a hidden name field.",
							after: { image: "fix-alpha/fix-05-after.png", alt: "Ending: “Sign your drawing.” with drawings floating around." },
						},
					],
				},
				// verbatim — suite de [3-Fix-01~05]
				{
					type: "textRow",
					label: "",
					text: "Five before / after comparisons show the redesign: a clear \"Touch to begin\" onboarding with drawings inviting interaction, a merged drawing flow, immediate feedback right after the scan, a plain-language \"Yes / No\" scan result, and a new \"Sign your drawing\" ending that gives the experience a proper close.",
				},
				// verbatim — [3-Fix-06]
				{
					type: "textRow",
					label: "",
					text: "Altogether, 28 prioritised changes - 13 Must, 10 Should, 5 Could - each one traced back to a specific friction or request from the test.",
				},
				// verbatim — [3-Fix-07]
				{
					type: "textRow",
					label: "",
					text: "Key learnings: the concept works, and drawing + scanning feels meaningful. The interface needed higher contrast and clearer hierarchy, the scanning moment needed stronger guidance, and the whole flow needed to be simpler and shorter.",
				},
				// [3-Fix-Demo] annonce une vidéo de démo « to be added » : pas de vidéo fournie (texte dans `extra`).
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
				// verbatim — User Test_Documentation_WrittenFile_YZ_SF.pdf, « 11. Conclusion », 1re phrase
				{
					type: "headline",
					text: "The user test confirmed that the core concept of Scan Everything is strong: drawing, scanning and seeing a contribution appear in a shared collection was understood and appreciated.",
				},
				{
					type: "figure",
					image: "main-01.jpg", // Showcase_image/…Intro1.jpg
					alt: "Entry screen: “Be part of the collection.” with drawings floating around and “Touch to begin”.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{ image: "main-02.jpg", alt: "The touchscreen table showing drawings, with the scanner box underneath." }, // Showcase_image/…Intro2.jpg (même fichier que TestImages_04)
						{ image: "main-03.png", alt: "Core user journey: Understand, Draw, Scan, Wait, Explore." }, // Intro/…Intro3.png
					],
				},
				// verbatim — suite de « 11. Conclusion »
				{
					type: "textRow",
					label: "",
					text: "The most important improvements were not about changing the concept, but about making the experience clearer, shorter and more readable. The final iteration therefore focuses on a stronger first action, better scanner guidance, fewer unnecessary screens, clearer map interaction, more visible personal contribution, and a final ending moment.",
				},
				// verbatim — « Final statement » (libellé = leur intertitre)
				{
					type: "textRow",
					label: "Final statement",
					text: "Scan Everything transforms a simple drawing into a shared museum contribution. The final documentation and interface iteration show how the project moved from an initial concept to an evidence-based UX improvement through prototyping, testing, analysis and iteration.",
				},
				// Documents et liens du groupe (Martial) : noms de leurs fichiers / liens. Les PDF lourds
				// sont des copies allégées (Ghostscript, images à 150 dpi) ; href '' = ligne masquée.
				{
					type: "credits",
					documents: [
						{ label: "User Test_Documentation_WrittenFile_YZ_SF.pdf", href: "/projects/draw-scan-explore/User_Test_Documentation_WrittenFile_YZ_SF.pdf" },
						{ label: "User Test_Documentation_Boards and Steps_YZ_SF.pdf", href: "/projects/draw-scan-explore/User_Test_Documentation_Boards_and_Steps_YZ_SF.pdf" },
						{ label: "YZ_SF_Presentation.pdf", href: "/projects/draw-scan-explore/YZ_SF_Presentation.pdf" },
					],
					links: [
						{ label: "Project Figma Link_YZ_SF", href: "https://www.figma.com/board/PEKlLPYZWtYUwkh7M06Bus/SF-YZ-260303ScanEverything?node-id=363-34&t=hVoRIbjNRb73IVqR-1" },
					],
				},
			],
			next: {
				label: "Back to the start",
				number: "",
				title: "Draw - Scan - Explore",
				to: "",
				arrow: "up",
			},
		},
	],

	/**
	 * Infos supplémentaires du groupe, pas affichées par le gabarit actuel. Textes verbatim.
	 */
	extra: {
		sourceFolder: "Youri_Sina",
		// Nom du projet dans tous leurs documents
		projectName: "Scan Everything",
		links: {
			// Project Figma Link_YZ_SF.pdf
			figmaBoard: "https://www.figma.com/board/PEKlLPYZWtYUwkh7M06Bus/SF-YZ-260303ScanEverything?node-id=363-34&t=hVoRIbjNRb73IVqR-1",
		},
		// Intro/…IntroText.txt, dernière ligne de [Context]
		introImageCaptions: "(Intro1 - the entry screen \"Be part of the collection\" · Intro2 - the installation in the studio · Intro3 - the core user journey)",
		// Fix/…FixText.txt, [3-Fix-Demo]
		demoVideo: "A demo video of the latest prototype in action goes here - to be added (see PUT_DEMO_VIDEO_HERE.txt).",
		// Non publiés (trop lourds pour le site) : « User Test_Documentation_WrittenFile_YZ_SF.pdf » (53 Mo),
		// « User Test_Documentation_Boards and Steps_YZ_SF.pdf » (95 Mo), « YZ_SF_Presentation.pdf » (34 Mo).
		// Médias non utilisés : Prototypes/Prototype-V1 et V2 (HTML/CSS/JS + images), Prototypes/Readme.docx.
	},
};

export default drawScanExplore;
