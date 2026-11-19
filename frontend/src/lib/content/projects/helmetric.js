/**
 * Helmetric — contenu du projet (Scan Everything 2026, brief « Test, Fail, Fix », ECAL MaDXD).
 * Groupe : Marc Facchinetti & Gwen Gustin (dossier étudiant « Gwenaelle_Marc »).
 *
 * Même schéma que rectify.js. RÈGLE ABSOLUE : les textes étudiants sont copiés tels quels
 * (fautes comprises). Ne jamais les corriger, reformuler,
 * raccourcir ni traduire.
 *
 * Sources (dossier ~/Documents/ECAL/AS_9/TEST-FAIL_FIX/Test-Fail-Fix/Gwenaelle_Marc/) :
 * - Text_and_images/<chapitre>/*.md : textes principaux (prioritaires sur les PDF) ;
 * - 04-Gwen-Marc-DocumentationV2.pdf : objectifs de test, intitulés de sections ;
 * - 03-presentation-slides.pdf : diapositives avant / après (Fix), chiffres (Test, Conclusion).
 * Les textes de ce fichier ont été extraits par script des fichiers sources, pas retapés.
 *
 * Les champs `alt` et les libellés d'interface (« Next chapter »…) ne viennent PAS des étudiants.
 * Les images sont référencées par leur chemin relatif à `src/lib/assets/projects/helmetric/`.
 * `extra` garde les infos du groupe qui n'ont pas (encore) de place dans le gabarit.
 */

/** @type {import('../types.js').Project} */
const helmetric = {
	slug: "helmetric",
	title: "Helmetric",
	edition: "Scan Everything 2026",
	authors: ["Marc Facchinetti", "Gwen Gustin"], // documentation V2 et présentation
	year: "2026",
	// À FOURNIR : la documentation PDF fait 276 Mo (04-Gwen-Marc-DocumentationV2.pdf), trop lourde
	// pour le site. Ligne masquée dans les crédits tant que `href` est vide.
	documentation: { label: "", href: "" },

	/** Page d'accueil du projet — route /helmetric (layout « cover ») */
	home: {
		layout: "cover",
		theme: "orange",
		// Pas de dessin isométrique fourni par le groupe.
		blocks: [
			{
				type: "textRow",
				label: "Introduction",
				// verbatim — 0-Intro/Marc-Gwen-test-fail-fix-concept.md (sans le titre « # Helmetric »)
				text: "How can you tell if a helmet is protecting you properly? That is our fundamental question, which led us to embark on the Helmetric project. We both (Gwen and Marc) all take part in activities that require a helmet, and whilst discussing this, we realised that the safety aspect of helmets was often overlooked or simply not understood. There are many reasons why a helmet might not provide adequate protection:\n- Wrong size\n- Wrong helmet shape\n- UV exposure\n- Age-related wear\n- Damage following a crash or by dropping it\n\nThrough this research, we wanted to create a prototype scanning machine capable of detecting a helmet's condition and determining whether or not it is still safe to wear, as well as measuring the user's head to recommend a helmet perfectly suited to their head shape.",
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
				// verbatim — documentation V2 p. 24, « Test objectives » (le .md Test n'a pas de phrase d'objectif)
				{
					type: "headline",
					text: "Evaluate the usability, clarity, and overall experience of the helmet scanning machine. The test aims to understand:",
				},
				// Pas de bloc « screens » : les écrans V1 sont en paysage (iPad), ils apparaissent dans le avant / après du chapitre Fix.
				// verbatim — documentation V2 p. 24, suite des « Test objectives »
				{
					type: "list",
					columns: 1,
					items: [
						{ number: "01", text: "How intuitive the interaction with the machine is" },
						{ number: "02", text: "Whether users understand the head scanning process" },
						{ number: "03", text: "Whether users trust the results and recommendations" },
						{ number: "04", text: "How comfortable and non-intrusive the experience feels" },
						{ number: "05", text: "If the system effectively communicates helmet fit and safety" },
					],
				},
				// verbatim — 1-Test/Gwen-Marc-test.md, une ligne par section « ## » (libellés = titres du .md)
				{
					type: "textRow",
					label: "Research",
					text: "During our research, we decided it would be best to go with a Grotesk typeface that has a strong character in its details but is also highly legible; that is why we chose LL Riforma, designed by the NORM studio\nIt is an extremely precise typeface that is highly optimised for the web; it offers a very radical look and excellent readability, particularly thanks to its kerning.\nWe used industry standards, particularly Google's Material 3, as a guiding principle to create a seamless and inclusive design.",
				},
				{
					type: "textRow",
					label: "Prototype",
					text: "We've moved from figma to the web, which has allowed us to incorporate more complex interactions, such as the head scan. It has also enabled us to fine-tune the interactions further (micro UI).\n\nThis process is carried out using the MCP (Model Context Protocol), a methodology for cleanly converting a Figma document into a web page. We decided to review and improve the file structure of the coded version of the application, to ensure that the component design is defined only once. This also enabled us to work more quickly and with greater precision during the iteration for version 2.\n\nIn our initial version, we planned to include a structure to simulate a shelter, since the machine could be located outdoors. This would also allow us to mount a light on top to illuminate the face during the scan.\nIn the end, the structures were not available.",
				},
				{
					type: "textRow",
					label: "Testers",
					text: "Our panel of six users includes five men and one woman, all of whom regularly take part in activities that require a helmet; specifically, the panel comprises four motorcyclists, one cyclist and one skier. The panel members came from a variety of backgrounds, professions and age groups, ranging from 20 to 40 years old.",
				},
				// verbatim — présentation, diapositive « User testing / Process »
				{
					type: "stats",
					label: "Process",
					items: [
						{ value: "6", label: "test users" },
						{ value: "~40", label: "questions" },
						{ value: "25", label: "minutes" },
					],
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{
							image: "test-01.jpg", // 1-Test/P1288727.JPG
							alt: "The test setup: the wooden scanning machine with an iPad and a motorcycle helmet on a table, a chair for the tester and a camera on a tripod.",
						},
						{
							image: "test-02.jpg", // 1-Test/P1288735.JPG (pivotée selon l'EXIF)
							alt: "Close-up of the machine: a helmet in the lit box below the iPad showing “Welcome to Helmetric.”",
						},
						{
							image: "test-03.png", // 1-Test/User5.png (petite image : 544 px de large)
							alt: "User 5 holds the head measurement device while the facilitator opens the box of the machine.",
						},
						{
							image: "test-04.png", // 1-Test/User6.png
							alt: "User 6 places a helmet into the box of the machine.",
						},
					],
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{
							image: "test-05.png", // 1-Test/Protocol.png
							alt: "Test protocol: 6 testers, 3–5 minutes intro, 5 minutes pre-test questions, 10–12 minutes mission scenario, 8–10 minutes post-test interview, 5 minutes post-test questions; 23–26 minutes overall.",
						},
						{
							image: "test-06.png", // 1-Test/Protocole details.png
							alt: "Protocol details: the script and questions of each step of the test.",
						},
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
				// verbatim — 1re phrase de 2-Fail/Gwen-Marc-fail.md
				{
					type: "headline",
					text: "Regarding the results, we received mostly positive feedback, which was very rewarding.",
				},
				// Pas de bloc « remarks » : le groupe n'a pas de remarques placées sur un écran (à voir avec Martial).
				// verbatim — suite du 1er paragraphe (libellé = titre de cette page dans la documentation V2)
				{
					type: "textRow",
					label: "Quantitative data",
					text: "What was particularly interesting is that our initial concerns especially regarding how well people would understand these two points turned out to be non-issues: clarity of instructions and understanding of head scanning. The analysis of the post-test interview data - particularly the quantitative analysis - was very positive. We therefore had to go back and look at the words and actions that took place during the test.",
				},
				// verbatim — paragraphes 2 et 3 (libellé = titre de cette page dans la documentation V2)
				{
					type: "textRow",
					label: "Summary of the data",
					text: "Analyzing the user testing data yielded fascinating results, especially when comparing our initial assumptions with actual user behavior. Interestingly, features we expected to cause friction such as the face scanning process, which requires specific head movements to generate the mesh were actually very well received. When combined with the wearable head-measurement device, users instantly understood how the system operated. Conversely, interactions we assumed would be straightforward, such as placing the helmet into the box or handling the measurement device, caused unexpected friction for some users.\nThese difficulties were consistent across multiple participants. Despite our sample size six testers, whereas a commercial project would require a much larger group, the fact that individuals from completely different backgrounds shared identical pain points proved that our findings were legitimate and not just random coincidence. By analyzing these convergent opinions, we were able to transform negative feedback into six specific user insights to refine the overall experience.\n\nUltimately, what felt most rewarding was that many participants stated they would willingly use this machine if it were deployed in real life. This enthusiastic response provided strong validation for our project, proving that Helmetric is a valuable, meaningful solution rather than a gadget or a niche concept.",
				},
				// verbatim — les six insights (titres du .md Fix, « Summary of insights » de la présentation)
				{
					type: "list",
					columns: 1,
					items: [
						{ number: "01", text: "What should I read?" },
						{ number: "02", text: "Not just on the screen" },
						{ number: "03", text: "Not brand affiliated" },
						{ number: "04", text: "Smile, you're on camera" },
						{ number: "05", text: "Internal damage" },
						{ number: "06", text: "Hands-free" },
					],
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{
							image: "fail-01.png", // 2-Fail/Quantitative data 1.png
							alt: "Table of the scale-based answers (1–5) of the six testers, with the overall score of each question.",
						},
						{
							image: "fail-02.png", // 2-Fail/Quantitative data 2.png
							alt: "Bar chart of the mean score of each question, from 4.21 (trust in results) to 4.83 (understanding of scan, inclusivity of design).",
						},
						{
							image: "fail-03.png", // 2-Fail/Qualitatitive data 1.png
							alt: "Table of the qualitative data: questions, answers, frequency and key findings, coloured by theme.",
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
				// verbatim — 1re phrase de 3-Fix/Gwen-Marc-fix.md
				{
					type: "headline",
					text: "Following an analysis of our insights, we set about modifying our prototype.",
				},
				{
					type: "beforeAfter",
					// Diapositives avant / après de la présentation (03-presentation-slides.pdf p. 53, 54, 57, 58, 60, 62, 64, 66), exportées en 3840×2160
					pages: [
						{ image: "fix-01.png", alt: "What should I read? Head scan result, before and after." },
						{ image: "fix-02.png", alt: "What should I read? Helmet scan result, before and after." },
						{ image: "fix-03.png", alt: "Not just on the screen: collecting the helmet from the box, before and after." },
						{ image: "fix-04.png", alt: "Not just on the screen: taking the head measurement device from the drawer, before and after." },
						{ image: "fix-05.png", alt: "Not brand affiliated: the helmet selection page, before and after." },
						{ image: "fix-06.png", alt: "Smile, you're on camera: the new camera access notification, before and after." },
						{ image: "fix-07.png", alt: "Internal damage: the scanning screen, before and after." },
						{ image: "fix-08.png", alt: "Hands-free: examples of helmet holders and hooks." },
					],
				},
				// 3-Fix/2a-z-after.mp4 et 5-z-after.mp4 : écrans « après », côte à côte.
				// [À CONFIRMER] piste audio : parole ou ambiance ?
				{
					type: "video",
					columns: 2,
					items: [
						{
							src: "/projects/helmetric/videos/fix-2a-after.mp4", // 3-Fix/2a-z-after.mp4
							poster: "/projects/helmetric/videos/fix-2a-after.webp",
							width: 1308,
							height: 946,
							label: "After: the screen “Please place your helmet in the open box.”, then the “It's in the box” button appears.",
						},
						{
							src: "/projects/helmetric/videos/fix-5-after.mp4", // 3-Fix/5-z-after.mp4
							poster: "/projects/helmetric/videos/fix-5-after.webp",
							width: 1310,
							height: 944,
							label: "After: the scanning screen “Scanning in progress…”, with the helmet scan animation.",
						},
					],
				},
				// verbatim — suite du 1er paragraphe et 2e paragraphe (libellé = titre de la page « Design iteration » de la documentation V2)
				{
					type: "textRow",
					label: "Design iteration",
					text: "Before making any changes to the code, we tested different versions of the new design in Figma.\n\nWe came up with six different insights, all of which we implemented, except for one, which involved a physical modification to the machine (adding a helmet holder). The size of the small text has also been increased.",
				},
				// verbatim — « Insights details » : titre en gras, texte, citation (sans les * de mise en forme Markdown)
				{
					type: "numberedRow",
					rule: "top",
					number: "01",
					title: "What should I read?",
					text: "Users often skimmed through the information. The results pages and instructions pages have been reorganised to improve readability.\n\nUser 1 said: “The head visualization and scanning process felt very futuristic, but the results interface could better reflect the sophistication of the technology used.”",
				},
				{
					type: "numberedRow",
					number: "02",
					title: "Not just on the screen",
					text: "There was a major sticking point when it came to carrying out actions with the physical machine, such as putting your helmet in the box at the right time. The instructions page has been completely redesigned: there is less varied information, and the steps to follow are more straightforward.\n\nUser 3 said: “the instruction (...) with the exclamation mark was a little too small, so I was trying to figure out what to do next.”",
				},
				{
					type: "numberedRow",
					number: "03",
					title: "Not brand affiliated",
					text: "When most testers referred to the helmet model selection page, they called it the ‘shop page’. However, there were no prices listed. We have changed this page to make it feel less like a shopping experience.\n\nUser 1 said: “It makes me wonder: they offer to inspect your motorcycle helmet just to trick you into buying a new one.”",
				},
				{
					type: "numberedRow",
					number: "04",
					title: "Smile, you're on camera",
					text: "Two users reported that seeing themselves on camera had taken them by surprise, so we have added a notification step before the camera starts recording.\nUser 5 said: “I didn't expect to see my own face so suddenly.”$",
				},
				{
					type: "numberedRow",
					number: "05",
					title: "Internal damage",
					text: "The testers did not necessarily realise that the scan was being carried out using through-beam technology. We added visuals showing the visual result of the internal scan.\n\nUser 1 said: “It's just a visual inspection, but you don't know if the helmet is broken on the inside.”",
				},
				{
					type: "numberedRow",
					number: "06",
					title: "Hands-free",
					text: "Their body language showed us that the testers felt uncomfortable wearing their headsets during the head scan. A holder (such as a hook) should therefore be added to allow them to have their hands free, whilst taking hygiene issues into account.\n\nUser 6 said: “Can I put it here?”",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{
							image: "fix-09.png", // 3-Fix/0 design iteration - ex head scan result.png
							alt: "Figma explorations of the new head scan result page.",
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
				// verbatim — présentation, diapositive « Conclusion » (le groupe n'a pas de texte de conclusion)
				{
					type: "headline",
					text: "On two different scanning processes",
				},
				{
					type: "figure",
					image: "main-01.jpg", // Showcase_image/1-SCAN_REPRO_MARC_GWEN-2.jpg
					alt: "The Helmetric machine: a wooden cabinet with an iPad showing “Welcome to Helmetric.” above a motorcycle helmet in the box.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{
							image: "main-02.jpg", // Showcase_image/2-SCAN_REPRO_MARC_GWEN-4.jpg
							alt: "A visitor places her helmet into the box of the machine.",
						},
						{
							image: "main-03.jpg", // Showcase_image/3-SCAN_REPRO_MARC_GWEN-3.jpg
							alt: "The Helmetric machine with an empty box.",
						},
					],
				},
				// verbatim — présentation, diapositive « Conclusion »
				{
					type: "stats",
					items: [
						{ value: "6", label: "insights" },
						{ value: "9/14", label: "pages improved" },
						{ value: "1", label: "change to the physical machine" },
					],
				},
				{ type: "credits" },
			],
			next: {
				label: "Back to the start",
				number: "",
				title: "Helmetric",
				to: "",
				arrow: "up",
			},
		},
	],

	/**
	 * Infos supplémentaires du groupe, pas affichées par le gabarit actuel. Textes verbatim.
	 */
	extra: {
		sourceFolder: "Gwenaelle_Marc",
		links: {
			prototypeV1: "https://helmetric.netlify.app/index.html",
			prototypeV2: "https://helmetric2.netlify.app/index.html",
			research: "https://www.figma.com/board/7nphB21sjfMnC1qBayPBGW/01-research-scan?node-id=0-1&t=zik2Y8I0KfbAqcGO-1",
			presentation: "https://www.figma.com/deck/67k6n8DRFrwFnOPNsFAe5c",
		},
		documentationFiles: ["04-Gwen-Marc-DocumentationV1.pdf", "04-Gwen-Marc-DocumentationV2.pdf"],
		// Documentation V2 p. 24–25
		testScenario: "The participant is in a public space (such as a bike parking area, ski station, or store) and comes across the machine. They want to check if their helmet fits properly and whether it is still safe to use. Or to measure their head to find the perfect helmet.",
		testTasks: [
			"Approach the machine and understand how to start",
			"Follow the instructions on the screen",
			"Position themselves correctly",
			"Interact with the head measurement system",
			"Complete the scanning process",
			"Read and interpret the results",
			"Explore recommendations about helmet fit and safety",
		],
		testSetup: "Our setup, whit a chair so the tester can sit down and answer questions,\n\nAs our physical prototype was not automated, Marc created interaction by opening the window, turning on the lights... We explained the situation to the users and it didn’t confuse them",
		// Présentation, diapositive « User sampling »
		userSampling: [
			{ value: "4", label: "motorcyclists" },
			{ value: "1", label: "skier" },
			{ value: "1", label: "cyclist" },
		],
		// Présentation / Quantitative data 1.png — « Scale-based answers » : overall puis testeurs 1 à 6
		quantitative: [
			{ question: "Ease of use (1–5)", overall: "4.416", users: ["4-5", "5", "4", "4", "5", "4"] },
			{ question: "Clarity of instructions (1–5)", overall: "4.566", users: ["4-5", "4.9", "5", "5", "5", "3"] },
			{ question: "Understanding of head scanning (1–5)", overall: "4.83", users: ["4", "5", "5", "5", "5", "5"] },
			{ question: "Trust in results (1–5)", overall: "4.20", users: ["4.25", "4", "4", "5", "5", "3"] },
			{ question: "Comfort during interaction (1–5)", overall: "4.41", users: ["5", "4.5", "4", "4", "5", "4"] },
			{ question: "Perceived safety of the system (1–5):", overall: "4.66", users: ["5", "5", "4", "5", "5", "4"] },
			{ question: "Usefulness of feedback (1–5)", overall: "4.33", users: ["5", "5", "5", "4", "4", "3"] },
			{ question: "Inclusivity of design (1–5)", overall: "4.83", users: ["5", "5", "5", "5", "5", "4"] },
		],
		// Documentation V2 « Insights » (sous-titres) + présentation (« Affected testers »), dans l'ordre des insights 01–06
		insights: [
			{ number: "01", title: "What should I read?", improvement: "Reorganise information on result pages", affectedTesters: "4/6" },
			{ number: "02", title: "Not just on the screen", improvement: "Clearer instructions for physical machines", affectedTesters: "4/6" },
			{ number: "03", title: "Not brand affiliated", improvement: "Reduce the shopping feeling", affectedTesters: "4/6" },
			{ number: "04", title: "Smile, you're on camera", improvement: "Notify before filming", affectedTesters: "2/6" },
			{ number: "05", title: "Internal damage", improvement: "Understanding the method of scan", affectedTesters: "3/6" },
			{ number: "06", title: "Hands-free", improvement: "Location of the helmet during the head scan", affectedTesters: "5/6" },
		],
		// Médias du dossier non utilisés : captures avant / après séparées (3-Fix/*.png, 3-Fix/extra/*),
		// RAW 1-Test/*.RW2, fichiers .fig / .jam, code des prototypes (Prototypes/*.zip).
	},
};

export default helmetric;
