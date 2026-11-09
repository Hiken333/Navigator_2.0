import type { models } from "as2mca-api";

type View = models.View;
type Column = models.Column;
type RowItem = models.RowItem;
type Align = models.Align;

export const VIEW_SEARCH_THRESHOLD = 8;

export type GridAlign = "left" | "center" | "right";

export type GridColumn = {
  name: string;
  title: string;
  align: GridAlign;
  minWidth: number;
  isId: boolean;
};

export type GridRow = {
  key: string;
  objectId?: string;
  cells: Record<string, string>;
};

const ALIGN: Record<Align, GridAlign> = {
  "0": "left",
  "1": "center",
  "2": "right",
};

export function viewLabel(view: View) {
  const name = view.name.replaceAll("&", "").trim();
  return name || view.shortName;
}

export function matchesViewQuery(view: View, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return viewLabel(view).toLowerCase().includes(q) || view.shortName.toLowerCase().includes(q);
}

export function orderedViews(views: View[]) {
  return [...views].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return viewLabel(a).localeCompare(viewLabel(b), "ru");
  });
}

export function pickDefaultView(views: View[]) {
  return views.find((view) => view.isDefault) ?? views[0];
}

export function filterViews(views: View[], query: string) {
  const ordered = orderedViews(views);
  if (!query.trim()) return ordered;
  return ordered.filter((view) => matchesViewQuery(view, query));
}

export function isColumnVisible(column: Column) {
  return column.isInvisible !== "2";
}

function columnCode(column: Column) {
  return column.alias || column.qual || column.name;
}

function columnTitle(column: Column) {
  return column.name.replaceAll("&", "").trim() || columnCode(column);
}

function toGridColumn(column: Column): GridColumn {
  const name = columnCode(column);
  return {
    name,
    title: columnTitle(column),
    align: ALIGN[column.align] ?? "left",
    minWidth: Math.min(320, Math.max(72, Number(column.width) * 8 || 96)),
    isId: name === "ID",
  };
}

export function gridColumns(columns: Column[]): GridColumn[] {
  const visible = columns.filter(isColumnVisible);
  const source = visible.length > 0 ? visible : columns;
  return [...source].sort((a, b) => Number(a.position) - Number(b.position)).map(toGridColumn);
}

export function gridColumnsFromRows(rows: RowItem[][]): GridColumn[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const item of row) {
      if (seen.has(item.columnName)) continue;
      seen.add(item.columnName);
      names.push(item.columnName);
    }
  }
  return names.map((name) => ({
    name,
    title: name,
    align: name === "ID" ? "right" : "left",
    minWidth: name === "ID" ? 96 : 120,
    isId: name === "ID",
  }));
}

export function resolveGridColumns(columns: Column[], rows: RowItem[][]): GridColumn[] {
  const fromMeta = gridColumns(columns);
  if (fromMeta.length > 0) return fromMeta;
  return gridColumnsFromRows(rows);
}

export function gridRows(columns: GridColumn[], rows: RowItem[][]): GridRow[] {
  return rows.map((row) => {
    const cells: Record<string, string> = {};
    for (const item of row) {
      cells[item.columnName] = item.value ?? "";
    }
    const objectId = cells.ID || undefined;
    const key = objectId ?? columns.map((column) => cells[column.name] ?? "").join("\u001f");
    return { key, objectId, cells };
  });
}

export function cellAlignClass(align: GridAlign) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
