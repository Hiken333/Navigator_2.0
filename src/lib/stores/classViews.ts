import type { models } from "as2mca-api";
import { writable } from "svelte/store";
import { classViewsGet, viewGridGet } from "$lib/api/views";
import { pickDefaultView } from "$lib/components/views/views";

type View = models.View;
type Column = models.Column;
type RowItem = models.RowItem;

export type ClassViewsState = {
  classId: string | null;
  views: View[];
  selectedViewId: string | null;
  columns: Column[];
  rows: RowItem[][];
  viewsLoading: boolean;
  gridLoading: boolean;
  viewsError: string;
  gridError: string;
};

const empty: ClassViewsState = {
  classId: null,
  views: [],
  selectedViewId: null,
  columns: [],
  rows: [],
  viewsLoading: false,
  gridLoading: false,
  viewsError: "",
  gridError: "",
};

export const classViews = writable<ClassViewsState>(empty);

let viewsGeneration = 0;
let gridGeneration = 0;

export function clearClassViews() {
  viewsGeneration += 1;
  gridGeneration += 1;
  classViews.set(empty);
}

export async function openClassViews(sessionId: string, classId: string) {
  const viewsToken = ++viewsGeneration;
  const gridToken = ++gridGeneration;

  classViews.set({
    ...empty,
    classId,
    viewsLoading: true,
  });

  try {
    const views = await classViewsGet(sessionId, classId);
    if (viewsToken !== viewsGeneration) return;

    const selected = pickDefaultView(views);
    classViews.set({
      classId,
      views,
      selectedViewId: selected?.id ?? null,
      columns: [],
      rows: [],
      viewsLoading: false,
      gridLoading: Boolean(selected),
      viewsError: "",
      gridError: "",
    });

    if (selected) await loadGrid(sessionId, classId, selected, gridToken);
  } catch (error) {
    if (viewsToken !== viewsGeneration) return;
    classViews.set({
      ...empty,
      classId,
      viewsError: error instanceof Error ? error.message : "Не удалось загрузить представления",
    });
  }
}

export async function selectClassView(sessionId: string, viewId: string) {
  const gridToken = ++gridGeneration;
  let classId: string | null = null;
  let view: View | undefined;

  classViews.update((state) => {
    classId = state.classId;
    view = state.views.find((item) => item.id === viewId);
    return {
      ...state,
      selectedViewId: viewId,
      columns: [],
      rows: [],
      gridLoading: true,
      gridError: "",
    };
  });

  if (!classId || !view) return;
  await loadGrid(sessionId, classId, view, gridToken);
}

async function loadGrid(sessionId: string, classId: string, view: View, gridToken: number) {
  try {
    const { columns, rows } = await viewGridGet(sessionId, classId, view);
    if (gridToken !== gridGeneration) return;
    classViews.update((state) => ({
      ...state,
      columns,
      rows,
      gridLoading: false,
      gridError: "",
    }));
  } catch (error) {
    if (gridToken !== gridGeneration) return;
    classViews.update((state) => ({
      ...state,
      columns: [],
      rows: [],
      gridLoading: false,
      gridError:
        error instanceof Error ? error.message : "Не удалось загрузить данные представления",
    }));
  }
}
