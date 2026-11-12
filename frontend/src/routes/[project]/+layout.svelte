<script>
	let { data, children } = $props();
</script>

<!-- A project may override the accent colour (brief §4.1). -->
<div class="project" style:--color-accent={data.project.accent}>
	{@render children()}
</div>

<style>
	.project {
		display: contents;
	}
</style>
