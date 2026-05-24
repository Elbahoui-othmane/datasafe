type RuntimeEnv = Record<string, unknown>;

const runtimeKey = "__AVERONIX_RUNTIME_ENV__";

export function setRuntimeEnv(env: unknown) {
  (globalThis as unknown as Record<string, unknown>)[runtimeKey] = env;
}

export function getRuntimeEnv(): RuntimeEnv {
  const env = (globalThis as unknown as Record<string, unknown>)[runtimeKey];
  const processEnv =
    typeof process !== "undefined" && process.env
      ? process.env
      : {};

  return {
    ...(processEnv as Record<string, string | undefined>),
    ...(isRecord(env) ? env : {}),
  };
}

export function readEnvString(name: string): string | undefined {
  const value = getRuntimeEnv()[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function readEnvBinding<T>(names: string[]): T | undefined {
  const env = getRuntimeEnv();
  for (const name of names) {
    const value = env[name];
    if (value) return value as T;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
