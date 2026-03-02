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

async function* messages() {
  while (true) {
    const input = await ask("\nYou: ")
    if (input.toLowerCase() === "quit") return

    yield {
      type: "user" as const,
      message: {
        role: "user" as const,
        content: input
      }
    }
  }
}

console.log("Chat with Claude (type 'quit' to exit)\n")

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    systemPrompt:
      "You are a helpful assistant. Keep responses concise — a few sentences at most.",
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) process.stdout.write(block.text)
    }
  }
}

rl.close()
