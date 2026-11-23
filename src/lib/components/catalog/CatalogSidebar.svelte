<script lang="ts">
	import type { ClassType, GuidesGroup } from "$lib/api/types";
	import * as Empty from "$lib/components/ui/empty";
	import { Input } from "$lib/components/ui/input";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { favoriteClasses, recentClassIds } from "$lib/stores/catalogPins";
	import CatalogFolder from "./CatalogFolder.svelte";
	import GuideGroup from "./GuideGroup.svelte";
	import { catalogSections, directoryOf, favoriteSections, isSearchQuery } from "./filter";

	const MIN_WIDTH = 176;
	const MAX_WIDTH = 560;
	const WIDTH_STEP = 16;

	let {
		types,
		guides,
		groups,
		query = $bindable(""),
		selectedId,
		loading = false,
		onSelect,
	}: {
		types: ClassType[];
		guides: ClassType[];
		groups: GuidesGroup[];
		query?: string;
		selectedId: string | null;
		loading?: boolean;
		onSelect: (id: string) => void;
	} = $props();

	let catalogOpen = $state(true);
	let recentOpen = $state(false);
	let favoritesOpen = $state(false);
	let width = $state(224);
	let dragOriginX = 0;
	let dragOriginWidth = 0;

	let searching = $derived(isSearchQuery(query));
	let catalog = $derived([...types, ...guides]);
	let sections = $derived(catalogSections(types, guides, groups, query));
	let catalogCount = $derived(types.length + guides.length);
	let favoriteIds = $derived(new Set($favoriteClasses.map((pin) => pin.classId)));
	let directories = $derived(catalogSections(types, guides, groups, ""));
	let recentPins = $derived(
		$recentClassIds.map((classId) => ({
			classId,
			directory: directoryOf(classId, directories),
		})),
	);
	let recentSections = $derived(favoriteSections(catalog, recentPins, query, "recent"));
	let pinnedSections = $derived(favoriteSections(catalog, $favoriteClasses, query));
	let recentCount = $derived(
		recentSections.reduce((sum, section) => sum + section.items.length, 0),
	);
	let favoriteCount = $derived(
		pinnedSections.reduce((sum, section) => sum + section.items.length, 0),
	);

	function selectClass(id: string) {
		recentClassIds.remember(id);
		onSelect(id);
	}

	function clampWidth(next: number) {
		return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(next)));
	}

	function onResizePointerDown(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		event.preventDefault();
		dragOriginX = event.clientX;
		dragOriginWidth = width;
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function onResizePointerMove(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
		width = clampWidth(dragOriginWidth + event.clientX - dragOriginX);
	}

	function onResizeKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			width = clampWidth(width + WIDTH_STEP);
			return;
		}
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			width = clampWidth(width - WIDTH_STEP);
		}
	}
</script>

<aside
	class="relative flex h-full min-h-0 shrink-0 flex-col gap-2 border-r p-2"
	style:width="{width}px"
>
	<Input
		bind:value={query}
		placeholder="Поиск по имени или коду"
		autocomplete="off"
		class="h-7 px-2 text-xs"
	/>
	<ScrollArea
		type="auto"
		class="h-0 min-h-0 flex-1 overflow-hidden"
		scrollbarYClasses="w-1! p-0! bg-transparent [&_[data-slot=scroll-area-thumb]]:bg-foreground/45"
	>
		{#if loading}
			<div class="flex flex-col gap-1.5 pr-2">
				{#each { length: 8 } as _, index (index)}
					<Skeleton class="h-6 w-full" />
				{/each}
			</div>
		{:else}
			<div class="pr-2">
				<CatalogFolder
					title="Каталог"
					count={catalogCount}
					bind:open={catalogOpen}
					forceOpen={searching}
				>
					{#if searching && sections.length === 0}
						<Empty.Root class="gap-1 border-0 p-2">
							<Empty.Header>
								<Empty.Title class="text-sm">Ничего не найдено</Empty.Title>
								<Empty.Description class="text-xs">
									Нет типа или справочника с таким именем или кодом.
								</Empty.Description>
							</Empty.Header>
						</Empty.Root>
					{:else}
						<div class="flex flex-col pl-1">
							{#each sections as section (section.id)}
								<GuideGroup
									title={section.title}
									items={section.items}
									{selectedId}
									{favoriteIds}
									forceOpen={searching}
									onSelect={selectClass}
									onToggleFavorite={favoriteClasses.toggle}
								/>
							{/each}
						</div>
					{/if}
				</CatalogFolder>
			</div>
			<div class="pr-2">
				<CatalogFolder
					title="Последние"
					count={recentCount}
					bind:open={recentOpen}
					forceOpen={searching && recentSections.length > 0}
				>
					{#if recentSections.length === 0}
						<p class="px-2 py-1 text-xs text-muted-foreground">
							{searching ? "В последних ничего не найдено." : "Пока пусто."}
						</p>
					{:else}
						<div class="flex flex-col pl-1">
							{#each recentSections as section (section.id)}
								<GuideGroup
									title={section.title}
									items={section.items}
									{selectedId}
									{favoriteIds}
									forceOpen={searching}
									onSelect={selectClass}
									onToggleFavorite={favoriteClasses.toggle}
								/>
							{/each}
						</div>
					{/if}
				</CatalogFolder>
				<CatalogFolder
					title="Избранные"
					count={favoriteCount}
					bind:open={favoritesOpen}
					forceOpen={searching && pinnedSections.length > 0}
				>
					{#if pinnedSections.length === 0}
						<p class="px-2 py-1 text-xs text-muted-foreground">
							{searching ? "В избранном ничего не найдено." : "Пока пусто."}
						</p>
					{:else}
						<div class="flex flex-col pl-1">
							{#each pinnedSections as section (section.id)}
								<GuideGroup
									title={section.title}
									items={section.items}
									{selectedId}
									{favoriteIds}
									forceOpen={searching}
									onSelect={selectClass}
									onToggleFavorite={favoriteClasses.toggle}
								/>
							{/each}
						</div>
					{/if}
				</CatalogFolder>
			</div>
		{/if}
	</ScrollArea>
	<button
		type="button"
		aria-label="Ширина каталога"
		class="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize border-0 bg-transparent p-0 hover:bg-border"
		onpointerdown={onResizePointerDown}
		onpointermove={onResizePointerMove}
		onkeydown={onResizeKeydown}
	></button>
</aside>
