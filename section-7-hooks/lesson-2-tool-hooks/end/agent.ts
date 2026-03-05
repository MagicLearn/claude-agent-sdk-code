import {
  query,
  type HookCallback,
  type PreToolUseHookInput,
  type PostToolUseHookInput
} from "@anthropic-ai/claude-agent-sdk"

const blockEditAgentTs: HookCallback = async (input) => {
  const hookInput = input as PreToolUseHookInput
  const filePath = String((hookInput.tool_input as any)?.file_path ?? "")

  if (filePath.includes("agent.ts")) {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Editing agent.ts is not allowed."
      }
    }
  }

  return {}
}

const logReads: HookCallback = async (input) => {
  const hookInput = input as PostToolUseHookInput
  const filePath = String((hookInput.tool_input as any)?.file_path ?? "")
  console.log(`[PostToolUse] Read: ${filePath}`)
  return {}
}

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Read agent.ts and add a comment at the top explaining what it does"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    hooks: {
      PreToolUse: [
        {
          matcher: "Edit",
          hooks: [blockEditAgentTs]
        }
      ],
      PostToolUse: [
        {
          matcher: "Read",
          hooks: [logReads]
        }
      ]
    }
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
