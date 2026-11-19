<script>
	/**
	 * @typedef {object} Props
	 * @property {string} title
	 * @property {string} [description]
	 */

	/** @type {Props} */
	let { title, description } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
</svelte:head>
