import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Find the most recently modified .jsonl file inside ~/.claude/projects/ and tell me its full path and file size"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: ["Bash"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  switch (message.type) {
    case "system":
      if (message.subtype === "init") {
        console.log(`Session: ${message.session_id}`)
      }
      break

    case "assistant":
      for (const block of message.message.content) {
        if ("text" in block) console.log(block.text)
      }
      break

    case "result":
      console.log(`\nCost: $${message.total_cost_usd.toFixed(4)}`)
      break
  }
}
