import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this for all user-generated HTML content before rendering.
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
            "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre"
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOW_DATA_ATTR: false,
    });
}
