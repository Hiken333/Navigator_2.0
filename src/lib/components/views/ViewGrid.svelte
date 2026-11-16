<script lang="ts">
	import * as Empty from "$lib/components/ui/empty";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Table from "$lib/components/ui/table";
	import { cn } from "$lib/utils";
	import {
		cellAlignClass,
		clampColumnWidth,
		GRID_COLUMN_STEP,
		type GridColumn,
		type GridRow,
	} from "./views";

	let {
		columns,
		rows,
		loading = false,
	}: {
		columns: GridColumn[];
		rows: GridRow[];
		loading?: boolean;
	} = $props();

	let widths = $state<Record<string, number>>({});
	let resizing = $state(false);
	let drag = $state<{ id: string; originX: number; originWidth: number } | null>(null);

	function columnWidth(column: GridColumn) {
		return widths[column.id] ?? column.minWidth;
	}

	let tableWidth = $derived(columns.reduce((sum, column) => sum + columnWidth(column), 0));

	function setColumnWidth(id: string, width: number) {
		widths[id] = clampColumnWidth(width);
	}

	function onResizePointerDown(
		event: PointerEvent & { currentTarget: HTMLButtonElement },
		column: GridColumn,
	) {
		event.preventDefault();
		event.stopPropagation();
		resizing = true;
		drag = { id: column.id, originX: event.clientX, originWidth: columnWidth(column) };
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function onResizePointerMove(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
		setColumnWidth(drag.id, drag.originWidth + event.clientX - drag.originX);
	}

	function onResizePointerUp(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		resizing = false;
		drag = null;
	}

	function onResizeKeydown(event: KeyboardEvent, column: GridColumn) {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			setColumnWidth(column.id, columnWidth(column) - GRID_COLUMN_STEP);
			return;
		}
		if (event.key === "ArrowRight") {
			event.preventDefault();
			setColumnWidth(column.id, columnWidth(column) + GRID_COLUMN_STEP);
		}
	}
</script>

<div class="h-full min-h-0 min-w-0">
	{#if loading}
		<div class="flex flex-col gap-1.5 p-3">
			{#each { length: 8 } as _, index (index)}
				<Skeleton class="h-7 w-full" />
			{/each}
		</div>
	{:else if columns.length === 0}
		<Empty.Root class="flex-1">
			<Empty.Header>
				<Empty.Title>Нет данных</Empty.Title>
				<Empty.Description>Представление не вернуло колонки и строки.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{:else}
		<div
			class={cn("grid-scroll h-full min-h-0 min-w-0 overflow-auto", resizing && "select-none")}
		>
			<table
				class="caption-bottom table-fixed border-separate border-spacing-0 text-xs"
				style:width="{tableWidth}px"
			>
				<colgroup>
					{#each columns as column (column.id)}
						<col style:width="{columnWidth(column)}px" />
					{/each}
				</colgroup>
				<Table.Header class="sticky top-0 z-10">
					<Table.Row class="hover:bg-transparent">
						{#each columns as column (column.id)}
							<Table.Head
								class={cn(
									"relative h-8 overflow-hidden border-b bg-muted pr-2.5 font-medium",
									cellAlignClass(column.align),
								)}
								title={column.title}
							>
								<span class="block truncate">{column.title}</span>
								<button
									type="button"
									aria-label="Ширина колонки {column.title}"
									class="absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize border-0 bg-transparent p-0 hover:bg-foreground/20"
									onpointerdown={(event) => onResizePointerDown(event, column)}
									onpointermove={onResizePointerMove}
									onpointerup={onResizePointerUp}
									onpointercancel={onResizePointerUp}
									onkeydown={(event) => onResizeKeydown(event, column)}
								></button>
							</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if rows.length === 0}
						<Table.Row class="hover:bg-transparent">
							<Table.Cell class="text-muted-foreground" colspan={columns.length}>
								Строк нет
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each rows as row (row.key)}
							<Table.Row>
								{#each columns as column (column.id)}
									{@const value = row.cells[column.name] ?? ""}
									<Table.Cell
										title={value}
										class={cn(
											"max-w-none overflow-hidden truncate tabular-nums",
											cellAlignClass(column.align),
											column.isId && "text-muted-foreground",
										)}
									>
										{value}
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</table>
		</div>
	{/if}
</div>

<style>
	.grid-scroll {
		scrollbar-gutter: stable;
		scrollbar-color: var(--border) var(--muted);
		scrollbar-width: auto;
	}

	.grid-scroll::-webkit-scrollbar {
		height: 12px;
		width: 12px;
	}

	.grid-scroll::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: var(--radius);
	}

	.grid-scroll::-webkit-scrollbar-track {
		background: var(--muted);
	}
</style>
