export interface AppUser {
  id: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  collegeName?: string;
  collegeId?: string;
  avatarUrl?: string;
  coverUrl?: string;
  settings?: AppUserSettings;
  verified?: boolean;
}

export interface AppUserSettings {
  pushNotifications: boolean;
  roomAlerts: boolean;
  emailUpdates: boolean;
  profileVisible: boolean;
  showCollegeDetails: boolean;
  showActivityStatus: boolean;
  publicProfile: boolean;
}

export interface AppSession {
  token: string;
  user: AppUser;
}

interface LocalAuthAccount {
  email: string;
  password: string;
  user: AppUser;
}

const SESSION_KEY = "campuslink_session";
const SESSION_EVENT = "campuslink:session";
export const SESSION_COOKIE = "campuslink_token";
const LOCAL_ACCOUNTS_KEY = "campuslink_local_accounts";

export const DEFAULT_USER_SETTINGS: AppUserSettings = {
  pushNotifications: true,
  roomAlerts: true,
  emailUpdates: false,
  profileVisible: true,
  showCollegeDetails: true,
  showActivityStatus: true,
  publicProfile: false,
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function emitSessionChange() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

function syncSessionCookie(token?: string | null) {
  if (!canUseStorage()) return;

  if (!token) {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function buildUsername(email: string, fallbackName?: string) {
  const source = fallbackName?.trim() || email.split("@")[0] || "student";
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "student";
}

export function normalizeUser(user: Partial<AppUser> & { id: string; email: string }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split("@")[0],
    username: user.username || buildUsername(user.email, user.name),
    bio: user.bio || "",
    collegeName: user.collegeName || "",
    collegeId: user.collegeId || "",
    avatarUrl: user.avatarUrl || "",
    coverUrl: user.coverUrl || "",
    settings: {
      ...DEFAULT_USER_SETTINGS,
      ...(user.settings || {}),
    },
    verified: Boolean(user.verified),
  } satisfies AppUser;
}

export function getStoredSession(): AppSession | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.token || !parsed?.user?.id || !parsed?.user?.email) return null;
    return {
      token: parsed.token,
      user: normalizeUser(parsed.user),
    };
  } catch {
    return null;
  }
}

export function setStoredSession(session: AppSession) {
  if (!canUseStorage()) return;
  const normalized = {
    token: session.token,
    user: normalizeUser(session.user),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  syncSessionCookie(session.token);
  emitSessionChange();
}

export function clearStoredSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
  syncSessionCookie(null);
  emitSessionChange();
}

export function updateStoredUser(updates: Partial<AppUser>) {
  const current = getStoredSession();
  if (!current) return;
  const nextUser = normalizeUser({ ...current.user, ...updates });
  const accounts = getStorageItem<LocalAuthAccount[]>(LOCAL_ACCOUNTS_KEY, []);
  const nextAccounts = accounts.map((account) =>
    account.email === current.user.email
      ? {
          ...account,
          user: normalizeUser({ ...account.user, ...updates }),
        }
      : account
  );
  setStorageItem(LOCAL_ACCOUNTS_KEY, nextAccounts);
  setStoredSession({
    ...current,
    user: nextUser,
  });
}

export function getStorageItem<T>(key: string, fallback: T) {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveLocalAccount(account: LocalAuthAccount) {
  const current = getStorageItem<LocalAuthAccount[]>(LOCAL_ACCOUNTS_KEY, []);
  const next = [
    ...current.filter((item) => item.email !== account.email),
    account,
  ];
  setStorageItem(LOCAL_ACCOUNTS_KEY, next);
}

export function findLocalAccount(email: string, password: string) {
  const current = getStorageItem<LocalAuthAccount[]>(LOCAL_ACCOUNTS_KEY, []);
  return current.find((item) => item.email === email && item.password === password) || null;
}

export function subscribeToSession(callback: () => void) {
  if (!canUseStorage()) return () => undefined;

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(SESSION_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SESSION_EVENT, handler);
  };
}
