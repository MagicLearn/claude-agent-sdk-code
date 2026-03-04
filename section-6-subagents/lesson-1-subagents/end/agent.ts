import { query } from "@anthropic-ai/claude-agent-sdk";

// ANSI colors for subagent output
const colors: Record<string, string> = {
  planner: "\x1b[36m", // cyan
  writer: "\x1b[33m" // yellow
};
const dim = "\x1b[2m";
const reset = "\x1b[0m";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Plan a weekend camping trip to Yosemite, then write a packing list based on that plan. Keep both short. Save all files in the current directory."
    }
  };
}

// Track which tool_use_id maps to which subagent
const subagentMap = new Map<string, string>();

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    tools: ["Read", "Write", "Agent"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    agents: {
      planner: {
        description: "Trip planner. Use for creating travel plans, itineraries, and activity schedules.",
        prompt: "You are a trip planner. Create a short, practical trip plan. Save it to ./plan.md in the current directory. Keep it concise — a few paragraphs max.",
        tools: ["Read", "Write"],
        model: "sonnet"
      },
      writer: {
        description: "Writer. Use for creating documents based on existing plans or research.",
        prompt: "You are a writer. Read ./plan.md and create a packing list based on the trip plan. Save it to ./packing-list.md in the current directory. Keep it concise.",
        tools: ["Read", "Write"],
        model: "haiku"
      }
    }
  }
})) {
  if (message.type === "assistant") {
    const subagentId = message.parent_tool_use_id;
    const subagentName = subagentId ? subagentMap.get(subagentId) : null;
    const color = subagentName ? (colors[subagentName] ?? "") : "";
    const prefix = subagentName ? `${color}[${subagentName}]${reset} ` : "";

    for (const block of message.message.content) {
      // Track Agent tool calls to map subagent IDs
      if ("type" in block && block.type === "tool_use" && block.name === "Agent") {
        const agentType = (block.input as Record<string, string>).subagent_type;
        subagentMap.set(block.id, agentType);
        const agentColor = colors[agentType] ?? "";
        console.log(`\n${agentColor}[${agentType}]${reset} ${dim}spawned${reset}`);
      }

      // Log tool calls from subagents
      if ("type" in block && block.type === "tool_use" && block.name !== "Agent" && subagentName) {
        const input = block.input as Record<string, string>;
        const target = input.file_path ?? "";
        console.log(`${prefix}${dim}Tool: ${block.name}${target ? ` → ${target}` : ""}${reset}`);
      }

      // Log text output
      if ("text" in block) {
        console.log(prefix + block.text);
      }
    }
  }
}
