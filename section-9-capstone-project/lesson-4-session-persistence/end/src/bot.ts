import { App } from "@slack/bolt"
import { agentChat } from "./agent"
import { stripMention, markdownToSlackMrkdwn } from "./helpers"
import { SessionStore } from "./session-store"

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true
})

const sessionStore = new SessionStore("sessions.db")

app.event("app_mention", async ({ event, say }) => {
  const threadTs = event.thread_ts ?? event.ts
  const userMessage = stripMention(event.text)
  const threadKey = `${event.channel}:${threadTs}`
  const existingSessionId = sessionStore.get(threadKey) ?? undefined

  try {
    const thinkingMessage = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      text: "_Thinking..._",
      thread_ts: threadTs
    })

    const { response, sessionId } = await agentChat(userMessage, existingSessionId)
    sessionStore.set(threadKey, sessionId)

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      ts: thinkingMessage.ts!,
      text: markdownToSlackMrkdwn(response)
    })
  } catch (error) {
    console.error("Error handling mention:", error)

    if (existingSessionId) {
      sessionStore.delete(threadKey)
      console.log("Deleted broken session for thread:", threadKey)
    }

    await say({
      text: "Something went wrong. Please try again.",
      thread_ts: threadTs
    })
  }
})

app.event("message", async ({ event, say }) => {
  if (event.channel_type !== "im" || event.subtype || event.bot_id) return

  const threadTs = event.thread_ts ?? event.ts
  const threadKey = `${event.channel}:${threadTs}`
  const existingSessionId = sessionStore.get(threadKey) ?? undefined

  try {
    const thinkingMessage = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      text: "_Thinking..._",
      thread_ts: threadTs
    })

    const { response, sessionId } = await agentChat(event.text ?? "", existingSessionId)
    sessionStore.set(threadKey, sessionId)

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      ts: thinkingMessage.ts!,
      text: markdownToSlackMrkdwn(response)
    })
  } catch (error) {
    console.error("Error handling DM:", error)

    if (existingSessionId) {
      sessionStore.delete(threadKey)
      console.log("Deleted broken session for thread:", threadKey)
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
