import { query } from "@anthropic-ai/claude-agent-sdk"
import * as readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer))
  })
}

console.log("Chat with Claude (type 'quit' to exit)\n")

let sessionId: string | undefined

while (true) {
  const input = await ask("You: ")
  if (input.toLowerCase() === "quit") break

  async function* messages() {
    yield {
      type: "user" as const,
      message: {
        role: "user" as const,
        content: input
      }
    }
  }

  // Show thinking indicator
  let dotCount = 0
  const thinking = setInterval(() => {
    dotCount = (dotCount % 3) + 1
    process.stdout.write(
      `\rClaude is thinking${".".repeat(dotCount)}${" ".repeat(3 - dotCount)}`
    )
  }, 400)

  let firstChunk = true

  for await (const message of query({
    prompt: messages(),
    options: {
      model: "claude-sonnet-4-6",
      systemPrompt:
        "You are a helpful assistant. Keep responses concise — a few sentences at most.",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      ...(sessionId ? { resume: sessionId } : {})
    }
  })) {
    if (message.type === "assistant") {
      if (firstChunk) {
        clearInterval(thinking)
        process.stdout.write("\r\x1b[K")
        process.stdout.write("Claude: ")
        firstChunk = false
      }
      for (const block of message.message.content) {
        if ("text" in block) process.stdout.write(block.text)
      }
    }

    if (message.type === "result") {
      if (firstChunk) {
        clearInterval(thinking)
        process.stdout.write("\r\x1b[K")
        process.stdout.write("Claude: ")
      }
      sessionId = message.session_id
    }
  }

  process.stdout.write("\n\n")
}

rl.close()
