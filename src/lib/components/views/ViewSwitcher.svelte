<script lang="ts">
	import type { models } from "as2mca-api";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Empty from "$lib/components/ui/empty";
	import { Input } from "$lib/components/ui/input";
	import { cn } from "$lib/utils";
	import { filterViews, VIEW_SEARCH_THRESHOLD, viewLabel } from "./views";

	type View = models.View;

	let {
		views,
		selectedViewId,
		onSelect,
	}: {
		views: View[];
		selectedViewId: string | null;
		onSelect: (viewId: string) => void;
	} = $props();

	let query = $state("");
	let visible = $derived(filterViews(views, query));
	let showSearch = $derived(views.length >= VIEW_SEARCH_THRESHOLD);

	function onSwitcherKeydown(event: KeyboardEvent) {
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
		if (visible.length === 0) return;
		event.preventDefault();
		const current = visible.findIndex((view) => view.id === selectedViewId);
		const offset = event.key === "ArrowRight" ? 1 : -1;
		const next = visible[(current + offset + visible.length) % visible.length];
		if (next) onSelect(next.id);
	}
</script>

<div class="flex min-w-0 flex-col gap-2 overflow-hidden">
	{#if showSearch}
		<Input
			bind:value={query}
			placeholder="Найти представление"
			autocomplete="off"
			class="h-7 max-w-xs px-2 text-xs"
		/>
	{/if}
	{#if visible.length === 0}
		<Empty.Root class="gap-1 border-0 p-2">
			<Empty.Header>
				<Empty.Title class="text-sm">Нет представлений</Empty.Title>
				<Empty.Description class="text-xs">
					По запросу ничего не нашлось. Сбросьте поиск или выберите другой класс.
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{:else}
		<div class="min-w-0 overflow-x-auto">
			<div
				role="tablist"
				aria-label="Представления класса"
				class="flex w-max min-w-full gap-1"
				tabindex="0"
				onkeydown={onSwitcherKeydown}
			>
				{#each visible as view (view.id)}
					{@const selected = view.id === selectedViewId}
					{@const label = viewLabel(view)}
					<Button
						type="button"
						role="tab"
						size="xs"
						variant={selected ? "secondary" : "ghost"}
						aria-selected={selected}
						tabindex={selected ? 0 : -1}
						title={view.shortName}
						class={cn("shrink-0 gap-1", selected && "ring-1 ring-border")}
						onclick={() => onSelect(view.id)}
					>
						{label}
						{#if view.isDefault}
							<Badge variant="outline">умолч.</Badge>
						{/if}
					</Button>
				{/each}
			</div>
		</div>
	{/if}
</div>
