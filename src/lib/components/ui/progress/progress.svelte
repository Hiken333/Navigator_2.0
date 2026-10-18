<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value = 0,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		max?: number;
		value?: number | null;
	} = $props();
</script>

<div
	bind:this={ref}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value ?? undefined}
	data-slot="progress"
	data-state={value == null ? "indeterminate" : "loading"}
	class={cn("bg-muted relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full", className)}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class={cn("bg-primary h-full flex-1 transition-all", value == null && "w-1/3 animate-pulse")}
		style={value == null
			? undefined
			: `transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}
	></div>
</div>
