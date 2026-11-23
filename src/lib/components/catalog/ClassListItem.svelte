<script lang="ts">
	import StarIcon from "@lucide/svelte/icons/star";
	import type { ClassType } from "$lib/api/types";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";
	import { classLabel } from "./filter";

	let {
		item,
		selected = false,
		favorite = false,
		onSelect,
		onToggleFavorite,
	}: {
		item: ClassType;
		selected?: boolean;
		favorite?: boolean;
		onSelect: (id: string) => void;
		onToggleFavorite: (id: string) => void;
	} = $props();

	let label = $derived(classLabel(item));
	let favoriteLabel = $derived(
		favorite ? `Убрать «${label}» из избранного` : `Добавить «${label}» в избранное`,
	);
</script>

<div class="flex min-w-0 items-center">
	<Button
		variant={selected ? "secondary" : "ghost"}
		size="sm"
		class="h-6 min-w-0 flex-1 justify-start gap-1.5 overflow-hidden px-1.5 text-xs font-normal"
		title="{label} ({item.id})"
		aria-current={selected ? "true" : undefined}
		onclick={() => onSelect(item.id)}
	>
		<span class="min-w-0 flex-1 truncate text-left">{label}</span>
		{#if item.id !== label}
			<span class="shrink-0 text-muted-foreground">{item.id}</span>
		{/if}
	</Button>
	<Button
		variant="ghost"
		size="icon-xs"
		class={cn("shrink-0 text-muted-foreground", favorite && "text-foreground")}
		aria-pressed={favorite}
		aria-label={favoriteLabel}
		title={favoriteLabel}
		onclick={() => onToggleFavorite(item.id)}
	>
		<StarIcon class={cn("size-3", favorite && "fill-current")} />
	</Button>
</div>
