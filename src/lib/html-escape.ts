// src/lib/html-escape.ts
/**
 * Escapes HTML special characters to prevent XSS attacks in email templates.
 * Use this for any user-provided content that will be embedded in HTML emails.
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] || char;
  });
}

/**
 * Escapes multiple fields in an object for safe HTML embedding.
 */
export function escapeHtmlFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === "string") {
      (result as Record<string, unknown>)[field as string] = escapeHtml(
        result[field] as string
      );
    }
  }
  return result;
}
