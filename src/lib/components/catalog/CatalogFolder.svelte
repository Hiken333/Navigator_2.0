<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import type { Snippet } from "svelte";

	let {
		title,
		count,
		open = $bindable(false),
		forceOpen = false,
		children,
	}: {
		title: string;
		count: number;
		open?: boolean;
		forceOpen?: boolean;
		children: Snippet;
	} = $props();

	let shown = $derived(forceOpen || open);
</script>

<Collapsible.Root
	open={shown}
	onOpenChange={(next) => {
		open = next;
	}}
>
	<Collapsible.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="sm"
				class="group h-7 w-full justify-start px-1.5 text-xs"
			>
				<ChevronRightIcon
					data-icon="inline-start"
					class="size-3.5 group-data-[state=open]:rotate-90"
				/>
				<span class="min-w-0 flex-1 truncate text-left">{title}</span>
				<Badge variant="secondary" class="h-4 min-w-4 px-1 text-xs leading-none">{count}</Badge>
			</Button>
		{/snippet}
	</Collapsible.Trigger>
	<Collapsible.Content>
		{#if shown}
			{@render children()}
		{/if}
	</Collapsible.Content>
</Collapsible.Root>
