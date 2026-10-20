import { Client } from "as2mca-api";
import type { ClassType } from "./types";

const baseUrl = import.meta.env.VITE_AS2MCA_API_URL;

export const client = new Client(baseUrl);
//типы навигатора
export let typesABS: Promise<ClassType[]>;
//справочники навигатора
export let guidesABS: Promise<ClassType[]>;
export async function login(username: string, password: string) {
  console.log("1");
  try {
    await client.authbasic(username, password);
  } catch (e) {
    console.log(e);
  }

  const session = await client.sessionInit();
  const userInfo = await client.userInfoGet(session.sessionId);

  typesABS = client.typesGet(session.sessionId);
  guidesABS = client.guidesGet(session.sessionId);

  return {
    session,
    userInfo,
  };
}

export async function logout(sessionId: string) {
  await client.sessionDeinit(sessionId);
}

export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    await client.userInfoGet(sessionId);
    return true;
  } catch {
    return false;
  }
}
export async function ensureSession(sessionId: string) {
  const ok = await validateSession(sessionId);
  if (!ok) throw new Error("SESSION_INVALID");
}
