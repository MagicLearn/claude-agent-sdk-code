import { query } from "@anthropic-ai/claude-agent-sdk";

// ANSI colors for subagent output
const colors: Record<string, string> = {
  "product-manager": "\x1b[36m", // cyan
  engineer: "\x1b[33m" // yellow
};
const dim = "\x1b[2m";
const reset = "\x1b[0m";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Create a project brief for a new mobile app, then write the technical specification based on that brief"
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
      "product-manager": {
        description: "Product manager. Use for creating project briefs, requirements, and product plans.",
        prompt: "You are a product manager. Create clear, actionable project briefs with goals, target audience, key features, and success metrics. Save the brief to ./brief.md in the current directory.",
        tools: ["Read", "Write"],
        model: "sonnet"
      },
      engineer: {
        description: "Engineer. Use for writing technical specifications and implementation plans based on existing documents.",
        prompt: "You are a software engineer. Read ./brief.md and write a detailed technical specification covering architecture, data models, API endpoints, and implementation plan. Save the spec to ./spec.md in the current directory.",
        tools: ["Read", "Write"],
        model: "haiku"
      }
    }
  }
})) {
  console.log(JSON.stringify(message, null, 2));
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
