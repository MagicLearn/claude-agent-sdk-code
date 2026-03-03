import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Here are my raw notes from today's meeting: Talked about Q3 roadmap. Sarah wants to prioritize the mobile app. Jake thinks we should fix the onboarding flow first. Decided to do onboarding first, then mobile. Sarah will write the onboarding spec by Friday. Jake will review it Monday."
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    settingSources: ["project"],
    tools: ["Skill", "Read", "Write"],
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
