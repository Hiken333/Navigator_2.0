<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import type { ClassType, GuidesGroup } from "$lib/api/types";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Empty from "$lib/components/ui/empty";
	import GuideGroup from "./GuideGroup.svelte";
	import { isSearchQuery, matchesQuery } from "./filter";

	let {
		guides,
		groups,
		query,
		selectedId,
		onSelect,
	}: {
		guides: ClassType[];
		groups: GuidesGroup[];
		query: string;
		selectedId: string | null;
		onSelect: (id: string) => void;
	} = $props();

	let open = $state(false);
	let searching = $derived(isSearchQuery(query));

	$effect(() => {
		if (searching) open = true;
	});

	let sections = $derived.by(() => {
		const source = searching ? guides.filter((guide) => matchesQuery(guide, query)) : guides;
		const knownIds = new Set(groups.map((group) => group.id).filter(Boolean));
		const byGroup = new Map<string, ClassType[]>();
		const ungrouped: ClassType[] = [];

		for (const guide of source) {
			const key = guide.groupId ?? "";
			if (!key || !knownIds.has(key)) {
				ungrouped.push(guide);
				continue;
			}
			const list = byGroup.get(key) ?? [];
			list.push(guide);
			byGroup.set(key, list);
		}

		const next = groups
			.filter((group) => group.id && (byGroup.get(group.id)?.length ?? 0) > 0)
			.map((group) => ({
				id: group.id,
				title: group.name,
				items: byGroup.get(group.id) ?? [],
			}));

		if (ungrouped.length > 0) {
			next.push({ id: "_none", title: "Без группы", items: ungrouped });
		}
		return next;
	});
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="group w-full justify-start">
				<ChevronRightIcon data-icon="inline-start" class="group-data-[state=open]:rotate-90" />
				<span class="min-w-0 flex-1 truncate text-left">Справочники</span>
				<Badge variant="secondary">{guides.length}</Badge>
			</Button>
		{/snippet}
	</Collapsible.Trigger>
	<Collapsible.Content>
		{#if open && searching && sections.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Title>Ничего не найдено</Empty.Title>
					<Empty.Description>Среди справочников нет такого имени или кода.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{:else if open}
			<div class="flex flex-col gap-1 py-1 pl-2">
				{#each sections as section (section.id)}
					<GuideGroup
						title={section.title}
						items={section.items}
						{selectedId}
						forceOpen={searching}
						{onSelect}
					/>
				{/each}
			</div>
		{/if}
	</Collapsible.Content>
</Collapsible.Root>
