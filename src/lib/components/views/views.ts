import type { models } from "as2mca-api";

type View = models.View;
type Column = models.Column;
type RowItem = models.RowItem;
type Align = models.Align;
type Invisible = models.Invisible;

export const VIEW_SEARCH_THRESHOLD = 8;

export type GridAlign = "left" | "center" | "right";

export type GridColumn = {
  id: string;
  name: string;
  title: string;
  align: GridAlign;
  minWidth: number;
  isId: boolean;
};

export const MIN_GRID_COLUMN_WIDTH = 56;
export const MAX_GRID_COLUMN_WIDTH = 640;
export const GRID_COLUMN_STEP = 16;

export function clampColumnWidth(width: number) {
  return Math.min(MAX_GRID_COLUMN_WIDTH, Math.max(MIN_GRID_COLUMN_WIDTH, Math.round(width)));
}

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

const HIDDEN: Invisible[] = ["1", "2"];

export function viewLabel(view: View) {
  const name = stripAccel(view.name);
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

export function isColumnHidden(column: Column) {
  return HIDDEN.includes(column.isInvisible);
}

function stripAccel(value: string) {
  return value.replaceAll("&", "").trim();
}

function uniqueKeys(values: Array<string | undefined>) {
  const keys: string[] = [];
  for (const value of values) {
    const key = value?.trim();
    if (!key || keys.includes(key)) continue;
    keys.push(key);
  }
  return keys;
}

export function columnKeys(column: Column) {
  const qual = column.qual?.trim();
  const qualTail = qual?.includes(".") ? qual.slice(qual.lastIndexOf(".") + 1) : undefined;
  return uniqueKeys([column.alias, column.qual, qualTail, column.name, stripAccel(column.name)]);
}

function rowColumnNames(rows: RowItem[][]) {
  const names = new Set<string>();
  for (const row of rows) {
    for (const item of row) {
      if (item.columnName) names.add(item.columnName);
    }
  }
  return names;
}

function positionalCode(column: Column) {
  const position = Number(column.position);
  if (!Number.isFinite(position) || position <= 0) return undefined;
  return `C_${position}`;
}

function pickColumnName(column: Column, rowNames: Set<string>) {
  const keys = columnKeys(column);
  const positional = positionalCode(column);
  const candidates = positional ? [...keys, positional] : keys;
  return candidates.find((key) => rowNames.has(key)) ?? keys[0] ?? column.name;
}

function columnTitle(column: Column, code: string) {
  return stripAccel(column.name) || code;
}

function defaultColumnWidth(title: string, apiWidth: string) {
  const fromApi = Number(apiWidth) * 8;
  const fromTitle = Math.min(240, title.length * 8 + 28);
  const preferred =
    Number.isFinite(fromApi) && fromApi > 0 ? Math.max(fromApi, fromTitle) : fromTitle;
  return clampColumnWidth(preferred);
}

function toGridColumn(column: Column, rowNames: Set<string>): GridColumn {
  const name = pickColumnName(column, rowNames);
  const title = columnTitle(column, name);
  return {
    id: `${column.position}:${name}:${column.alias ?? ""}`,
    name,
    title,
    align: ALIGN[column.align] ?? "left",
    minWidth: defaultColumnWidth(title, column.width),
    isId: name === "ID",
  };
}

function visibleColumns(columns: Column[]) {
  const shown = columns.filter((column) => !isColumnHidden(column));
  if (shown.length > 0) return shown;
  return columns.filter((column) => column.isInvisible !== "2");
}

export function gridColumns(columns: Column[], rows: RowItem[][] = []): GridColumn[] {
  const rowNames = rowColumnNames(rows);
  const source = visibleColumns(columns);
  return [...source]
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map((column) => toGridColumn(column, rowNames));
}

export function gridColumnsFromRows(rows: RowItem[][]): GridColumn[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const item of row) {
      if (!item.columnName || seen.has(item.columnName)) continue;
      seen.add(item.columnName);
      names.push(item.columnName);
    }
  }
  return names.map((name) => ({
    id: name,
    name,
    title: name,
    align: name === "ID" ? "right" : "left",
    minWidth: name === "ID" ? 96 : 120,
    isId: name === "ID",
  }));
}

export function resolveGridColumns(columns: Column[], rows: RowItem[][]): GridColumn[] {
  const fromMeta = gridColumns(columns, rows);
  if (fromMeta.length === 0) return gridColumnsFromRows(rows);

  const known = new Set(fromMeta.map((column) => column.name));
  const extras = gridColumnsFromRows(rows).filter((column) => !known.has(column.name));
  return extras.length > 0 ? [...fromMeta, ...extras] : fromMeta;
}

function cellMap(row: RowItem[]) {
  const cells = new Map<string, string>();
  for (const item of row) {
    if (!item.columnName) continue;
    cells.set(item.columnName, item.value ?? "");
  }
  return cells;
}

export function gridRows(columns: GridColumn[], rows: RowItem[][]): GridRow[] {
  return rows.map((row) => {
    const values = cellMap(row);
    const cells: Record<string, string> = {};
    for (const column of columns) {
      cells[column.name] = values.get(column.name) ?? "";
    }
    const objectId = values.get("ID") || cells.ID || undefined;
    const key = objectId ?? columns.map((column) => cells[column.name] ?? "").join("\u001f");
    return { key, objectId, cells };
  });
}

export function cellAlignClass(align: GridAlign) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
