import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Create a file called haiku.txt with a haiku about the ocean"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: ["Write"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  switch (message.type) {
    case "system":
      if (message.subtype === "init") {
        console.log(`\n--- Session started ---`)
        console.log(`Session: ${message.session_id}`)
        console.log(`Model: ${message.model}`)
        console.log(`Tools: ${message.tools.join(", ")}`)
      }
      break

    case "assistant":
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(`\n${block.text}`)
        }
        if (block.type === "tool_use") {
          console.log(`\n[Tool: ${block.name}]`)
        }
      }
      break

    case "result":
      console.log(`\n--- Done ---`)
      console.log(`Status: ${message.subtype}`)
      console.log(`Cost: $${message.total_cost_usd.toFixed(4)}`)
      console.log(`Duration: ${(message.duration_ms / 1000).toFixed(1)}s`)
      console.log(`Turns: ${message.num_turns}`)
      break
  }
}
