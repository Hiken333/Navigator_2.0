<script lang="ts">
	import * as Alert from "$lib/components/ui/alert";
	import * as Card from "$lib/components/ui/card";
	import * as Empty from "$lib/components/ui/empty";
	import CatalogSidebar from "$lib/components/catalog/CatalogSidebar.svelte";
	import { classLabel } from "$lib/components/catalog/filter";
	import { guideGroups, guidesAbs, loadCatalog, typesAbs } from "$lib/stores/catalog";
	import { session } from "$lib/stores/session";

	let query = $state("");
	let selectedId = $state<string | null>(null);
	let loading = $state(true);
	let loadError = $state("");

	let selected = $derived(
		$typesAbs.find((item) => item.id === selectedId) ??
			$guidesAbs.find((item) => item.id === selectedId) ??
			null,
	);

	$effect(() => {
		const current = $session;
		if (!current) return;

		let cancelled = false;
		loading = true;
		loadError = "";

		loadCatalog(current.sessionId)
			.catch(() => {
				if (!cancelled) loadError = "Не удалось загрузить типы и справочники";
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>Каталог</title>
</svelte:head>

<div class="flex h-svh overflow-hidden">
	<CatalogSidebar
		types={$typesAbs}
		guides={$guidesAbs}
		groups={$guideGroups}
		bind:query
		{selectedId}
		{loading}
		onSelect={(id) => (selectedId = id)}
	/>
	<main class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
		{#if loadError}
			<Alert.Root variant="destructive">
				<Alert.Title>Каталог недоступен</Alert.Title>
				<Alert.Description>{loadError}</Alert.Description>
			</Alert.Root>
		{/if}
		{#if selected}
			<Card.Root class="max-w-xl">
				<Card.Header>
					<Card.Title>{classLabel(selected)}</Card.Title>
					<Card.Description>{selected.id}</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2 text-sm">
					<p>Имя: {selected.name}</p>
					<p class="text-muted-foreground">Интерфейс: {selected.classInterface}</p>
				</Card.Content>
			</Card.Root>
		{:else if !loading}
			<Empty.Root class="flex-1">
				<Empty.Header>
					<Empty.Title>Класс не выбран</Empty.Title>
					<Empty.Description>Найдите тип или откройте группу справочников.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</main>
</div>
