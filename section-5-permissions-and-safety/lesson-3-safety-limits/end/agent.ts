import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Plan a detailed 2-week trip to Japan with daily itineraries and save it to japan-trip.md"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    maxTurns: 10,
    maxBudgetUsd: 0.50,
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
    console.log("\n--- Result ---")
    console.log(`Subtype: ${message.subtype}`)
    console.log(`Total cost: $${message.total_cost_usd}`)
    console.log(`Turns: ${message.num_turns}`)
    console.log(`Duration: ${message.duration_ms}ms`)

    if (message.is_error) {
      console.log("Errors:", message.errors)
    }
  }
}
