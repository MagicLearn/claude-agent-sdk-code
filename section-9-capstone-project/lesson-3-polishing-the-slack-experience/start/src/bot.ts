import { App } from "@slack/bolt"
import { agentChat } from "./agent"

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: true
})

app.event("app_mention", async ({ event, say }) => {
  const threadTs = event.thread_ts ?? event.ts

  try {
    const { response } = await agentChat(event.text)

    await say({
      text: response,
      thread_ts: threadTs
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
    const { response } = await agentChat(event.text ?? "")

    await say({
      text: response,
      thread_ts: threadTs
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
