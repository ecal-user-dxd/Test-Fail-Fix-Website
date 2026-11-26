<!--
	@component
	Project credits: full-bleed top rule, then Authors / Year / Documentation rows (Figma « Credits »).
	Reads the project from context. The documentation link downloads the PDF (row hidden while `href` is empty).
	A Conclusion can pass `documents` (every file of the group, in place of `project.documentation`)
	and `links` (Figma, prototypes…, in a Links row). Files in `static/` download; external URLs open
	in a new tab. Lines with an empty `href` are hidden.
-->
<script>
	/** @import { CreditLink } from '#lib/content/types.js' */
	import { getProject } from '#lib/content/context.js';
	import { staticHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {CreditLink[]} [documents]
	 * @property {CreditLink[]} [links]
	 */

	/** @type {Props} */
	let { documents, links } = $props();

	const project = getProject();
	const uid = $props.id();

	const rows = $derived([
		{ label: site.labels.authors, value: project().authors.join(', ') },
		{ label: site.labels.year, value: project().year }
	]);

	/** @param {CreditLink[]} list */
	const shown = (list) => list.filter((item) => item.href);

	const groups = $derived(
		[
			{ label: site.labels.documentation, items: shown(documents ?? [project().documentation]) },
			{ label: site.labels.links, items: shown(links ?? []) }
		].filter((group) => group.items.length)
	);

	/** @param {string} href */
	const isExternal = (href) => /^[a-z]+:\/\//i.test(href);
</script>

<section class="credits" aria-labelledby="{uid}-title">
	<h2 class="sr-only" id="{uid}-title">{site.labels.credits}</h2>
	<dl>
		{#each rows as row (row.label)}
			<div class="row layout-grid">
				<dt>{row.label}</dt>
				<dd>{row.value}</dd>
			</div>
		{/each}
		{#each groups as group (group.label)}
			<div class="row layout-grid">
				<dt>{group.label}</dt>
				<dd>
					<ul>
						{#each group.items as item (item.href)}
							<li>
								{#if isExternal(item.href)}
									<!-- prettier-ignore -->
									<a href={item.href} target="_blank" rel="noopener noreferrer">{item.label} <span aria-hidden="true">↗</span><span class="sr-only"> ({site.labels.newTab})</span></a>
								{:else}
									<!-- prettier-ignore -->
									<a href={staticHref(item.href)} download>{item.label}{#if /\.pdf$/i.test(item.href)}<span class="sr-only"> ({site.labels.pdf})</span>{/if}</a>
								{/if}
							</li>
						{/each}
					</ul>
				</dd>
			</div>
		{/each}
	</dl>
</section>

<style>
	.credits {
		padding-top: calc(20 * var(--u));
		border-top: var(--rule);
	}

	.row {
		align-items: start;
	}

	dt {
		font-size: var(--type-label);
		line-height: var(--leading-label);
		color: var(--muted);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The groups' file names have no spaces (« UserBehaviorDiscovery_Shinyoung_Emilie_22052026 »):
	   they break anywhere rather than push the page sideways on a phone. */
	a {
		overflow-wrap: anywhere;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.15em;
		transition: text-decoration-color var(--duration-hover);
	}

	a:hover {
		text-decoration-color: currentColor;
	}

	@media (max-width: 767px) {
		.row + .row {
			margin-top: var(--space-20);
		}
	}
</style>
