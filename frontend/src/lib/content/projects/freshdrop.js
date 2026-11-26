/**
 * FreshDrop — contenu du projet (Scan Everything 2026, brief « Test, Fail, Fix », ECAL MaDXD).
 * Groupe : Choi Seoyun & Bantschen Delphine (dossier étudiant « Seoyun_Delphine »).
 *
 * Même schéma que rectify.js. RÈGLE ABSOLUE : les textes étudiants sont copiés tels quels.
 * Ne jamais les corriger, reformuler, raccourcir ni traduire.
 *
 * Sources (dossier ~/Documents/ECAL/AS_9/TEST-FAIL_FIX/Test-Fail-Fix/Seoyun_Delphine/) :
 * - Text_and_images/<chapitre>/FreshDrop_0x_*.txt : textes principaux. Ces .txt sont coupés à
 *   ~80 caractères : les lignes coupées sont recollées avec une espace (mots inchangés) ;
 * - User test_documentation.pdf : chiffres et détails du test (gardés dans `extra`) ;
 * - Presentation_Slides.pdf : diapositives avant / après (Fix) et analyse (Fail).
 * Les textes de ce fichier ont été extraits par script des fichiers sources, pas retapés.
 * Les libellés gris reprennent les intertitres des .txt (« THE IDEA » → « The idea », casse seulement).
 *
 * Les champs `alt` et les libellés d'interface (« Next chapter »…) ne viennent PAS des étudiants.
 * Les images sont référencées par leur chemin relatif à `src/lib/assets/projects/freshdrop/`.
 */

/** @type {import('../types.js').Project} */
const freshdrop = {
	slug: "freshdrop",
	title: "FreshDrop",
	edition: "Scan Everything 2026",
	authors: ["Choi Seoyun", "Bantschen Delphine"], // tels qu'écrits sur la présentation (nom puis prénom)
	year: "2026",
	documentation: {
		label: "User test_documentation.pdf",
		href: "/projects/freshdrop/User_test_documentation.pdf", // copie sans espace dans le nom
	},

	/** Page d'accueil du projet — route /freshdrop (layout « cover ») */
	home: {
		layout: "cover",
		theme: "orange",
		// Pas de dessin isométrique fourni par le groupe.
		blocks: [
			{
				type: "textRow",
				label: "Introduction",
				// verbatim — Intro/FreshDrop_00_Intro.txt (sans le titre « FRESHDROP » ni le sous-titre, gardé dans extra.tagline)
				text: "Every day, good food gets thrown away. Not because it's bad, but because no one is sure it's still safe to give. At the same time, food banks turn away a big part of what they receive, for the very same reason: doubt.\n\nFreshDrop closes that gap.\n\nIt's a public machine for community centres and food banks. You bring the food you don't need, place it inside, and the machine checks if it's still fresh. In seconds, it tells you what to do: donate it, or compost it. No guessing, no waste, no awkward goodbyes to perfectly good food.\n\nThe idea is simple: give people the confidence to share. The result is food that reaches people instead of being wasted.\n\nThis is the story of how we built it, tested it with real people, watched it fail, and fixed it.\n\nTest. Fail. Fix.\nSmarter sharing, safer food.",
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
				// verbatim — Test.txt, section « WHAT WE WANTED TO FIND OUT » (une seule phrase, mise en titre de page)
				{
					type: "headline",
					text: "Can someone use the machine alone, finish a donation, and trust the result — without any help?",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test-01.png", alt: "A shopping trolley full of donated tins and packaged food." }, // Test/RESEARCH1.png
						{ image: "test-02.png", alt: "Research board on food donation safety guidelines." }, // Test/RESEARCH2.png
					],
				},
				// verbatim — Test.txt, sections dans l'ordre du fichier (« The idea » retirée le 26.11 : elle répète l'introduction)
				{
					type: "textRow",
					label: "What we built",
					text: "A first prototype with two parts:\n- A real machine: a scanning box, a donation drawer, and a compost bin.\n- A screen on a tablet that guides the donor step by step.\n\nThe flow:\nPlace your item -> Choose the food type -> Scan -> See the result -> Print a tag -> Put it in the fridge or the compost.",
				},
				{
					type: "textRow",
					label: "How we tested",
					text: "We invited 6 people to try it in person and think out loud. Each one did two tasks: donate a sealed tin, and donate an overripe banana. We watched where they hesitated, where they got confused, and whether they trusted the machine.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					// Libellés de groupe : « What we built » (la machine) et la barre d'étapes de l'interface V1, en
					// casse de phrase (docs/desk-legends.md). Pas d'écran « Result » dans la V1 ; l'accueil n'a pas d'étape.
					items: [
						{ image: "test-12.png", alt: "First machine prototype: a black top-opening box with a banana and a printed tag.", group: "A real machine" }, // Test/OldMachine.png
						{ image: "test-03.png", alt: "First version: landing screen “Check Food Freshness Before Donating”." }, // Test/OldUI1.png
						{ image: "test-04.png", alt: "First version: “Place your donation here.”", group: "Place item" }, // Test/OldUI2.png
						{ image: "test-05.png", alt: "First version: “Is the food sealed?”", group: "Sealed" }, // Test/OldUI3.png
						{ image: "test-06.png", alt: "First version: “Unsealed food cannot be scanned.”", group: "Sealed" }, // Test/OldUI4.png
						{ image: "test-07.png", alt: "First version: “What type of food is it?” category screen.", group: "Type" }, // Test/OldUI5.png
						{ image: "test-08.png", alt: "First version: scanning screen.", group: "Scan" }, // Test/OldUI6.png
						{ image: "test-09.png", alt: "First version: scanning checks in progress.", group: "Scan" }, // Test/OldUI7.png
						{ image: "test-10.png", alt: "First version: “Place in the refrigerated compartment.” with the printed tag.", group: "Print tag" }, // Test/OldUI8.png
						{ image: "test-11.png", alt: "First version: “Place your donation in the fridge.”", group: "Place in fridge" }, // Test/OldUI9.png
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
				// verbatim — 1re phrase de Fail.txt
				{
					type: "headline",
					text: "People managed to finish, but the machine often confused them — especially with the banana.",
				},
				// verbatim — suite de l'introduction de Fail.txt
				{
					type: "textRow",
					label: "",
					text: "The result screen and the moment of placing the item were the weak points.\n\nThe biggest problem: one person didn't even notice the machine said \"cannot be shared\", and thought the donation worked. The machine wasn't clear enough.",
				},
				// verbatim — « WHAT WENT WRONG (the main issues) » : titre + texte de chaque point, dans l'ordre
				// (bento sans les numéros, Martial)
				{
					type: "bento",
					items: [
						{
							title: "Confusing animation",
							text: "People weren't sure where to place the item or the tag. One person put the tin back in the scanning box by mistake.",
						},
						{
							title: "Too much text",
							text: "There was too much to read, especially at the bottom of the screen. People didn't know where to look.",
						},
						{
							title: "No \"why\"",
							text: "People didn't trust the result because the machine never explained why. Many checked the date themselves.",
						},
						{
							title: "Lost in the steps",
							text: "People couldn't tell where they were in the process, or if their last action worked.",
						},
						{
							title: "No context",
							text: "The machine never said who receives the food, so it felt less meaningful.",
						},
						{
							title: "Compost unclear",
							text: "People liked the compost idea but wanted to know where it goes.",
						},
						{
							title: "No way back",
							text: "No clear button to go back, finish, or stop.",
						},
						{
							title: "Only one item",
							text: "The machine only handles one item at a time, but people often have several.",
						},
					],
				},
				// verbatim — « THE KEY LESSON »
				{
					type: "textRow",
					label: "The key lesson",
					text: "The two biggest problems were both on the result screen: people couldn't tell what was happening, and didn't understand why. Those had to be fixed first.",
				},
				// Le seul média du dossier Fail (à la place des diapositives de la présentation, Martial).
				// [À CONFIRMER] une participante est filmée : consentement à la publication ? Piste audio : parole ?
				{
					type: "gallery",
					columns: 1,
					fit: "contain",
					items: [
						{
							video: {
								src: "/projects/freshdrop/videos/fail-confusion.mp4", // Fail/Confusion_UserTest.mp4
								poster: "/projects/freshdrop/videos/fail-confusion.webp",
								width: 576,
								height: 1024,
								label: "User test: a participant hesitates in front of the FreshDrop machine, tin in hand.",
							},
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
				// verbatim — sous-titre de Fix.txt (= extra.chapterSubtitles.fix) ; avant le 26.11 le titre était la 1re phrase de
				// « HOW WE WORKED », séparée de sa 2e phrase (« Then we… ») par le viewer
				{
					type: "headline",
					text: "What we changed.",
				},
				// Diapositives avant → après de la présentation, découpées pour le bloc « gallery » (vue viewer) (ex-carrousel).
				// Les phrases sous les diapositives (« Added a progress in every steps… ») ne sont pas reprises.
				{
					type: "gallery",
					variant: "viewer",
					columns: 1,
					fit: "contain",
					items: [
						// fix-01.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-01-before.png",
							alt: "Progress bar: the scanning screen without a step bar.",
							after: { image: "fix-alpha/fix-01-after.png", alt: "Progress bar: the scanning screen with the new step bar, framed in red." },
						},
						// fix-02.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-02-before.png",
							alt: "Clearer scan: the scanning box animation, first version.",
							after: { image: "fix-alpha/fix-02-after.png", alt: "Clearer scan: the scanning box animation, new version." },
						},
						// fix-03.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-03-before.png",
							alt: "Less text: the “Is the food sealed?” screen, first version.",
							after: { image: "fix-alpha/fix-03-after.png", alt: "Less text: the “Is the food sealed?” screen with less text." },
						},
						// fix-04.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-04-before.png",
							alt: "Better ending: the flow ended on “Place your donation in the fridge”.",
							after: { image: "fix-alpha/fix-04-after.png", alt: "Better ending: the new “Thanks for donating” screen." },
						},
						// fix-05.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix-alpha/fix-05-before.png",
							alt: "New machine shape: the first box, opening from the top.",
							after: { image: "fix-alpha/fix-05-after.png", alt: "New machine shape: a front-opening machine with the tablet on top." },
						},
					],
				},
				// verbatim — « HOW WE WORKED », le paragraphe entier (lignes du .txt rejointes par des espaces)
				{
					type: "textRow",
					label: "How we worked",
					text: "We looked at all the feedback, grouped the problems people shared, and started with the ones that blocked them the most. Then we matched each problem to a fix.",
				},
				// verbatim — « THE FIXES » : titre + texte de chaque fix
				{
					type: "numberedRow",
					rule: "top",
					number: "01",
					title: "A progress bar",
					text: "We added a step bar at the top so people always know where they are in the flow.",
				},
				{
					type: "numberedRow",
					number: "02",
					title: "A clearer scan",
					text: "We rebuilt the scanning screen to show each check simply, so the machine feels like it's really working.",
				},
				{
					type: "numberedRow",
					number: "03",
					title: "Less text",
					text: "We cut the heavy text down to one clear question and a short reason. The rest is hidden behind a small info button.",
				},
				{
					type: "numberedRow",
					number: "04",
					title: "A better ending",
					text: "We replaced the empty end screen with a \"Thanks for donating\" page that shows where the food goes — from you, to the food bank, to families nearby.",
				},
				{
					type: "numberedRow",
					number: "05",
					title: "A new machine shape",
					text: "We changed the machine from opening at the top to opening at the front, which feels more natural and removes the placement confusion.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					// Libellés de groupe : la barre d'étapes de l'interface V2, en casse de phrase, puis les titres des
					// lignes numérotées 04 et 05 (docs/desk-legends.md). L'accueil n'a pas d'étape.
					items: [
						{ image: "fix-06.png", alt: "New landing screen “Check Food Freshness Before Donating”, with the step bar on top." }, // Fix/FixedUI1.png
						{ image: "fix-07.png", alt: "New “Place your donation inside the scanner” screen.", group: "Place item" }, // Fix/FixedUI2.png
						{ image: "fix-08.png", alt: "New “What did you bring today?” category screen, Canned / Tinned selected.", group: "Type" }, // Fix/FixedUI3.png
						{ image: "fix-09.png", alt: "New “Is the food sealed?” screen with an info button.", group: "Sealed" }, // Fix/FixedUI4.png
						{ image: "fix-10.png", alt: "New scanning screen listing each check.", group: "Scan" }, // Fix/FixedUI6.png
						{ image: "fix-11.png", alt: "New result screen “Safe to donate” with the freshness checks and the tag preview.", group: "Result" }, // Fix/FixedUI7.png
						{ image: "fix-12.png", alt: "New “Attach the tag to your item” screen.", group: "Print tag" }, // Fix/FixedUI8.png
						{ image: "fix-13.png", alt: "New “Place item in donation box” screen.", group: "Donation box" }, // Fix/FixedUI9.png
						{ image: "fix-14.png", alt: "New “Thanks for donating” end screen: from you, to Cartons du Cœur, to families.", group: "A better ending" }, // Fix/FixedUI10.png
						{ image: "fix-15.png", alt: "The new front-opening machine with a tin inside the scanning box.", group: "A new machine shape" }, // Fix/NewMachine.png
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
			// Film du groupe sur Vimeo, à la place de la figure du haut (Martial). href '' = la figure reste.
			video: {
				href: "https://vimeo.com/1250265992/9af5bbe106", // Showcase_image/Freshdrop_Video.mp4 (Martial, 26.11)
				poster: "video-poster.jpg", // image du film à 0:01,5 (titre)
				label: "Demo: opening the FreshDrop machine, answering “Is the food sealed?” and placing a tin inside.",
			},
			blocks: [
				// verbatim — phrase de fin des .txt Intro et Fix (le groupe n'a pas de texte de conclusion)
				{
					type: "headline",
					text: "Smarter sharing, safer food.",
				},
				{
					type: "figure",
					image: "main-01.jpg", // Showcase_image/Freshdrop_Hero image.jpg
					alt: "The FreshDrop machine on a white plinth: a tablet above a glass scanning box and a drawer.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						// [À CONFIRMER] piste audio : parole ou musique ?
						{
							video: {
								src: "/projects/freshdrop/videos/demo.mp4", // Intro/Freshdrop_Video.mp4 (= Showcase_image/Freshdrop_Video.mp4)
								poster: "/projects/freshdrop/videos/demo.webp",
								width: 1920,
								height: 1080,
								label: "Demo: opening the FreshDrop machine, answering “Is the food sealed?” and placing a tin inside.",
							},
						},
						{ image: "main-02.jpg", alt: "Close-up of the machine: “Attach the tag to your item” on the tablet, next to the tag printer." }, // Showcase_image/Freshdrop_2.jpg
						{ image: "main-03.jpg", alt: "The tablet showing “Attach the tag to your item” above the printer." }, // Showcase_image/2.jpg
					],
				},
				// verbatim — « THE RESULT », fin du .txt Fix, juste avant la phrase du titre (déplacé du Fix : le groupe n'a pas de texte de conclusion)
				{
					type: "textRow",
					label: "The result",
					text: "The new machine feels like one clear, calm flow: you always know where you are, the result explains itself, and the ending shows exactly where your food goes.",
				},
				// Documents et liens du groupe (Martial) : noms de leurs fichiers / liens. Les PDF lourds
				// sont des copies allégées (Ghostscript, images à 150 dpi) ; href '' = ligne masquée.
				{
					type: "credits",
					documents: [
						{ label: "User test_documentation.pdf", href: "/projects/freshdrop/User_test_documentation.pdf" },
						{ label: "Presentation_Slides.pdf", href: "/projects/freshdrop/Presentation_Slides.pdf" },
					],
					links: [
						{ label: "FreshDrop_Interface", href: "https://yoon312.github.io/final/" },
						{ label: "Presentation_Slides", href: "https://www.figma.com/deck/ZEGavs8B530Mo52Fxgvx4l" },
					],
				},
			],
			next: {
				label: "Back to the start",
				number: "",
				title: "FreshDrop",
				to: "",
				arrow: "up",
			},
		},
	],

	/**
	 * Infos supplémentaires du groupe, pas affichées par le gabarit actuel. Textes verbatim.
	 */
	extra: {
		sourceFolder: "Seoyun_Delphine",
		tagline: "Smarter sharing, safer food.", // sous-titre des .txt Intro et Test, phrase de fin de Intro et Fix
		chapterSubtitles: { fail: "Where it broke.", fix: "What we changed." },
		// Test.txt, « THE IDEA » (verbatim) : retirée du Test le 26.11, elle répète l'introduction (revues understandability + continuity)
		testIdea: "Food banks throw away a lot of donated food because no one is sure it's still safe to give. FreshDrop is a public machine for community centres and food banks: you scan your food, the machine checks if it's still fresh, and tells you to either donate it or compost it.",
		failListHeading: "WHAT WENT WRONG (the main issues)",
		links: {
			interface: "https://yoon312.github.io/final/",
			presentation: "https://www.figma.com/deck/ZEGavs8B530Mo52Fxgvx4l",
		},
		// User test_documentation.pdf
		researchQuestions: [
			"RQ1. Does the user understand what the scanner does and what is expected of them at each step?",
			"RQ2. Can the user successfully complete a donation for a packaged item and a perishable item without assistance?",
			"RQ3. Does the user trust the machine's verdict, and what drives or breaks that trust?",
			"RQ4. Where does the interface introduce friction, hesitation, or error?",
		],
		headlineNumbers: [
			"Task 1 completion: 6 of 6 (100%). Task 2 completion: 5 of 6 (83%). Combined: 11 of 12 (92%).",
			"Mean ease score on Task 1: 3.67 of 5. On Task 2: 2.83 of 5. A 0.84-point drop.",
			"Total errors observed: 7 on Task 1, 9 on Task 2. That is 1.17 vs 1.50 errors per participant.",
			"One critical failure by the study's own definition (blocks completion or produces a wrong outcome the user does not realise is wrong): P04 on Task 2.",
		],
		// Médias non utilisés : vidéo FreshDrop_Interface.mov, diapositives de la présentation p. 62, 63
		// et 66 (remplacées en Fail par leur vidéo), MachinePrototype.jpeg (740 px), Deliverables_SeoyunDelphine.fig.
	},
};

export default freshdrop;
