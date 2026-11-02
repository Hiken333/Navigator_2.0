<script lang="ts">
	import type { ClassType } from "$lib/api/types";
	import CatalogFolder from "./CatalogFolder.svelte";
	import ClassListItem from "./ClassListItem.svelte";
	import { RESULT_LIMIT } from "./filter";

	let {
		title,
		items,
		selectedId,
		forceOpen = false,
		onSelect,
	}: {
		title: string;
		items: ClassType[];
		selectedId: string | null;
		forceOpen?: boolean;
		onSelect: (id: string) => void;
	} = $props();

	let open = $state(false);
	let visible = $derived(items.slice(0, RESULT_LIMIT));
	let shown = $derived(forceOpen || open);
</script>

<CatalogFolder {title} count={items.length} bind:open {forceOpen}>
	{#if shown}
		<ul class="flex flex-col py-0.5 pl-3">
			{#each visible as item (item.id)}
				<li>
					<ClassListItem {item} selected={item.id === selectedId} {onSelect} />
				</li>
			{/each}
		</ul>
		{#if items.length > RESULT_LIMIT}
			<p class="px-2 pb-1 text-xs text-muted-foreground">
				Показаны первые {RESULT_LIMIT}. Уточните запрос.
			</p>
		{/if}
	{/if}
</CatalogFolder>
