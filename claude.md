## Workflow

1. First, think through the problem. Read the codebase and write a plan in tasks/todo.md
2. The plan should be a checklist of todo items.
3. Check in with me before starting work — I'll verify the plan.
4. Then, complete the todos one by one, marking them off as you go.
5. At every step, give me a high-level explanation of what you changed.
6. Keep every change simple and minimal. Avoid big rewrites.
7. At the end, add a review section in todo.md summarizing the changes.

## Security

After completing any code edits, review the changes for the following before finishing:

- **No sensitive data in frontend** — no API keys, tokens, credentials, internal URLs, or environment variables exposed in HTML/JS/CSS.
- **No XSS vectors** — avoid `innerHTML`, `eval`, `document.write`, or `setTimeout`/`setInterval` with string arguments. Never reflect user input or URL params into the DOM without sanitization.
- **No unprotected external links** — any `target="_blank"` link must include `rel="noopener noreferrer"`.
- **No untrusted third-party scripts** — do not load JS from CDNs or external sources unless explicitly required; prefer self-hosted or inline.
- **CSP meta tag** — if the file will be served from a web server, include a `Content-Security-Policy` meta tag locking down `default-src`, `img-src`, `script-src`, and `style-src`.
- **HTML encoding** — special characters in content must be properly entity-encoded (`&amp;`, `&lt;`, `&gt;`, `&quot;`).
- **Form inputs** — any user-facing form must validate and sanitize input on the server side; never trust frontend-only validation.
