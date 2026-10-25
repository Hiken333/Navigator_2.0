<script lang="ts">
	import type { ClassType, GuidesGroup } from "$lib/api/types";
	import { Input } from "$lib/components/ui/input";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { Separator } from "$lib/components/ui/separator";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import GuideList from "./GuideList.svelte";
	import TypeList from "./TypeList.svelte";

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
</script>

<aside class="flex h-full min-h-0 w-72 shrink-0 flex-col gap-3 border-r p-3">
	<Input bind:value={query} placeholder="Поиск по имени или коду" autocomplete="off" />
	<ScrollArea
		type="auto"
		class="h-0 min-h-0 flex-1 overflow-hidden"
		scrollbarYClasses="w-1! p-0! bg-transparent [&_[data-slot=scroll-area-thumb]]:bg-foreground/45"
	>
		{#if loading}
			<div class="flex flex-col gap-2 pr-3">
				{#each { length: 8 } as _, index (index)}
					<Skeleton class="h-8 w-full" />
				{/each}
			</div>
		{:else}
			<div class="flex flex-col gap-4 pr-3">
				<TypeList items={types} {query} {selectedId} {onSelect} />
				<Separator />
				<GuideList {guides} {groups} {query} {selectedId} {onSelect} />
			</div>
		{/if}
	</ScrollArea>
</aside>
