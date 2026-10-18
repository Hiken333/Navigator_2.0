import { Client } from "as2mca-api";

const baseUrl = import.meta.env.VITE_AS2MCA_API_URL;
const client = new Client(baseUrl);

export async function login(username: string, password: string) {
    await client.authbasic(username, password);
    const session = await client.sessionInit();
    const userInfo = await client.userInfoGet(session.sessionId);
    return {
        session,
        userInfo
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