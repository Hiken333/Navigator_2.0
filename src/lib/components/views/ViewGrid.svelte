<script lang="ts">
	import * as Empty from "$lib/components/ui/empty";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Table from "$lib/components/ui/table";
	import { cn } from "$lib/utils";
	import { cellAlignClass, type GridColumn, type GridRow } from "./views";

	let {
		columns,
		rows,
		loading = false,
	}: {
		columns: GridColumn[];
		rows: GridRow[];
		loading?: boolean;
	} = $props();
</script>

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
			<Empty.Description>Представление не вернуло колонки.</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	<Table.Root class="text-xs">
		<Table.Header>
			<Table.Row class="hover:bg-transparent">
				{#each columns as column (column.name)}
					<Table.Head
						class={cn("bg-muted/40", cellAlignClass(column.align))}
						style="min-width: {column.minWidth}px"
					>
						{column.title}
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
						{#each columns as column (column.name)}
							{@const value = row.cells[column.name] ?? ""}
							<Table.Cell
								title={value}
								class={cn(
									"max-w-80 truncate tabular-nums",
									cellAlignClass(column.align),
									column.isId && "text-muted-foreground",
								)}
								style="min-width: {column.minWidth}px"
							>
								{value}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
{/if}
