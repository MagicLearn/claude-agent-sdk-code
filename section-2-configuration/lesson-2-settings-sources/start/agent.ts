import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Read the README and summarize what this project does"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    allowedTools: ["Read", "Glob"],
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
