import type { models } from "as2mca-api";
import { client } from "./client";
import { mapApiError } from "./errors";

export const VIEW_ROWS_LIMIT = 80;
const VIEW_ROW_LIMITS = [VIEW_ROWS_LIMIT, 10, 5] as const;

export async function classViewsGet(sessionId: string, classId: string) {
  try {
    return await client.classViewsGet(sessionId, classId);
  } catch (error) {
    throw new Error(mapApiError(error, "Не удалось загрузить представления"), { cause: error });
  }
}

async function viewRowsGet(sessionId: string, classId: string, view: models.View) {
  let lastError: unknown;
  let rows: models.RowItem[][] = [];

  for (const rowsLimit of VIEW_ROW_LIMITS) {
    try {
      rows = await client.viewDataGetCancelable(sessionId, {
        viewShortName: view.shortName,
        classId,
        rowsLimit,
      });
      if (rows.length > 0) return rows;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError && rows.length === 0) {
    throw lastError;
  }
  return rows;
}

export async function viewGridGet(
  sessionId: string,
  classId: string,
  view: models.View,
): Promise<{ columns: models.Column[]; rows: models.RowItem[][] }> {
  const [columnsResult, rowsResult] = await Promise.allSettled([
    client.viewColumnsGet(sessionId, view.id),
    viewRowsGet(sessionId, classId, view),
  ]);

  if (columnsResult.status === "rejected" && rowsResult.status === "rejected") {
    throw new Error(
      mapApiError(columnsResult.reason, "Не удалось загрузить данные представления"),
      {
        cause: columnsResult.reason,
      },
    );
  }

  return {
    columns: columnsResult.status === "fulfilled" ? columnsResult.value : [],
    rows: rowsResult.status === "fulfilled" ? rowsResult.value : [],
  };
}
