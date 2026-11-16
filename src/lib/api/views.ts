import type { models } from "as2mca-api";
import { client } from "./client";
import { mapApiError } from "./errors";

export const VIEW_ROWS_LIMIT = 1000;

export async function classViewsGet(sessionId: string, classId: string) {
  try {
    return await client.classViewsGet(sessionId, classId);
  } catch (error) {
    throw new Error(mapApiError(error, "Не удалось загрузить представления"), { cause: error });
  }
}

export async function viewGridGet(
  sessionId: string,
  classId: string,
  view: models.View,
): Promise<{ columns: models.Column[]; rows: models.RowItem[][] }> {
  const [columnsResult, rowsResult] = await Promise.allSettled([
    client.viewColumnsGet(sessionId, view.id),
    client.viewDataGetCancelable(sessionId, {
      viewShortName: view.shortName,
      classId,
      rowsLimit: VIEW_ROWS_LIMIT,
      allowTimestampMilliseconds: true,
      hint: "FIRST_ROWS(1)",
    }),
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
