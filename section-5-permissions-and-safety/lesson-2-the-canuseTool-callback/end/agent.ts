import { query } from "@anthropic-ai/claude-agent-sdk"

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Create a file called notes.txt with a summary of today's tasks, then list all files in the current directory"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    canUseTool: async (toolName, input) => {
      console.log(`[Permission] ${toolName}:`, JSON.stringify(input))

      // Block any Bash command that contains "rm"
      if (toolName === "Bash" && String(input.command).includes("rm")) {
        return {
          behavior: "deny",
          message: "Deleting files is not allowed. Try a different approach."
        }
      }

      return { behavior: "allow", updatedInput: input }
    }
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
