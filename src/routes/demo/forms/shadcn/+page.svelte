<script lang="ts">
	import { OperationFormShadcn } from '$lib/features/operation-form';
</script>

<svelte:head>
	<title>shadcn form demo</title>
</svelte:head>

<div class="min-h-screen bg-muted/40 px-4 py-10">
	<div class="mx-auto mb-6 flex max-w-5xl items-center justify-between gap-3 text-sm">
		<a class="text-primary underline-offset-4 hover:underline" href="/demo/forms">← Сравнение</a>
		<a class="text-muted-foreground hover:text-foreground" href="/demo/forms/bits">← bits-ui</a>
	</div>
	<OperationFormShadcn />
</div>
