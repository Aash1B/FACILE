const firstMessage = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const messages = value.map(firstMessage).filter((message): message is string => Boolean(message));
    return messages.length ? messages.join(" ") : undefined;
  }
  if (value && typeof value === "object") {
    const payload = value as Record<string, unknown>;
    return firstMessage(payload.message)
      || firstMessage(payload.error)
      || firstMessage(payload.detail)
      || firstMessage(payload.title);
  }
  return undefined;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const candidate = error as { response?: { data?: unknown }; message?: unknown };
    return firstMessage(candidate.response?.data)
      || firstMessage(candidate.message)
      || fallback;
  }
  return firstMessage(error) || fallback;
};

export const getApiResponseErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    payload = await response.text();
  }
  return getApiErrorMessage(payload, fallback);
};
