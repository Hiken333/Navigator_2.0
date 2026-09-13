<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
</script>

<svelte:head>
	<title>Navigator 2.0</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-4 py-16">
	<div class="space-y-2">
		<p class="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">Navigator 2.0</p>
		<h1 class="text-4xl font-semibold tracking-tight">SvelteKit scaffold</h1>
		<p class="text-muted-foreground">
			Демо сравнения форм bits-ui vs shadcn — с большими searchable-справочниками.
		</p>
	</div>
	<a class={buttonVariants()} href="/demo/forms">Открыть сравнение форм</a>
</main>
