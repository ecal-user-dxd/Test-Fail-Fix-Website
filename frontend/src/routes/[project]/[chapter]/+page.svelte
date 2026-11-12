<script>
	import ChapterPage from '#lib/components/templates/ChapterPage.svelte';
	import CoverPage from '#lib/components/templates/CoverPage.svelte';

	let { data } = $props();
</script>

{#if data.chapter.layout === 'cover'}
	<CoverPage project={data.project} page={data.chapter} pictures={data.pictures} />
{:else}
	<ChapterPage project={data.project} chapter={data.chapter} pictures={data.pictures} />
{/if}
