import { App } from "@slack/bolt"
import { agentChat } from "./agent"
import { stripMention, markdownToSlackMrkdwn } from "./helpers"

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true
})

app.event("app_mention", async ({ event, say }) => {
  const threadTs = event.thread_ts ?? event.ts
  const userMessage = stripMention(event.text)

  try {
    const thinkingMessage = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      text: "_Thinking..._",
      thread_ts: threadTs
    })

    const { response } = await agentChat(userMessage)

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      ts: thinkingMessage.ts!,
      text: markdownToSlackMrkdwn(response)
    })
  } catch (error) {
    console.error("Error handling mention:", error)
    await say({
      text: "Something went wrong. Please try again.",
      thread_ts: threadTs
    })
  }
})

app.event("message", async ({ event, say }) => {
  if (event.channel_type !== "im" || event.subtype === "bot_message") return

  const threadTs = event.thread_ts ?? event.ts

  try {
    const thinkingMessage = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      text: "_Thinking..._",
      thread_ts: threadTs
    })

    const { response } = await agentChat(event.text ?? "")

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN!,
      channel: event.channel,
      ts: thinkingMessage.ts!,
      text: markdownToSlackMrkdwn(response)
    })
  } catch (error) {
    console.error("Error handling DM:", error)
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
