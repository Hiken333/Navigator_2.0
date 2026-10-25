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
</script>

<Button
	variant={selected ? "secondary" : "ghost"}
	class="h-auto w-full justify-start py-2"
	aria-current={selected ? "true" : undefined}
	onclick={() => onSelect(item.id)}
>
	<span class="flex min-w-0 flex-col items-start gap-0.5">
		<span class="w-full truncate text-left">{classLabel(item)}</span>
		<span class="w-full truncate text-left text-muted-foreground">{item.id}</span>
	</span>
</Button>
