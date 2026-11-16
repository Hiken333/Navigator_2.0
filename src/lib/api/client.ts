import { Client } from "as2mca-api";

function apiBaseUrl() {
  const configured = import.meta.env.VITE_AS2MCA_API_URL || "/platform2mca/";
  if (/^https?:\/\//i.test(configured)) {
    return configured.endsWith("/") ? configured : `${configured}/`;
  }
  const origin = typeof window === "undefined" ? "http://127.0.0.1:8080" : window.location.origin;
  const path = configured.startsWith("/") ? configured : `/${configured}`;
  return new URL(path, `${origin}/`).href;
}

export const client = new Client(apiBaseUrl());
