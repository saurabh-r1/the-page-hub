// centralized small auth storage helper
// stores { user, token } as JSON under 'auth_v1' in either localStorage (remember) or sessionStorage
// also migrates legacy keys Users / token (if present)

const AUTH_KEY = "auth_v1";

function _readRaw() {
  try {
    const rawLocal = localStorage.getItem(AUTH_KEY);
    if (rawLocal) return { raw: rawLocal, place: "local" };
    const rawSession = sessionStorage.getItem(AUTH_KEY);
    if (rawSession) return { raw: rawSession, place: "session" };

    // legacy migration: old keys "Users" + "token"
    const legacyUser = localStorage.getItem("Users") || sessionStorage.getItem("Users");
    const legacyToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (legacyUser || legacyToken) {
      const parsedUser = legacyUser ? JSON.parse(legacyUser) : null;
      const obj = { user: parsedUser, token: legacyToken || undefined };
      // write to sessionStorage by default (we don't know remember)
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(obj));
      // remove legacy keys (optional: keep them to be safe; here we keep them)
      return { raw: JSON.stringify(obj), place: "session" };
    }

    return null;
  } catch (e) {
    console.warn("authStorage _readRaw error:", e);
    return null;
  }
}

export function getAuth() {
  try {
    const r = _readRaw();
    if (!r) return { user: null, token: null, place: null };
    const parsed = JSON.parse(r.raw);
    return { user: parsed.user || null, token: parsed.token || null, place: r.place };
  } catch (e) {
    console.warn("authStorage getAuth parse error:", e);
    return { user: null, token: null, place: null };
  }
}

/**
 * Save auth.
 * @param {{user: object|null, token?: string|null}} payload
 * @param {boolean} remember - if true, persist to localStorage; otherwise sessionStorage
 */
export function saveAuth(payload = { user: null, token: null }, remember = false) {
  try {
    const obj = {
      user: payload.user || null,
      token: payload.token || null,
    };
    const raw = JSON.stringify(obj);
    if (remember) {
      localStorage.setItem(AUTH_KEY, raw);
      // also remove any session copy
      sessionStorage.removeItem(AUTH_KEY);
    } else {
      sessionStorage.setItem(AUTH_KEY, raw);
      // also remove any local copy
      localStorage.removeItem(AUTH_KEY);
    }

    // also keep legacy keys for backward compatibility (optional)
    try {
      if (obj.user) {
        const rawUser = JSON.stringify(obj.user);
        if (remember) localStorage.setItem("Users", rawUser);
        else sessionStorage.setItem("Users", rawUser);
      } else {
        localStorage.removeItem("Users");
        sessionStorage.removeItem("Users");
      }

      if (obj.token) {
        if (remember) localStorage.setItem("token", obj.token);
        else sessionStorage.setItem("token", obj.token);
      } else {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      }
    } catch (_) {
      // ignore
    }

    return true;
  } catch (e) {
    console.warn("authStorage saveAuth error:", e);
    return false;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    // also remove legacy keys
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    sessionStorage.removeItem("Users");
    sessionStorage.removeItem("token");
    return true;
  } catch (e) {
    console.warn("authStorage clearAuth error:", e);
    return false;
  }
}
