import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Research NVIDIA's latest earnings report and save a brief summary to earnings.md"
    }
  }
}

// bypassPermissions + tools: everything auto-approves, but only WebSearch and Write are available
for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: ["WebSearch", "Write"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
