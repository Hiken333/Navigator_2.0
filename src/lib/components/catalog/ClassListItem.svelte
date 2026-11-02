<script lang="ts">
	import type { ClassType } from "$lib/api/types";
	import { Button } from "$lib/components/ui/button";
	import { classLabel } from "./filter";

	let {
		item,
		selected = false,
		onSelect,
	}: {
		item: ClassType;
		selected?: boolean;
		onSelect: (id: string) => void;
	} = $props();

	let label = $derived(classLabel(item));
</script>

<Button
	variant={selected ? "secondary" : "ghost"}
	size="sm"
	class="h-6 w-full justify-start px-1.5 text-xs font-normal"
	title="{label} ({item.id})"
	aria-current={selected ? "true" : undefined}
	onclick={() => onSelect(item.id)}
>
	<span class="min-w-0 flex-1 truncate text-left">{label}</span>
</Button>
