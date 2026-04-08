type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, payload: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...payload,
  };
  const serialized = JSON.stringify(entry);
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(serialized);
    return;
  }
  if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(serialized);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(serialized);
}

export const logger = {
  info(event: string, payload: Record<string, unknown> = {}) {
    write("info", event, payload);
  },
  warn(event: string, payload: Record<string, unknown> = {}) {
    write("warn", event, payload);
  },
  error(event: string, payload: Record<string, unknown> = {}) {
    write("error", event, payload);
  },
};
