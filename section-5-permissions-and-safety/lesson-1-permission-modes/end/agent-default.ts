import { query } from "@anthropic-ai/claude-agent-sdk";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Research NVIDIA's latest earnings report and save a brief summary to earnings.md"
    }
  };
}

// default: every tool call needs approval
for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    permissionMode: "default"
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
    }
  }
}
