<script>
	import CoverPage from '#lib/components/templates/CoverPage.svelte';

	let { data } = $props();
</script>

<CoverPage project={data.project} page={data.project.home} pictures={data.pictures} isHome />
