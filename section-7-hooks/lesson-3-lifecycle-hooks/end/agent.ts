import { readFileSync } from "fs"
import { join } from "path"
import { query, type HookCallback } from "@anthropic-ai/claude-agent-sdk"

const loadMemory: HookCallback = async () => {
  const memoryPath = join(import.meta.dirname, "memory.md")
  const memory = readFileSync(memoryPath, "utf-8")

  console.log("[SessionStart] Memory loaded")

  return {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: `Here is the user's memory file. Follow these preferences:\n\n${memory}`
    }
  }
}

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "What do you know about me?"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    hooks: {
      SessionStart: [
        {
          hooks: [loadMemory]
        }
      ]
    }
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
