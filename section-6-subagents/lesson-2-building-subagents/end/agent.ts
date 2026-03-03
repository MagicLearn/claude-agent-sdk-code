import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Research the pros and cons of microservices vs monoliths, then write a summary document"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: [
      "Read",
      "Write",
      "Glob",
      "Grep",
      "WebSearch",
      "WebFetch",
      "Task"
    ],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    agents: {
      researcher: {
        description:
          "Research specialist. Use for gathering information from files and the web.",
        prompt:
          "You are a research assistant. Investigate the topic thoroughly using the tools available. Return a clear, organized summary of your findings.",
        tools: ["Read", "Glob", "Grep", "WebSearch", "WebFetch"],
        model: "haiku"
      },
      writer: {
        description:
          "Writing specialist. Use for creating documents and written content.",
        prompt:
          "You are a writing assistant. Take the information provided and create well-structured, clear documents.",
        tools: ["Read", "Write"],
        model: "sonnet"
      }
    }
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
