import { agentChat } from "./agent"

async function main() {
  console.log("Sending message to agent...")

  const { response, sessionId } = await agentChat(
    "What are 3 fun facts about TypeScript?"
  )

  console.log("\nResponse:", response)
  console.log("Session ID:", sessionId)
}

main()
