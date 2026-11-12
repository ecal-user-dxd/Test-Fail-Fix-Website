<!--
	@component
	Project credits: full-bleed top rule, then Authors / Year / Documentation rows (Figma « Credits »).
	Reads the project from context. The documentation link downloads the PDF.
-->
<script>
	import { getProject } from '#lib/content/context.js';
	import { staticHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';

	const project = getProject();
	const uid = $props.id();

	const rows = $derived([
		{ label: site.labels.authors, value: project().authors.join(', ') },
		{ label: site.labels.year, value: project().year }
	]);
	const documentation = $derived(project().documentation);
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
		<div class="row layout-grid">
			<dt>{site.labels.documentation}</dt>
			<dd>
				<a href={staticHref(documentation.href)} download>
					{documentation.label}<span class="sr-only"> ({site.labels.pdf})</span>
				</a>
			</dd>
		</div>
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

	a {
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
