import { query } from "@anthropic-ai/claude-agent-sdk";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Summarize the pros and cons of remote work in two sentences"
    }
  };
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-haiku-4-5",
    tools: ["Read", "Write", "Glob"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
    }
  }
}
