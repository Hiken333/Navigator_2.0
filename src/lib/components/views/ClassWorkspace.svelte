<script lang="ts">
	import * as Alert from "$lib/components/ui/alert";
	import * as Empty from "$lib/components/ui/empty";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { VIEW_ROWS_LIMIT } from "$lib/api/views";
	import { classViews, clearClassViews, openClassViews, selectClassView } from "$lib/stores/classViews";
	import { session } from "$lib/stores/session";
	import ViewGrid from "./ViewGrid.svelte";
	import ViewSwitcher from "./ViewSwitcher.svelte";
	import { gridRows, resolveGridColumns, viewLabel } from "./views";

	let {
		classId,
		title,
	}: {
		classId: string;
		title: string;
	} = $props();

	let selectedView = $derived(
		$classViews.views.find((view) => view.id === $classViews.selectedViewId) ?? null,
	);
	let columns = $derived(resolveGridColumns($classViews.columns, $classViews.rows));
	let rows = $derived(gridRows(columns, $classViews.rows));
	let rowCountLabel = $derived(
		`${rows.length.toLocaleString("ru-RU")} из ${VIEW_ROWS_LIMIT.toLocaleString("ru-RU")}`,
	);

	$effect(() => {
		const current = $session;
		const id = classId;
		if (!current) return;
		void openClassViews(current.sessionId, id);
		return () => {
			clearClassViews();
		};
	});

	function onSelectView(viewId: string) {
		const current = $session;
		if (!current) return;
		void selectClassView(current.sessionId, viewId);
	}
</script>

<section class="flex min-h-0 min-w-0 flex-1 flex-col">
	<header class="flex min-w-0 flex-col gap-3 border-b px-4 py-3">
		<div class="flex min-w-0 items-baseline justify-between gap-3">
			<h1 class="truncate text-sm font-medium">{title}</h1>
			<p class="shrink-0 text-xs text-muted-foreground">{classId}</p>
		</div>
		{#if $classViews.viewsLoading}
			<div class="flex gap-1.5">
				{#each { length: 4 } as _, index (index)}
					<Skeleton class="h-6 w-28" />
				{/each}
			</div>
		{:else if $classViews.viewsError}
			<Alert.Root variant="destructive">
				<Alert.Title>Представления недоступны</Alert.Title>
				<Alert.Description>{$classViews.viewsError}</Alert.Description>
			</Alert.Root>
		{:else if $classViews.views.length === 0}
			<Empty.Root class="gap-1 border-0 p-0">
				<Empty.Header>
					<Empty.Title class="text-sm">Нет представлений</Empty.Title>
					<Empty.Description class="text-xs">
						У класса нет доступных представлений.
					</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{:else}
			{#key classId}
				<ViewSwitcher
					views={$classViews.views}
					selectedViewId={$classViews.selectedViewId}
					onSelect={onSelectView}
				/>
			{/key}
		{/if}
	</header>

	{#if $classViews.gridError}
		<div class="p-4">
			<Alert.Root variant="destructive">
				<Alert.Title>Не удалось показать данные</Alert.Title>
				<Alert.Description>{$classViews.gridError}</Alert.Description>
			</Alert.Root>
		</div>
	{:else if selectedView || $classViews.gridLoading}
		<div class="min-h-0 flex-1 overflow-auto" aria-busy={$classViews.gridLoading}>
			<ViewGrid {columns} {rows} loading={$classViews.gridLoading} />
		</div>
		{#if !$classViews.gridLoading && columns.length > 0}
			<footer class="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
				<p class="truncate">
					{selectedView ? viewLabel(selectedView) : "Представление"}
					{#if selectedView}
						<span>({selectedView.shortName})</span>
					{/if}
				</p>
				<p class="shrink-0">{rowCountLabel} строк</p>
			</footer>
		{/if}
	{/if}
</section>
