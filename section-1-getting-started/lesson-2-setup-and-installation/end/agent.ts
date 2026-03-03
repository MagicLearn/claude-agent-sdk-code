import { query } from "@anthropic-ai/claude-agent-sdk"

for await (const message of query({
  prompt: "Create a file called hello.txt with a short haiku about coding",
  options: {
    model: "claude-sonnet-4-6",
    tools: ["Write"],
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
