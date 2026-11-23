<script lang="ts">
	import * as Empty from "$lib/components/ui/empty";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Table from "$lib/components/ui/table";
	import { cn } from "$lib/utils";
	import {
		cellAlignClass,
		clampColumnWidth,
		clampFitColumnWidth,
		GRID_COLUMN_CHROME,
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

	let grid: HTMLTableElement | null = null;
	let widths = $state<Record<string, number>>({});
	let resizing = $state(false);
	let drag: { id: string; index: number; originX: number; originWidth: number } | null = null;

	function columnWidth(column: GridColumn) {
		return widths[column.id] ?? column.minWidth;
	}

	function paintColumn(index: number, px: number) {
		const node = grid;
		if (!node) return;
		node.style.setProperty(`--c${index}`, `${px}px`);
		let sum = 0;
		for (let cursor = 0; cursor < columns.length; cursor += 1) {
			sum += Number.parseFloat(node.style.getPropertyValue(`--c${cursor}`)) || 0;
		}
		node.style.setProperty("--grid-width", `${sum}px`);
	}

	function applyColumnVars(node: HTMLTableElement) {
		let sum = 0;
		for (const [index, column] of columns.entries()) {
			const px = widths[column.id] ?? column.minWidth;
			sum += px;
			node.style.setProperty(`--c${index}`, `${px}px`);
		}
		node.style.setProperty("--grid-width", `${sum}px`);
	}

	function setColumnWidth(id: string, width: number) {
		widths[id] = clampColumnWidth(width);
	}

	function onResizePointerDown(
		event: PointerEvent & { currentTarget: HTMLButtonElement },
		column: GridColumn,
		index: number,
	) {
		event.preventDefault();
		event.stopPropagation();
		resizing = true;
		drag = { id: column.id, index, originX: event.clientX, originWidth: columnWidth(column) };
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function onResizePointerMove(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
		paintColumn(drag.index, clampColumnWidth(drag.originWidth + event.clientX - drag.originX));
	}

	function onResizePointerUp(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		if (drag && grid) {
			const painted = Number.parseFloat(grid.style.getPropertyValue(`--c${drag.index}`));
			if (Number.isFinite(painted)) widths[drag.id] = painted;
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

	function onHeaderDoubleClick(event: MouseEvent, column: GridColumn) {
		if ((event.target as HTMLElement | null)?.closest("button")) return;
		const sample = grid?.querySelector("td") ?? grid;
		if (!sample) return;
		const context = document.createElement("canvas").getContext("2d");
		if (!context) return;
		context.font = getComputedStyle(sample).font;
		let widest = context.measureText(column.title).width;
		for (const row of rows) {
			const value = row.cells[column.name] ?? "";
			if (!value) continue;
			widest = Math.max(widest, context.measureText(value).width);
		}
		widths[column.id] = clampFitColumnWidth(widest + GRID_COLUMN_CHROME);
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
				{@attach (node) => {
					grid = node;
					applyColumnVars(node);
					return () => {
						grid = null;
					};
				}}
				class="caption-bottom table-fixed border-separate border-spacing-0 text-xs"
				style:width="var(--grid-width)"
			>
				<colgroup>
					{#each columns as column, index (column.id)}
						<col style:width={`var(--c${index})`} />
					{/each}
				</colgroup>
				<Table.Header class="sticky top-0 z-10">
					<Table.Row class="hover:bg-transparent">
						{#each columns as column, index (column.id)}
							<Table.Head
								class={cn(
									"relative h-8 overflow-hidden border-b bg-muted pr-2.5 font-medium",
									cellAlignClass(column.align),
								)}
								title={column.title}
								ondblclick={(event) => onHeaderDoubleClick(event, column)}
							>
								<span class="block truncate">{column.title}</span>
								<button
									type="button"
									aria-label="Ширина колонки {column.title}"
									class="absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none border-0 bg-transparent p-0 hover:bg-foreground/20"
									onpointerdown={(event) => onResizePointerDown(event, column, index)}
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
