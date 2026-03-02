import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "List all the markdown files in this folder"
    }
  }

  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Now read each one and write a summary document called overview.md that covers the key points from all of them"
    }
  }
}

const agent = query({
  prompt: messages(),
  options: {
    model: "claude-haiku-4-5",
    allowedTools: ["Read", "Write", "Glob"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})

// Start with Haiku for the simple listing task
// Then switch to Sonnet for the harder summarization task
let switchedModel = false

for await (const message of agent) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }

  if (message.type === "result" && !switchedModel) {
    await agent.setModel("claude-sonnet-4-6")
    switchedModel = true
  }
}
