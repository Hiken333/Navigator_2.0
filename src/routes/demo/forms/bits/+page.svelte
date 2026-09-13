<script lang="ts">
	import { OperationFormBits } from '$lib/features/operation-form';
</script>

<svelte:head>
	<title>Bits UI form demo</title>
</svelte:head>

<div class="min-h-screen bg-[radial-gradient(circle_at_top,_oklch(0.96_0.02_250),_transparent_55%)] px-4 py-10">
	<div class="mx-auto mb-6 flex max-w-5xl items-center justify-between gap-3 text-sm">
		<a class="text-primary underline-offset-4 hover:underline" href="/demo/forms">← Сравнение</a>
		<a class="text-muted-foreground hover:text-foreground" href="/demo/forms/shadcn">shadcn →</a>
	</div>
	<OperationFormBits />
</div>
