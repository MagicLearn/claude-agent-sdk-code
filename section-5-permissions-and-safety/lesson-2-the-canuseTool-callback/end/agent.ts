import { query } from "@anthropic-ai/claude-agent-sdk";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Research the best coffee brewing methods and save a guide to coffee-guide.md"
    }
  };
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    canUseTool: async (toolName, input) => {
      console.log(`\n[canUseTool] ${toolName}:`, JSON.stringify(input));

      // Block all web access — agent must use its own knowledge
      if (toolName === "WebSearch" || toolName === "WebFetch") {
        console.log(`[DENIED] ${toolName} — web access blocked`);
        return {
          behavior: "deny",
          message:
            "Web access is not available. Use your own knowledge instead."
        };
      }

      // Rename the output file
      if (toolName === "Write") {
        console.log(
          `[MODIFIED] Write — renamed ${input.file_path} → barista-guide.md`
        );
        return {
          behavior: "allow",
          updatedInput: {
            ...input,
            file_path: "barista-guide.md"
          }
        };
      }

      console.log(`[ALLOWED] ${toolName}`);
      return { behavior: "allow", updatedInput: input };
    }
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
    }
  }
}
