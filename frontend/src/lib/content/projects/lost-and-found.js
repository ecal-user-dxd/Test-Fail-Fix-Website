/**
 * Lost & Found — contenu du projet (Scan Everything 2026, brief « Test, Fail, Fix », ECAL MaDXD).
 * Groupe : Amna Ahmad & Cindy Murier (dossier étudiant « Cindy_Amna »).
 *
 * Même schéma que rectify.js. RÈGLE ABSOLUE : les textes étudiants sont copiés tels quels.
 * Ne jamais les corriger, reformuler, raccourcir ni traduire.
 *
 * Sources (dossier ~/Documents/ECAL/AS_9/TEST-FAIL_FIX/Test-Fail-Fix/Cindy_Amna/) : leurs textes sont
 * des .docx sans étiquettes texte / images (contrairement aux autres groupes) :
 * - Intro/Project Concept.docx ; Test/TestDocumentation/Scenario.docx ;
 * - Fail/documents/Fail.docx et Findings.docx ; Fix/Fix.docx ;
 * - UXR_Document_Lost&Found.pdf, « Conclusion: » (p. 57) pour la conclusion.
 * Les textes de ce fichier ont été extraits par script des fichiers sources, pas retapés. Seule la mise
 * en page change : retours à la ligne au milieu d'une phrase remplacés par des espaces, deux-points
 * des intertitres retirés quand ils servent de libellé.
 * Pas de texte de chapitre Test : ce chapitre montre leur prototype, le scénario et les tâches du test.
 * Images : placées par chapitre selon leur dossier, l'ordre dans un chapitre est éditorial.
 *
 * Les champs `alt` et les libellés d'interface (« Next chapter »…) ne viennent PAS des étudiants.
 * Les images sont référencées par leur chemin relatif à `src/lib/assets/projects/lost-and-found/`.
 */

/** @type {import('../types.js').Project} */
const lostAndFound = {
	slug: "lost-and-found",
	title: "Lost & Found",
	edition: "Scan Everything 2026",
	// Ordre de leur documentation et présentation (« Amna Ahmad + Cindy Murier »)
	authors: ["Amna Ahmad", "Cindy Murier"],
	year: "2026",
	documentation: {
		label: "UXR_Document_Lost&Found.pdf",
		// fichier renommé sans « & » pour l'URL ; contenu identique (15 Mo)
		href: "/projects/lost-and-found/UXR_Document_Lost-and-Found.pdf",
	},

	/** Page d'accueil du projet — route /lost-and-found (layout « cover ») */
	home: {
		layout: "cover",
		theme: "orange",
		// Pas de dessin isométrique fourni par le groupe.
		blocks: [
				// verbatim — Intro/Project Concept.docx, « Introduction: »
				{
					type: "textRow",
					label: "Introduction",
					text: "Lost & Found is a speculative system designed to help ECAL students reconnect with lost belongings through object scanning, object recognition, and connected locker storage, giving lost items a better chance of finding their way back home.",
				},
				// verbatim — Intro/Project Concept.docx, « Concept: »
				{
					type: "textRow",
					label: "Concept",
					text: "This project proposes a scanning system for ECAL students that enables the registration, storage, and retrieval of lost objects through a guided, low-friction interface. When an item is found, users scan it, respond to a set of structured prompts, and generate a unique tag. The system then assigns a locker based on the object’s characteristics and sensitivity, where the item is securely stored. Students who have lost an item can interact with the system through guided matching questions to help identify and claim their belongings without relying on open text input or manual searching. To support sustainability and reduce long-term accumulation, unclaimed items are redirected to recycling or donation after six months. Users may also optionally provide contact information to enable direct acknowledgment between finder and owner.",
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
				// Pas de texte d'introduction au test dans leur dossier : pas de titre.
				// Le prototype testé (images du dossier Intro).
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "intro/tangible-prototype.jpg", alt: "The tangible prototype: a bank of 16 cardboard boxes used as lockers, one of them open.", group: "Prototype" }, // Intro/TangiblePrototype.JPG
						{ image: "intro/lost-and-found.jpg", alt: "Setting up the iPad mounted vertically inside one of the cardboard lockers.", group: "Prototype" }, // Intro/Lost&Found.JPG
						{ image: "intro/interactive.jpg", alt: "A student taps the interface on the iPad inside the locker.", group: "Prototype" }, // Intro/Interactive.jpeg
						{ image: "intro/user-flow.jpg", alt: "User flow diagram of the Lost & Found system.", group: "User flow" }, // Intro/User flow.jpg
					],
				},
				{
					type: "gallery",
					columns: 1,
					fit: "contain",
					items: [
						{ image: "intro/interface-element-1.png", alt: "Interface elements, first version: the Lost + Found home sheet and coloured folder tabs." }, // Intro/Interface/InterfaceElement1.png
						{ image: "intro/interface-element-2.png", alt: "Interface elements, first version: register card, scanning, object description and record tag." }, // Intro/Interface/InterfaceElement2.png
						{ image: "intro/interface-element-3.png", alt: "Interface elements, first version: object card, contact slip and found date." }, // Intro/Interface/InterfaceElement3.png
					],
				},
				// Écrans de la première version, dans l'ordre du parcours (« Main flow » de leur présentation).
				// Pas de bloc « screens » : ses cellules 538×958 rogneraient leurs écrans 3:4 (onglets à droite).
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "intro/screen-home.png", alt: "First version, home screen: “Lost + Found” registry sheet." }, // Intro/Interface/home.png
						{ image: "intro/screen-found-something.png", alt: "First version, register card: the four steps scan, describe, leave your details, print and drop off." }, // Intro/Interface/foundSomething.png
						{ image: "intro/screen-scan.png", alt: "First version, scanning in progress, then “Complete”." }, // Intro/Interface/scan.png
						{ image: "intro/screen-describe.png", alt: "First version, object card: details of the scanned camera and questions about it." }, // Intro/Interface/describe.png
						{ image: "intro/screen-tap-card.png", alt: "First version, contact slip: “Tap your student card here to autofill your details.”" }, // Intro/Interface/tap card.png
						{ image: "intro/screen-print.png", alt: "First version, the printed lost and found record tag." }, // Intro/Interface/print.png
						{ image: "intro/screen-closing.png", alt: "First version, closing screen: “Filed. Someone will be very glad you stopped.”" }, // Intro/Interface/closing.png
					],
				},
				// verbatim — Test/TestDocumentation/Scenario.docx, 1er paragraphe (libellé = leur intertitre dans UXR_Document, p. 29)
				{
					type: "textRow",
					label: "Testing scenario",
					text: "On 17th of April, you found a lost camera on the Ground floor in IKEA auditorium. It is in a good condition and instead of sending an email to the entire school, you decide to use the Lost and Found scanning machine located in the ECAL building.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test/testing-setup.jpg", alt: "Testing setup: the cardboard locker bank behind a table with the test documents and the camera to register.", group: "Setup" }, // Test/TestingSetup.JPG
						{ image: "test/testing-setup-2.jpg", alt: "Testing setup, a second view of the locker bank and the table.", group: "Setup" }, // Test/TestingSetup2.JPG
						{ image: "test/testing-documents.jpg", alt: "Test documents on the table, with a pen, the camera and a student card.", group: "Setup" }, // Test/TestingDocuments.JPG
						{ image: "test/test-procedure.jpg", alt: "Diagram of the test procedure: pre-test, test and post-test steps.", group: "Procedure" }, // Test/TestDocumentation/TestProcedure.jpg
						{ image: "test/explaining-scenario.jpg", alt: "The facilitator explains the scenario to a participant.", group: "Procedure" }, // Test/Explaining Scenario.JPG
						{ image: "test/reading-test-procedures.jpg", alt: "A participant fills in the Likert scale questionnaire.", group: "Procedure" }, // Test/ReadingTestProcedures.JPG
					],
				},
				// verbatim — Scenario.docx, « Tasks: » et leur liste (une tâche par ligne)
				{
					type: "textRow",
					label: "Tasks",
					text: "You are requested to complete following tasks:\nApproach the scanning machine and understand what it is for?\nPlace the object in the scanning area\nFollow the on-screen instructions\nAnswer the system questions about the object\nPrint the object tag\nAttach the tag to the object\nPlace the object in the assigned locker\nFinish the submission process",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "test/test-in-progress-1.jpg", alt: "Test in progress: a participant writes at the table while the facilitator watches.", group: "At the table" }, // Test/TestinProgress1.JPG
						{ image: "test/test-in-progress-2.jpg", alt: "Test in progress: a participant at the table, the facilitator standing next to her.", group: "At the table" }, // Test/TestinProgress2.JPG
						{ image: "test/performing-tasks.jpg", alt: "A participant attaches the tag to the object in front of the screen.", group: "At the locker" }, // Test/PerformingTasks.jpeg
						{ image: "test/test-in-progress-3.jpg", alt: "A participant follows the on-screen instructions, scenario in hand.", group: "At the locker" }, // Test/TestinProgress3.jpeg
						{ image: "test/test-in-progress-4.jpg", alt: "A participant reads the scenario in front of the locker and the screen.", group: "At the locker" }, // Test/TestinProgress4.jpeg
						{ image: "test/user-interacting.jpg", alt: "A participant taps the screen inside the locker.", group: "At the locker" }, // Test/UserInteracting.jpeg
						{ image: "test/user-interacting-2.jpg", alt: "A participant stands in front of the locker bank and the screen.", group: "At the locker" }, // Test/UserInteracting2.JPG
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
				// verbatim — Fail/documents/Fail.docx, intertitre
				{
					type: "headline",
					text: "What failed for us:",
				},
				// verbatim — Fail.docx (libellé = point en gras)
				{
					type: "textRow",
					label: "Text readability issue",
					text: "We had some feedback from two users about the vertical text on interface not being readable so accessibility of digital prototype could be improved",
				},
				// verbatim — Fail.docx (libellé = point en gras)
				{
					type: "textRow",
					label: "Physical Accessibility of tangible prototype",
					text: "The current tangible prototype is not user friendly for people with accessibility needs or different heights. Locker ergonomics are also not efficient.",
				},
				// verbatim — Fail.docx (libellé = point en gras)
				{
					type: "textRow",
					label: "Minor digital interface improvements",
					text: "Some users complained about buttons are very small and they are not looking interactive. Also reducing unnecessary information on some screens while providing clearer guidance on other.",
				},
				// verbatim — Fail.docx (libellé = point en gras)
				{
					type: "textRow",
					label: "Removing the locker label on the interface",
					text: "One of our interface screens mentioned the locker number but our tangible prototype has no labels.",
				},
				// verbatim — Fail.docx (libellé = point en gras)
				{
					type: "textRow",
					label: "Users were unable to understand tapping student card feature",
					text: "Almost all of our users could not understand the tapping student card feature. Providing clearer instructions and stronger visual cues would help.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "fail/student-tapping.jpg", alt: "A participant tries to tap the student card at the screen while the facilitator watches.", group: "Participants" }, // Fail/StudentTapping.JPG
						{ image: "fail/user-thinking.jpg", alt: "A participant hesitates in front of the screen, hand on his chin.", group: "Participants" }, // Fail/User Thinking.JPG
						{ image: "fail/accessibility-issue.jpg", alt: "A participant leans in to read the screen mounted in the locker bank.", group: "Participants" }, // Fail/accesibilityIssue.JPG
						{ image: "fail/tangible-prototype.jpg", alt: "The locker bank of 16 cardboard boxes, with the round handle of the scanner box.", group: "Prototype" }, // Fail/TangiblePrototype.JPG
						{ image: "fail/tangible-prototype-2.jpg", alt: "A participant opens one of the cardboard lockers.", group: "Prototype" }, // Fail/TangibleProtoype.JPG
					],
				},
				// verbatim — Fail/documents/Findings.docx, 1er paragraphe (libellé = sa 1re ligne)
				{
					type: "textRow",
					label: "Insights gathering from user testing",
					text: "The following insights were derived from observations, participant feedback, and recurring behavioural patterns identified during the usability testing sessions.",
				},
				// verbatim — Findings.docx, « Insight 1: »
				{
					type: "numberedRow",
					number: "01",
					title: "About concept",
					text: "Everyone liked and trusted the concept, but suggested some minor but significant improvements to make it even better.",
				},
				// verbatim — Findings.docx, « Insight 2: »
				{
					type: "numberedRow",
					number: "02",
					title: "About cognitive load",
					text: "It is worth noting that three participants reported a moderate level of cognitive load. Only one participant gave a highly positive rating, while the remaining participants expressed satisfaction with the system’s affordances.",
				},
				// verbatim — Findings.docx, « Insight 3: »
				{
					type: "numberedRow",
					number: "03",
					title: "Accessibility of digital prototype",
					text: "The vertical text on the interface requires a more refined design solution. Additionally, conducting accessibility evaluations on color contrast and typography would further improve the overall usability and readability of the interface.",
				},
				// verbatim — Findings.docx, « Insight 4: »
				{
					type: "numberedRow",
					number: "04",
					title: "Accessibility of tangible prototype",
					text: "Currently, the prototype is not fully accessible for wheelchair users. In addition, the ergonomic design of the locker system requires further evaluation to ensure that interactions are intuitive, comfortable, and accessible for a wider range of users.",
				},
				// verbatim — Findings.docx, « Insight 5: »
				{
					type: "numberedRow",
					number: "05",
					title: "Minor Interface improvements.",
					text: "Reducing unnecessary information on some screens while providing clearer guidance on other.\nAdditionally, increasing button sizes and improving their visual prominence to make them more recognizable",
				},
				// verbatim — Findings.docx, « Insight 6: »
				{
					type: "numberedRow",
					number: "06",
					title: "Tapping student card",
					text: "Many participants struggled to understand the concept of tapping the student card, as the purpose and required steps were not immediately clear. Providing clearer instructions and stronger visual cues would help.",
				},
				// verbatim — Findings.docx, « Insight 7: »
				{
					type: "numberedRow",
					number: "07",
					title: "Reducing the number of steps",
					text: "Almost everyone suggested to reduce the number of steps or providing the option to skip some steps.",
				},
				{
					type: "gallery",
					columns: 1,
					fit: "contain",
					items: [
						{ image: "fail/affinity-diagram.jpg", alt: "Affinity diagram: observations on sticky notes grouped by theme." }, // Fail/documents/AffinityDiagram.jpg
						{ image: "fail/testing-outcomes.jpg", alt: "Testing outcomes: sticky notes by participant and by theme." }, // Fail/documents/TestingOutcomes.jpg
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
				// verbatim — Fix/Fix.docx, intertitre
				{
					type: "headline",
					text: "What we improved:",
				},
				// verbatim — Fix.docx, paragraphe (réparti sur 3 paragraphes Word) et leur liste à puces
				{
					type: "textRow",
					label: "",
					text: "Based on user insights that we gathered through user testing, we focused mainly on improving digital interface and made some minor yet significant changes regarding the general accessibility of our digital interface. We focused on:\n• Improving test readability\n• Making buttons more interactive\n• Improving the tapping card feature by adding more visual cues\n• Reduced the amount of text on the interface to improve cognitive load\n• Increased the size of buttons\n• Removed unused information like locker number from the interface",
				},
				// Comparaisons avant → après découpées pour le bloc « gallery » (vue viewer) (originaux gardés dans fix/).
				// Ordre : celui de leur liste quand l'image correspond à un point, puis les autres.
				{
					type: "gallery",
					variant: "viewer",
					columns: 1,
					fit: "contain",
					items: [
						// fix/text-size-improvement.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/text-size-improvement-before.png",
							alt: "Register card, first version, with small text.",
							after: { image: "fix/text-size-improvement-after.png", alt: "Register card with larger text." },
						},
						// fix/font-size.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/font-size-before.png",
							alt: "Folder tabs with small vertical text.",
							after: { image: "fix/font-size-after.png", alt: "Folder tabs with larger vertical text." },
						},
						// fix/making-button-interactive.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/making-button-interactive-before.png",
							alt: "A flat “Start describing” button.",
							after: { image: "fix/making-button-interactive-after.png", alt: "The “Start describing” button made to look clickable." },
						},
						// fix/improving-tapping-card.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/improving-tapping-card-before.png",
							alt: "Contact slip, first version.",
							after: { image: "fix/improving-tapping-card-after.png", alt: "Contact slip with a dashed area “Tap your student card here to autofill your details.”" },
						},
						// fix/improving-all-buttons.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/improving-all-buttons-before.png",
							alt: "Small answer buttons.",
							after: { image: "fix/improving-all-buttons-after.png", alt: "Larger, more visible answer buttons." },
						},
						// fix/improving-all-buttons-2.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/improving-all-buttons-2-before.png",
							alt: "Object card with small answer buttons.",
							after: { image: "fix/improving-all-buttons-2-after.png", alt: "Object card with larger answer buttons." },
						},
						// fix/removing-locker-number.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/removing-locker-number-before.png",
							alt: "Record tag with the locker number.",
							after: { image: "fix/removing-locker-number-after.png", alt: "Record tag without the locker number." },
						},
						// fix/improving-date-picker.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/improving-date-picker-before.png",
							alt: "Found date picker: a list of numbers.",
							after: { image: "fix/improving-date-picker-after.png", alt: "Found date picker: a keypad." },
						},
						// fix/interface-1.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/interface-1-before.png",
							alt: "Home screen, first version.",
							after: { image: "fix/interface-1-after.png", alt: "Home screen, second version." },
						},
						// fix/interface-2.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/interface-2-before.png",
							alt: "Object card screen, first version.",
							after: { image: "fix/interface-2-after.png", alt: "Object card screen, second version." },
						},
						// fix/interface-3.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/interface-3-before.png",
							alt: "Found date screen, first version.",
							after: { image: "fix/interface-3-after.png", alt: "Found date screen, second version." },
						},
						// fix/interface-4.png, découpée en avant / après 16:9 (split_fix_pairs.py)
						{
							image: "fix/interface-4-before.png",
							alt: "Found date screen with the keypad, first version.",
							after: { image: "fix/interface-4-after.png", alt: "Found date screen with the keypad, second version." },
						},
					],
				},
				{
					type: "gallery",
					columns: 1,
					fit: "contain",
					items: [
						{ image: "fix/figma.png", alt: "The second version of the interface in Figma." }, // Fix/Figma.png
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
				// verbatim — UXR_Document_Lost&Found.pdf, « Conclusion: » p. 57, 1re phrase
				{
					type: "headline",
					text: "This project explored a scanning-based lost-and-found system tailored for ECAL students.",
				},
				{
					type: "figure",
					image: "showcase/showcase-1.png", // Showcase_image/lost_and_found_image_showcase_1.png
					alt: "The final prototype: a student faces the “Lost + Found” home screen inside the cardboard locker.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{ image: "showcase/showcase-2.png", alt: "A student taps the final interface." }, // Showcase_image/lost_and_found_image_showcase_2.png
						{ image: "showcase/showcase-3.png", alt: "A student places an object in the box under the screen." }, // Showcase_image/lost_and_found_image_showcase_3.png
						{ image: "showcase/showcase-4.png", alt: "A student taps an ECAL card on the contact slip screen." }, // Showcase_image/lost_and_found_image_showcase_4.png
						{ image: "showcase/showcase-5.png", alt: "A student reads the final “Filed.” screen." }, // Showcase_image/lost_and_found_image_showcase_5.png
					],
				},
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{ image: "showcase/interface-1-home.png", alt: "Final interface, home screen.", group: "Interface" }, // Showcase_image/Showcase Interface/interface_1_home.png
						{ image: "showcase/interface-2-found.png", alt: "Final interface, register card.", group: "Interface" }, // Showcase_image/Showcase Interface/interface_2_found.png
						{ image: "showcase/interface-3-details.png", alt: "Final interface, object card with larger answer buttons.", group: "Interface" }, // Showcase_image/Showcase Interface/interface_3_details.png
						{ image: "showcase/interface-4-card.png", alt: "Final interface, contact slip with the student card area.", group: "Interface" }, // Showcase_image/Showcase Interface/interface_4_card.png
						{ image: "showcase/interface-5-print.png", alt: "Final interface, the printed record tag.", group: "Interface" }, // Showcase_image/Showcase Interface/interface_5_print.png
						{ image: "showcase/interface-6-end.png", alt: "Final interface, closing screen.", group: "Interface" }, // Showcase_image/Showcase Interface/interface_6_end.png
						{ image: "showcase/showcase-6.jpg", alt: "A hand next to the iPad showing the home screen in the locker.", group: "In use" }, // Showcase_image/lost_and_found_image_showcase_6.jpg
					],
				},
				// verbatim — suite de « Conclusion: » (2 paragraphes)
				{
					type: "textRow",
					label: "",
					text: "Through iterative UX research and a round of user testing with ECAL participants, we identified key usability patterns, points of friction, and opportunities for improvement, particularly around interaction clarity, accessibility, and trust in the matching and storage process.\n\nOverall, the results indicate strong user interest in a structured, guided system for object recovery.",
				},
				{ type: "credits" },
			],
			next: {
				label: "Back to the start",
				number: "",
				title: "Lost & Found",
				to: "",
				arrow: "up",
			},
		},
	],

	/**
	 * Infos supplémentaires du groupe, pas affichées par le gabarit actuel.
	 */
	extra: {
		sourceFolder: "Cindy_Amna",
		links: {
			// fichiers .url du dossier
			brainstorming: "https://www.figma.com/board/4DomuvmiUEYkxsWWWhuMm6/Brainstorming?node-id=0-1&t=VpTME5cqegmuRsdS-1",
			uxrDocumentation: "https://www.figma.com/board/hWwkbl8dexOr0gogJ25Vby/UXR-Documentation?node-id=0-1&t=0fbmUW5Fwp12qbg2-1",
			digitalInterfaceV1: "https://www.figma.com/design/gLu1OB2sQs6rZyDocNMtAF/Lost---Found--before-?node-id=4-164&t=IGVAWlpONK9mZqp3-1",
			digitalInterfaceV2: "https://www.figma.com/design/JmeYz8wioATHdawXAzvJnA/Lost---Found--after-?node-id=4-164&t=lwt2nJyBaXah0bX7-1",
		},
		// Non publiés : « Final_Presentation_Lost+found.pdf » (96 Mo) ; vidéos (pas de bloc vidéo) :
		// Showcase_image/Showcase Interface/lost_and_found_showcase_interface_video.mp4,
		// Showcase_image/Showcase Video/lost_and_found_test_fail_fix_showcase_video.mov.
		// UXR_Document : plan de recherche, protocoles, round 2 (non repris, voir le PDF en lien).
	},
};

export default lostAndFound;
