import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Plan a product launch for a new mobile app — create a timeline document, draft an announcement post, and outline a marketing strategy"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: ["Read", "Write", "Glob", "Grep", "Task"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    agents: {
      planner: {
        description:
          "Strategic planner. Use for creating timelines, strategies, and project plans.",
        prompt:
          "You are a strategic planning specialist. Create detailed, actionable plans with clear timelines and milestones.",
        tools: ["Read", "Glob", "Grep"],
        model: "sonnet"
      },
      writer: {
        description:
          "Document writer. Use for creating polished documents and written content.",
        prompt:
          "You are a writing specialist. Create clear, well-structured documents based on the information provided.",
        tools: ["Read", "Write"],
        model: "haiku"
      }
    }
  }
})) {
  if (message.type === "assistant") {
    const prefix = message.parent_tool_use_id ? "[subagent] " : ""

    for (const block of message.message.content) {
      if ("text" in block) console.log(prefix + block.text)
    }
  }
}
