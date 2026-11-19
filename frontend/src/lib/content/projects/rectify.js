/**
 * Rectify — contenu du projet (Scan Everything 2026, brief « Test, Fail, Fix », ECAL MaDXD).
 *
 * RÈGLE ABSOLUE : tous les textes marqués `verbatim` sont ceux des étudiants, copiés tels quels
 * (fautes comprises : « in applied », « ideates », « dissapearing », « Our core principles was »…).
 * Ne jamais les corriger, reformuler, raccourcir ni traduire.
 *
 * Les champs `alt` et les libellés d'interface (« Next chapter », « Back to the start »…)
 * ne viennent PAS des étudiants : ils peuvent être ajustés.
 *
 * Les images sont référencées par leur chemin relatif à `src/lib/assets/projects/rectify/`.
 * Source de vérité visuelle : Figma f9nqzj1fV8H70n2KBJCANh, page « 0_Flow » (voir docs/BRIEF.md).
 *
 * Schéma : voir les typedefs JSDoc dans `src/lib/content/types.js` (à créer, cf. brief §6).
 */

/** @type {import('../types.js').Project} */
const rectify = {
	slug: "rectify",
	title: "Rectify",
	edition: "Scan Everything 2026",
	authors: ["Thomas Neyroud", "Rishab Sachidanand"],
	year: "2026",
	documentation: {
		label: "TFF-RishabThomas-Documentation.pdf",
		href: "/projects/rectify/TFF-RishabThomas-Documentation.pdf",
	},

	/** Page d'accueil du projet — route /rectify (Figma 551:624, fond orange, layout « cover ») */
	home: {
		layout: "cover",
		theme: "orange",
		// drawing: { image: 'iso-drawing.png', placement: 'center', alt: 'Isometric line drawing of the Rectify installation: a vertical screen showing “Your selection” above a box of records.' },
		blocks: [
			{
				type: "textRow",
				label: "Introduction",
				// verbatim — NeyroudThomas_SachidanadRishab_TestFailFix_Intro.rtf
				text: "Rectify aims to support the act of discovering albums in record stores. It consists of a screen interface, two boxes and an optional audio headset. The interaction to enable the installation is one that bridges the gap between the material store and the digital experiences, by placing a selection of records into the scanning container. This triggers an analysis by the software, and shows the collection in various mappings (genre, origin and timeline). The user can then access each albums’ individual pages to have a deep insight about information, context and credits of the album. They can also listen to snippets of specific songs of the record. This allows to inform their purchase decision with intentionally minimal information, in respect of the role of the store owner and workers.",
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
			figma: "551:580",
			blocks: [
				// verbatim — 1re phrase de Test.rtf
				{
					type: "headline",
					text: "There were three clear objectives we targeted with testing our solution:",
				},
				{
					type: "screens",
					items: [
						{
							image: "fix-13-first-version.png",
							alt: "First version of the album page: Paradigmes by La Femme, with description, credits and the track wheel.",
						},
						{
							image: "screens/fix12-before.png",
							alt: "First version of the “Your selection” timeline mapping, records grouped by decade.",
						},
					],
				},
				// verbatim — Test.rtf. ATTENTION : dans Figma les titres 01/02 sont inversés par rapport aux textes ; ici ils sont appariés correctement (à confirmer).
				{
					type: "numberedRow",
					number: "01",
					title: "Evaluating",
					text: "Evaluating the relevance of our project: Understand whether our project, on the highest level appropriately fits into the context. This will explore questions such as “How does this solution change your experience in the record store?”, “Would you use this again?”, “What are some challenges you face with finding records in the store?”. These questions focused on the validating our assumptions of what people expected and required when shopping at a record store",
				},
				{
					type: "numberedRow",
					number: "02",
					title: "Understanding",
					text: "Understanding if the user experience was useful or superfluous: The record store being in the material universe and our digital experience is a mix of digital and material, it was important for the solution to effectively integrate into the store experience. The transition between the two modes of interaction needed to be seamless and the following digital interaction should have a minimal footprint. The digital interaction should be just enough to give them the context of the record to help with their purchase.",
				},
				{
					type: "numberedRow",
					number: "03",
					title: "Learning",
					text: "Learning about the information user’s need of a record: Single a record is sealed, with all its information inside the seal; it is hard for people to make a confident decision on the record they want to purchase. It was essential that we should to right information in the appropriate volume to ensure this experience adds value to the user.",
				},
				{
					type: "textRow",
					label: "", // vide dans Figma
					text: "The goal was to understand whether our solution adds a useless layer onto the current experience or augments it. We had a participant pool of 5 people, 4 female and 1 male of ages 26 to 58 and various levels of experience on record stores and digital interfaces. Through the “Wizard of Oz” method they interacted with the solution a completed specific task while being observed. They also participated in pre and post-test questionnaires as well as an interview to conclude the session.",
				},
				// Figma répète Test_01/02 (placeholder) : on met les 7 visuels du dossier Test (slides de présentation → fit: contain)
				{
					type: "gallery",
					columns: 2,
					fit: "contain",
					items: [
						{
							image: "test-01.png",
							alt: "Presentation slide: 5 participants, amateur and expert users, 25–30 min per session, 3 tasks in a given scenario.",
						},
						{
							image: "test-02.png",
							alt: "Testing plan diagram: intro, pre-test interview, core testing, post-test questionnaire and interview.",
						},
						{
							image: "test-03.png",
							alt: "Testing plan, step 1: installation introduction, consent form, structure of the test.",
						},
						{
							image: "test-04.png",
							alt: "Testing plan, pre-test: demographic information, music listening habits, prior experience with vinyls.",
						},
						{
							image: "test-05.png",
							alt: "Testing plan, core testing: learn and listen to a record, test affordances, discard records.",
						},
						{
							image: "test-06.png",
							alt: "Testing plan, post-test: purchase decisions, Likert scale, disengaging aspects.",
						},
						{
							image: "test-07.png",
							alt: "Research plan pages from the documentation.",
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
			figma: "556:40",
			blocks: [
				// verbatim — 1re phrase de Fail.rtf
				{
					type: "headline",
					text: "Through the interviews, we were able to see our solution in applied in the real world.",
				},
				{
					type: "remarks",
					// Figma : composant Fail/Remarks (583:1023). Coordonnées = centre du disque, en % de l'écran (538×958).
					image: "fix-13-first-version.png",
					alt: "First version of the album page, with four numbered points to discover.",
					points: [
						{
							number: "1",
							x: 88.1,
							y: 5.4,
							side: "left",
							text: "the mention from a user of a tag for upcoming concert(s) in the vicinity by the artist of the album page",
						},
						{
							number: "2",
							x: 82.0,
							y: 19.2,
							side: "right",
							text: "It’s cool to have all the description. They are tempted to read the description.\n\nTwo people really enjoyed all the information, whereas two other people thought it took too much place and was not appealing.",
						},
						{
							number: "3",
							x: 18.2,
							y: 40.1,
							side: "left",
							text: "Other albums by the same group/artist could be a nice addition",
						},
						{
							number: "4",
							x: 78.3,
							y: 68.2,
							side: "right",
							text: "Some confusion as to how to play the snippets. TN note: maybe a play/pause button could help make this interaction clearer",
						},
					],
				},
				{
					type: "textRow",
					label: "Results",
					// verbatim — suite de Fail.rtf
					text: "We could validate ideates and approaches that successfully worked, ones that diverged from user’s mental models and ones that we never even considered.\n\nBy the end of the session, we could see some convergent and divergent remarks, that meant that we had to user our judgement as a designer to decide which feedback to incorporate or not. Our decision depended on the prevalence of feedback and the relevance to the intention and purpose of our solution. Further, our observations of the user’s interactions, fumbles, hesitates was taken into considerations; these observations helped us understand feedback on interactions that the users did not vocalise.\n\nReflecting on the feedback, we realised that some design decisions resulted in little adaptability to different users, as some dissonant insights were gathered in the interviews. Moreover, certain elements were either missing (play/pause button) or poorly designed (timeline view). Along with other remarks and suggestions, these insights allowed to move on to a second prototype which considered the results of the testing: its successes and shortcomings.",
				},
				// verbatim — présentation (TFF-RishabThomas-Presentation.pdf)
				{
					type: "textRow",
					label: "Post-test questionnaire",
					text: "Predominantly positive\nPeople would like to see this in stores",
				},
				{
					type: "stats",
					label: "Likert scale",
					items: [
						{ value: "4/5", label: "Feel they made a right choice" },
						{ value: "4/5", label: "Use again for their purchase" },
						{
							value: "4/5",
							label: "Felt this added significantly to their experience",
						},
						{
							value: "3/5",
							label: "Felt this helped with making a purchase decision",
							note: "Helped inform and guide future testing scenarios",
						},
					],
				},
				{
					type: "textRow",
					label: "Interview responses",
					text: "Revamping the music listening experience\nBuilding a controlled recommendation system\nRe-look the mapping experience",
				},
				{
					// verbatim — notes d'interview (image Fail_05). tone : 'worked' = carré noir, 'didnt' = carré orange (valeurs reprises de Figma, la 11 « worked » confirmée par Martial)
					type: "list",
					columns: 2,
					// items avec tone → affichés par défaut en post-its classés par type (Figma Fail/Post-it 483:46). `variant: "rows"` pour revenir à la liste filetée.
					legend: { worked: "worked", didnt: "didn’t work" }, // libellés d'interface, pas des étudiants
					items: [
						{
							number: "01",
							tone: "worked",
							text: "It was like laying their selection on the table. – “Helps me see everything all together and choose what they want”",
						},
						{
							number: "02",
							tone: "didnt",
							text: "Timeline could have been, making it more digestible through a scroll. There is too much information upfront.",
						},
						{
							number: "03",
							tone: "worked",
							text: "Putting it in the box makes it a lot more personal and interactive.",
						},
						{
							number: "04",
							tone: "didnt",
							text: "Could allow people to wishlist albums on the UI so that they can discard everything altogether rather than one by one",
						},
						{
							number: "05",
							tone: "worked",
							text: "Listening to the music is most helpful. Now it’s possible to do it without asking the shopkeeper when there are a lot of people.",
						},
						{
							number: "06",
							tone: "didnt",
							text: "Other albums by the same group/artist could be a nice addition",
						},
						{
							number: "07",
							tone: "worked",
							text: "It’s cool to have all the description. They are tempted to read the description.",
						},
						{
							number: "08",
							tone: "didnt",
							text: "Some confusion as to how to play the snippets. TN note: maybe a play/pause button could help make this interaction clearer",
						},
						{
							number: "09",
							tone: "worked",
							text: "This is better than listening to it on an app.",
						},
						{
							number: "10",
							tone: "didnt",
							text: "Price of each record and total price of selection will be a valuable addition",
						},
						{
							number: "11",
							tone: "worked",
							text: "Exploring the albums was the first thing they wanted to do. Not the mapping.",
						},
						{
							number: "12",
							tone: "didnt",
							text: "Recommendations might have been interesting. Similar albums or other albums from the same artist",
						},
						{
							number: "13",
							tone: "worked",
							text: "This helps when you’re browsing through stores without knowing what you’re looking at.",
						},
						{
							number: "14",
							tone: "didnt",
							text: "They want to touch the image. The bottom section took a little time. They want to explore the records",
						},
						{
							number: "15",
							tone: "worked",
							text: "Makes them use this machine as opposed to using an application to explore music",
						},
					],
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{
							image: "fail-01.png",
							alt: "Two participants testing the installation at the researchers’ apartment.",
						},
						{
							image: "fail-10.png",
							alt: "A participant placing records in the scanning box.",
						},
						{
							image: "fail-03.png",
							alt: "Post-test questionnaire results (Likert scale).",
						},
						{
							image: "fail-04.png",
							alt: "Post-test questionnaire results, detail.",
						},
						{
							image: "fail-02.png",
							alt: "Affinity map of the interview notes.",
						},
						{
							image: "fail-05.png",
							alt: "Interview notes on yellow and green post-its.",
						},
						{
							image: "fail-06.png",
							alt: "Interview responses theme: revamping the music listening experience.",
						},
						{
							image: "fail-07.png",
							alt: "Interview responses theme: building a controlled recommendation system.",
						},
						{
							image: "fail-08.png",
							alt: "Interview responses theme: re-look the mapping experience.",
						},
						{
							image: "fail-09.png",
							alt: "List of iterations decided after the tests.",
						},
					],
				},
			],
			next: { label: "Next chapter", number: "03", title: "Fix", to: "fix" },
		},

		/* ------------------------------------------------------------------ FIX (Figma : frame « FIX-2 » 573:4778) */
		{
			slug: "fix",
			number: "03",
			title: "Fix",
			layout: "chapter",
			theme: "white",
			figma: "573:4778",
			blocks: [
				// verbatim — 1re phrase de Fix.rtf
				{
					type: "headline",
					text: "The insights inspired enhancements across the complete system, surfacing overlooked details and ideas that were never considered.",
				},
				{
					type: "beforeAfter",
					// Figma : composant Site/Before-after (579:192) — pager 01–06
					pages: [
						{
							image: "fix-13.png",
							alt: "Album page, first version and updated version: upcoming show tag, other albums in store, read more, play/pause button.",
						},
						{
							image: "fix-14.png",
							alt: "Album page with the expanded description, first version and updated version.",
						},
						{
							image: "fix-15.png",
							alt: "Other albums in store overlay, first version and updated version.",
						},
						{
							image: "fix-12.png",
							alt: "Timeline mapping, first version and the new scrollable version.",
						},
						{
							image: "fix-16.png",
							alt: "Waiting screen, first version and the new version with store recommendations.",
						},
						{
							image: "fix-17.png",
							alt: "New “Removed from selection” screen.",
						},
					],
				},
				// EXEMPLE (Martial, 19.11.2026) — fork WebGL du carrousel. Images provisoires, à remplacer
				// par une vraie paire avant / après (même cadrage, idéalement 16:9).
				{
					type: "beforeAfterReveal",
					before: {
						image: "fix-13.png",
						alt: "Album page, first version and updated version: upcoming show tag, other albums in store, read more, play/pause button.",
					},
					after: {
						image: "fix-16.png",
						alt: "Waiting screen, first version and the new version with store recommendations.",
					},
				},
				// verbatim — documentation p. 11 (Results post-test interview)
				// rule: filet bord à bord au-dessus du groupe 01–04, comme dans Figma (validé par Martial)
				{
					type: "numberedRow",
					rule: "top",
					number: "01",
					title: "Upcoming shows",
					text: "Moving on, the mention from a user of a tag for upcoming concert(s) in the vicinity by the artist of the album page was deemed relevant as it could inform a purchase decision.",
				},
				{
					type: "numberedRow",
					number: "02",
					title: "Expandable descriptions",
					text: "The description and credits features seemed to generate different responses. Two people really enjoyed all the information, whereas two other people thought it took too much place and was not appealing. Another participant said both during different parts of the testing. To deal with this issue, we have grouped the two section, and only show a short version of the description at first. The user can then expand the section with a “Read more” button, revealing the rest of the description and the credits. We think that giving the choice to the user was the best way to deal with this ambivalent feedback, safeguarding both experiences.",
				},
				{
					type: "numberedRow",
					number: "03",
					title: "Other albums in store",
					text: "Also, a button to display other albums available in the store by the same artist was added to the album pages after three users mentioned it. However, it only featured the cover art, with no labelling, as to encourage exploration, personal analysis or discussion.",
				},
				{
					type: "numberedRow",
					number: "04",
					title: "Adding play/pause button",
					text: "One of the main takeaways was the audio player. In all cases, we have gotten feedback or have noticed that it was not clear that people should just put the helmet on for the snippets to play. This resulted in the implementation of a play/pause button, with decorative elements that provided feedback and reinforced the affordance of the wheel interaction.",
				},
				// verbatim — suite de Fix.rtf
				{
					type: "textRow",
					label: "Iterating",
					text: "These updates included a play/pause button, overviews of other albums in store, expandable descriptions, a discard screen, store recommendations and material signage. This allowed us to evolve the prototype, while retaining its core DNA and progressively improving the finer details to make transition into a fuller and more valuable artefact. We think allowed us to enrich the journey exploration, listening and physical discovery of the store, as the feedback was very positive on the device and its intention.",
				},
				// verbatim — présentation, « Iterating (ideas) »
				{
					type: "list",
					columns: 1,
					items: [
						{ number: "01", text: "Adding play/pause button" },
						{ number: "02", text: "Including record cost" },
						{ number: "03", text: "Successful discard banner" },
						{ number: "04", text: "Ratings and critics" },
						{ number: "05", text: "Expandable descriptions" },
						{ number: "06", text: "Addition of a wishlist" },
						{ number: "07", text: "Store recommendations" },
						{ number: "08", text: "Clearer box roles" },
						{ number: "09", text: "Upcoming shows" },
					],
				},
				{
					type: "numberedRow",
					number: "05",
					title: "Timeline view",
					text: "The last changes to the interface was an update of the Timeline view, which is now scrollable and complies with the component design of the other mappings better",
				},
				{
					type: "numberedRow",
					number: "06",
					title: "Store recommendations",
					text: "Other features implemented after the interviews were the store recommendations, which were mentioned by two people. They have been assigned to the waiting screen so that they do not conflict with the scanning selection experience. We have come to the conclusion that this is relevant to the prototype as it encourages discovery of the store, as people might try to find the suggested records, or ask about them to the owner/worker.",
				},
				{
					type: "numberedRow",
					number: "07",
					title: "Removed from selection",
					text: "and a “Removed from selection” page upon removal of a record. This refers to the observation we’ve made that the users did not necessarily notice the slight mapping change – one record dissapearing – when discarding an album. We hope this feedback makes the whole experience more clear.",
				},
				{
					type: "numberedRow",
					number: "08",
					title: "Clearer box roles",
					text: "Lastly, a slight change was made on the material prototype, based on both feedback and observations. Two stickers were added, one on the scanning box with an icon of records in a row in the box, so that people knew where and how to put them down. The other one is in front of the scanning box and shows where to discard the records. This makes the manipulation clearer, as some people mentioned a confusion on this matter.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					items: [
						{
							image: "fix-09.png",
							alt: "A hand drops records into the scanning box, now marked “Place records here”.",
						},
						{
							image: "fix-18.png",
							alt: "The updated setup in the apartment, with store recommendations on the screen.",
						},
						{ image: "fix-10.png", alt: "Updated user flow diagram." },
						{ image: "fix-11.png", alt: "List of the implemented iterations." },
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
			figma: "559:237",
			drawing: { image: "iso-drawing.png", placement: "corner", alt: "" },
			blocks: [
				// verbatim — documentation p. 12 (Conclusion), 1re phrase
				{
					type: "headline",
					text: "The record scanning machine was situated in an challenging context of introducing a digital artefact into a space that’s popularly analog.",
				},
				{
					type: "figure",
					image: "fix-03.png",
					alt: "A visitor touches the updated screen: “Put your selection in the box to begin”, with store recommendations.",
				},
				{
					type: "gallery",
					columns: 2,
					fit: "cover",
					// Figma : le dernier emplacement « Fix_06 » affiche Fix_03 par erreur → on met fix-06
					items: [
						{
							image: "fix-01.png",
							alt: "Final prototype: album page on the vertical screen above the record box.",
						},
						{
							image: "fix-02.png",
							alt: "Final prototype: the “Removed from the selection” screen.",
						},
						{
							image: "fix-03.png",
							alt: "A visitor using the waiting screen with store recommendations.",
						},
						{
							image: "fix-04.png",
							alt: "Final prototype: “Your selection” mapping.",
						},
						{ image: "fix-05.png", alt: "Final prototype: timeline mapping." },
						{
							image: "fix-07.png",
							alt: "A hand presses the new play button on the album page.",
						},
						{
							image: "fix-08.png",
							alt: "A hand turns the snippet wheel on the album page.",
						},
						{
							image: "fix-06.png",
							alt: "A visitor exploring the final prototype.",
						},
					],
				},
				// verbatim — documentation p. 12, découpée en lignes (libellés de gauche : choix de mise en page)
				{
					type: "textRow",
					label: "Context",
					text: "Enthusiasts purchase records not just for musical fidelity, but also for the material, the analog texture and aesthetic feel that comes with it. It was important that the digital installation struck the right balance between the physical and digital.",
				},
				{
					type: "textRow",
					label: "Principles",
					text: "Our core principles was that the installation should only supplement the store experience, not replace the status quo. The user flow attempted to retain the tactility of touching, feeling, and placing records. The screen however, offered supplemental information that could not be gathered from the sleeve, allowing users to learn about the artists/band and sample 30-45 second snippets without breaking the seal. Importantly, the experience strictly constrained itself to the boundaries of the store; the data base for the machine is based on the store’s inventory. This makes the installation a tool for customer to interact and navigate through the store.",
				},
				{
					type: "textRow",
					label: "Hypothesis",
					text: "The first prototype iteration was to test the foundational hypothesis, “Does the machine help users make an informed decisions and do they leave feeling more confident about their purchase?”. User testing surrounded itself on this, and also testing our interactions that blended physical and digital manipulation. While the testing identified key insights to refine our idea, it ultimately validated our foundational direction. We were on the right course.",
				},
				{
					type: "textRow",
					label: "Outcome",
					text: "The insights inspired enhancements across the complete system, surfacing overlooked details and ideas that were never considered. This allowed us to evolve the prototype, while retaining its core DNA and progressively improving the finer details to make transition into a fuller and more valuable artefact. It allowed us to enrich the journey exploration, listening and physical discovery of the store.",
				},
				{
					type: "textRow",
					label: "Process",
					text: "The new prototype, is a representation of the iterative process, its current quality is in direct relation to the feedback received. The whole process of testing was both humbling and energizing; seeing the idea come to life and people interact was a motivating experience. The methodology of quick prototyping, early testing and intentional building is instilled into us.",
				},
				{ type: "credits" },
			],
			next: {
				label: "Back to the start",
				number: "",
				title: "Rectify",
				to: "",
				arrow: "up",
			},
		},
	],
};

export default rectify;
