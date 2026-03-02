import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Research the history of the internet and write a comprehensive summary"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    maxTurns: 10,
    maxBudgetUsd: 0.5,
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }

  if (message.type === "result") {
    console.log(`\n--- Result ---`)
    console.log(`Subtype: ${message.subtype}`)
    console.log(`Total cost: $${message.total_cost_usd}`)
    console.log(`Turns: ${message.num_turns}`)
    console.log(`Duration: ${message.duration_ms}ms`)

    if (message.is_error) {
      console.log(`Errors:`, message.errors)
    }
  }
}
