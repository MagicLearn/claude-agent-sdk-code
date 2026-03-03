import { query } from "@anthropic-ai/claude-agent-sdk";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Go to https://news.ycombinator.com, find the top story, and click on it. Tell me what the page is about."
    }
  };
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(message, "\nAvailable MCP tools:", message.mcp_servers);
  }

  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
    }
  }
}
