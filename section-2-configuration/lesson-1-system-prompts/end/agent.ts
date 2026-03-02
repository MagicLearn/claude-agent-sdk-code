import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "What are the main arguments for and against nuclear energy?"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    systemPrompt:
      "You are a research assistant. Present multiple perspectives on every topic. Use clear headers and bullet points. Cite specific data points when possible.",
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
