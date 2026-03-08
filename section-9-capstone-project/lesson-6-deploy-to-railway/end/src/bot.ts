import { App } from "@slack/bolt"
import { agentChat } from "./agent"
import { stripMention, markdownToSlackMrkdwn, formatThreadContext } from "./helpers"
import { SessionStore } from "./session-store"

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true
})

const sessionStore = new SessionStore(
  process.env.SESSION_DB_PATH ?? "sessions.db"
)

const threadLocks = new Map<string, Promise<void>>()

async function withThreadLock<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const prev = threadLocks.get(key) ?? Promise.resolve()
  let resolve!: () => void
  const next = new Promise<void>((r) => (resolve = r))
  threadLocks.set(key, next)
  await prev
  try {
    return await fn()
  } finally {
    resolve()
    if (threadLocks.get(key) === next) threadLocks.delete(key)
  }
}

app.event("app_mention", async ({ event, say }) => {
  const threadTs = event.thread_ts ?? event.ts
  const userMessage = stripMention(event.text)
  const threadKey = `${event.channel}:${threadTs}`

  try {
    const thinkingMessage = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      text: "_Thinking..._",
      thread_ts: threadTs
    })

    await withThreadLock(threadKey, async () => {
      const existingSessionId = sessionStore.get(threadKey) ?? undefined
      const context = formatThreadContext(
        userMessage, event.channel, false, !!existingSessionId
      )

      const { response, sessionId } = await agentChat(context, existingSessionId)
      sessionStore.set(threadKey, sessionId)

      await app.client.chat.update({
        token: process.env.SLACK_BOT_TOKEN!,
        channel: event.channel,
        ts: thinkingMessage.ts!,
        text: markdownToSlackMrkdwn(response)
      })
    })
  } catch (error) {
    console.error("Error handling mention:", error)

    if (sessionStore.get(threadKey)) {
      sessionStore.delete(threadKey)
    }

    await say({
      text: "Something went wrong. Please try again.",
      thread_ts: threadTs
    })
  }
})

app.event("message", async ({ event, say }) => {
  if (event.channel_type !== "im" || event.subtype === "bot_message") return

  const threadTs = event.thread_ts ?? event.ts
  const threadKey = `${event.channel}:${threadTs}`

  try {
    const thinkingMessage = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      text: "_Thinking..._",
      thread_ts: threadTs
    })

    await withThreadLock(threadKey, async () => {
      const existingSessionId = sessionStore.get(threadKey) ?? undefined
      const context = formatThreadContext(
        event.text ?? "", event.channel, true, !!existingSessionId
      )

      const { response, sessionId } = await agentChat(context, existingSessionId)
      sessionStore.set(threadKey, sessionId)

      await app.client.chat.update({
        token: process.env.SLACK_BOT_TOKEN!,
        channel: event.channel,
        ts: thinkingMessage.ts!,
        text: markdownToSlackMrkdwn(response)
      })
    })
  } catch (error) {
    console.error("Error handling DM:", error)

    if (sessionStore.get(threadKey)) {
      sessionStore.delete(threadKey)
    }

    await say({
      text: "Something went wrong. Please try again.",
      thread_ts: threadTs
    })
  }
})

async function main() {
  await app.start()
  console.log("Bot is running!")
}

main()
