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
				// verbatim — Test.txt, sections dans l'ordre du fichier
				{
					type: "textRow",
					label: "The idea",
					text: "Food banks throw away a lot of donated food because no one is sure it's still safe to give. FreshDrop is a public machine for community centres and food banks: you scan your food, the machine checks if it's still fresh, and tells you to either donate it or compost it.",
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
					items: [
						{ image: "test-12.png", alt: "First machine prototype: a black top-opening box with a banana and a printed tag." }, // Test/OldMachine.png
						{ image: "test-03.png", alt: "First version: landing screen “Check Food Freshness Before Donating”." }, // Test/OldUI1.png
						{ image: "test-04.png", alt: "First version: “Place your donation here.”" }, // Test/OldUI2.png
						{ image: "test-05.png", alt: "First version: “Is the food sealed?”" }, // Test/OldUI3.png
						{ image: "test-06.png", alt: "First version: “Unsealed food cannot be scanned.”" }, // Test/OldUI4.png
						{ image: "test-07.png", alt: "First version: “What type of food is it?” category screen." }, // Test/OldUI5.png
						{ image: "test-08.png", alt: "First version: scanning screen." }, // Test/OldUI6.png
						{ image: "test-09.png", alt: "First version: scanning checks in progress." }, // Test/OldUI7.png
						{ image: "test-10.png", alt: "First version: “Place in the refrigerated compartment.” with the printed tag." }, // Test/OldUI8.png
						{ image: "test-11.png", alt: "First version: “Place your donation in the fridge.”" }, // Test/OldUI9.png
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
				// verbatim — « WHAT WENT WRONG (the main issues) » : titre + texte de chaque point
				{
					type: "numberedRow",
					rule: "top",
					number: "01",
					title: "Confusing animation",
					text: "People weren't sure where to place the item or the tag. One person put the tin back in the scanning box by mistake.",
				},
				{
					type: "numberedRow",
					number: "02",
					title: "Too much text",
					text: "There was too much to read, especially at the bottom of the screen. People didn't know where to look.",
				},
				{
					type: "numberedRow",
					number: "03",
					title: "No \"why\"",
					text: "People didn't trust the result because the machine never explained why. Many checked the date themselves.",
				},
				{
					type: "numberedRow",
					number: "04",
					title: "Lost in the steps",
					text: "People couldn't tell where they were in the process, or if their last action worked.",
				},
				{
					type: "numberedRow",
					number: "05",
					title: "No context",
					text: "The machine never said who receives the food, so it felt less meaningful.",
				},
				{
					type: "numberedRow",
					number: "06",
					title: "Compost unclear",
					text: "People liked the compost idea but wanted to know where it goes.",
				},
				{
					type: "numberedRow",
					number: "07",
					title: "No way back",
					text: "No clear button to go back, finish, or stop.",
				},
				{
					type: "numberedRow",
					number: "08",
					title: "Only one item",
					text: "The machine only handles one item at a time, but people often have several.",
				},
				// verbatim — « THE KEY LESSON »
				{
					type: "textRow",
					label: "The key lesson",
					text: "The two biggest problems were both on the result screen: people couldn't tell what was happening, and didn't understand why. Those had to be fixed first.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					// Diapositives de la présentation (p. 62, 63, 66) : le dossier Fail n'a qu'une vidéo
					items: [
						{ image: "fail-01.png", alt: "Presentation slide: participants' notes, colour-coded by task." },
						{ image: "fail-02.png", alt: "Presentation slide: participants' notes, colour-coded by task (continued)." },
						{ image: "fail-03.png", alt: "Presentation slide: coding the observations into friction themes." },
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
				// verbatim — 1re phrase de Fix.txt (« HOW WE WORKED »)
				{
					type: "headline",
					text: "We looked at all the feedback, grouped the problems people shared, and started with the ones that blocked them the most.",
				},
				{
					type: "beforeAfter",
					// Diapositives avant → après de la présentation (p. 70, 73, 76, 78, 81), dans l'ordre des fixes
					pages: [
						{ image: "fix-01.png", alt: "Progress bar: the scanning screen before and after, with the new step bar." },
						{ image: "fix-02.png", alt: "Clearer scan: the scanning box animation before and after." },
						{ image: "fix-03.png", alt: "Less text: the “Is the food sealed?” screen before and after." },
						{ image: "fix-04.png", alt: "Better ending: the empty end screen replaced by “Thanks for donating”." },
						{ image: "fix-05.png", alt: "New machine shape: the top-opening box replaced by a front-opening machine." },
					],
				},
				// verbatim — suite de « HOW WE WORKED »
				{
					type: "textRow",
					label: "How we worked",
					text: "Then we matched each problem to a fix.",
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
				// verbatim — « THE RESULT »
				{
					type: "textRow",
					label: "The result",
					text: "The new machine feels like one clear, calm flow: you always know where you are, the result explains itself, and the ending shows exactly where your food goes.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "fix-06.png", alt: "New landing screen “Check Food Freshness Before Donating”, with the step bar on top." }, // Fix/FixedUI1.png
						{ image: "fix-07.png", alt: "New “Place your donation inside the scanner” screen." }, // Fix/FixedUI2.png
						{ image: "fix-08.png", alt: "New “What did you bring today?” category screen, Canned / Tinned selected." }, // Fix/FixedUI3.png
						{ image: "fix-09.png", alt: "New “Is the food sealed?” screen with an info button." }, // Fix/FixedUI4.png
						{ image: "fix-10.png", alt: "New scanning screen listing each check." }, // Fix/FixedUI6.png
						{ image: "fix-11.png", alt: "New result screen “Safe to donate” with the freshness checks and the tag preview." }, // Fix/FixedUI7.png
						{ image: "fix-12.png", alt: "New “Attach the tag to your item” screen." }, // Fix/FixedUI8.png
						{ image: "fix-13.png", alt: "New “Place item in donation box” screen." }, // Fix/FixedUI9.png
						{ image: "fix-14.png", alt: "New “Thanks for donating” end screen: from you, to Cartons du Cœur, to families." }, // Fix/FixedUI10.png
						{ image: "fix-15.png", alt: "The new front-opening machine with a tin inside the scanning box." }, // Fix/NewMachine.png
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
						{ image: "main-02.jpg", alt: "Close-up of the machine: “Attach the tag to your item” on the tablet, next to the tag printer." }, // Showcase_image/Freshdrop_2.jpg
						{ image: "main-03.jpg", alt: "The tablet showing “Attach the tag to your item” above the printer." }, // Showcase_image/2.jpg
					],
				},
				{ type: "credits" },
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
		// Médias non utilisés : vidéos (Showcase_image/Freshdrop_Video.mp4, Fail/Confusion_UserTest.mp4,
		// FreshDrop_Interface.mov), MachinePrototype.jpeg (740 px), Deliverables_SeoyunDelphine.fig.
	},
};

export default freshdrop;
