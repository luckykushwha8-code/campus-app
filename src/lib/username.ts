export function buildUsername(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "student";
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9._]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 24) || "student"
  );
}

export async function createUniqueUsername({
  desired,
  email,
  isTaken,
}: {
  desired?: string;
  email?: string;
  isTaken: (candidate: string) => Promise<boolean>;
}) {
  const base = buildUsername(desired, email);

  if (!(await isTaken(base))) {
    return base;
  }

  for (let attempt = 1; attempt < 100; attempt += 1) {
    const candidate = `${base}_${attempt}`.slice(0, 28);
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  return `${base}_${Date.now().toString().slice(-4)}`.slice(0, 28);
}
