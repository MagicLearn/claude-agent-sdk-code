import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  // First turn: create a story
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Create a file called story.txt with a one-paragraph opening to a story about a robot learning to code"
    }
  }

  // Second turn: the agent remembers the first
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Now add a second paragraph to story.txt with a plot twist"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: ["Write", "Edit", "Read"],
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
