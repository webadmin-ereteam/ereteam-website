# Marketing Website AI

The public Ereteam assistant is the chat widget shown on marketing pages. It is
separate from the authenticated Spark and Presales assistants.

## Flow

- `components/ChatWidget.tsx` renders the widget outside `/spark/**` and
  `/presales/**`.
- `hooks/useChat.ts` stores the conversation locally and posts to `/api/chat`.
- `app/api/chat/route.ts` validates and rate-limits requests, builds the current
  site context, calls Groq, logs the exchange best-effort, and returns the answer.
- `lib/getChatContext.ts` combines canonical `siteData`, Sanity content, recent
  LinkedIn posts and published Soro articles.
- `lib/services/llmService.ts` is shared with Spark and Presales. Keep product
  prompts and context construction in their own routes/modules.

## Model And Request Budget

The default public-site model is Groq `openai/gpt-oss-20b`, overridable with
`SITE_CHAT_MODEL`. Use `reasoningEffort: "low"` for the public assistant. The
required server-side secret is `GROQ_API_KEY`.

The current Groq on-demand allowance for this project rejects a single
`openai/gpt-oss-20b` request above 8,000 tokens per minute. In September 2026,
the dynamically assembled prompt grew to 9,351 requested tokens and made every
public chat request return HTTP 500. To keep the request safely below that
limit:

- Include at most four recent LinkedIn posts, with 450 characters per excerpt.
- Include at most four articles, with 1,200 characters per article excerpt.
- Send at most 8,000 characters of the most recent conversation history.
- Keep the core company, service, product, client and page data intact.
- Bump the `chat-context-v*` cache key after changing cached context shape or
  limits so a deployment cannot continue serving the previous prompt.

Do not raise these limits without measuring the complete request against the
deployed Groq account. The API's context window is not the operative limit here;
the account's per-request token allowance is.

`generateChatResponse()` treats an empty completion as an error. Preserve that
guard when changing models so the UI never renders an apparently successful
blank assistant message.

## Verification

After changing the public assistant:

```bash
npm run build
git diff --check
```

Also make a real POST request to `/api/chat` with `messages`, `currentPage` and a
non-empty `sessionId`. A successful deployment must return HTTP 200 with a
non-empty `content` value. Model-list checks alone are insufficient because a
model can be active while the full site prompt still exceeds the account limit.

Production deploys from `main` through Vercel. After pushing, wait for the Vercel
commit status to succeed and repeat the POST against
`https://www.ereteam.com/api/chat`.
