import { ApiError, HttpError } from "as2mca-api";

export function mapApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof HttpError) {
    return "Не удалось связаться с сервером";
  }
  return fallback;
}
