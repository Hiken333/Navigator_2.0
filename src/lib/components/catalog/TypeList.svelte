<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import type { ClassType } from "$lib/api/types";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Empty from "$lib/components/ui/empty";
	import ClassListItem from "./ClassListItem.svelte";
	import { RESULT_LIMIT, isSearchQuery, matchesQuery } from "./filter";

	let {
		items,
		query,
		selectedId,
		onSelect,
	}: {
		items: ClassType[];
		query: string;
		selectedId: string | null;
		onSelect: (id: string) => void;
	} = $props();

	let open = $state(false);
	let searching = $derived(isSearchQuery(query));
	let matches = $derived(searching ? items.filter((item) => matchesQuery(item, query)) : items);
	let visible = $derived(searching ? matches.slice(0, RESULT_LIMIT) : matches);

	$effect(() => {
		if (searching) open = true;
	});
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="group w-full justify-start">
				<ChevronRightIcon data-icon="inline-start" class="group-data-[state=open]:rotate-90" />
				<span class="min-w-0 flex-1 truncate text-left">Типы</span>
				<Badge variant="secondary">{items.length}</Badge>
			</Button>
		{/snippet}
	</Collapsible.Trigger>
	<Collapsible.Content>
		{#if open && searching && visible.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Title>Ничего не найдено</Empty.Title>
					<Empty.Description>Среди типов нет такого имени или кода.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{:else if open}
			<ul class="flex flex-col gap-1 py-1 pl-4">
				{#each visible as item (item.id)}
					<li>
						<ClassListItem {item} selected={item.id === selectedId} {onSelect} />
					</li>
				{/each}
			</ul>
			{#if searching && matches.length > RESULT_LIMIT}
				<p class="px-2 pb-2 text-sm text-muted-foreground">
					Показаны первые {RESULT_LIMIT}. Уточните запрос.
				</p>
			{/if}
		{/if}
	</Collapsible.Content>
</Collapsible.Root>
