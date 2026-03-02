import {
  query,
  type HookCallback,
  type PreToolUseHookInput,
  type PostToolUseHookInput,
  type PostToolUseFailureHookInput
} from "@anthropic-ai/claude-agent-sdk"

const blockDelete: HookCallback = async (input) => {
  const hookInput = input as PreToolUseHookInput

  if (String((hookInput.tool_input as any)?.command ?? "").includes("rm")) {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Deleting files is not allowed."
      }
    }
  }

  return {}
}

const logAllTools: HookCallback = async (input) => {
  const hookInput = input as PreToolUseHookInput
  console.log(
    `[PreToolUse] ${hookInput.tool_name}:`,
    JSON.stringify(hookInput.tool_input)
  )
  return {}
}

const checkBashOutput: HookCallback = async (input) => {
  const hookInput = input as PostToolUseHookInput
  const response = JSON.stringify(hookInput.tool_response)

  if (response.includes("error") || response.includes("Error")) {
    return {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        decision: "block",
        reason:
          "The command produced errors. Review the output carefully before proceeding."
      }
    }
  }

  return {}
}

const logFailures: HookCallback = async (input) => {
  const hookInput = input as PostToolUseFailureHookInput
  console.error(`[FAILED] ${hookInput.tool_name}: ${hookInput.error}`)
  return {}
}

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Clean up all the temporary files in this project"
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
          matcher: "Bash",
          hooks: [blockDelete]
        },
        {
          matcher: ".*",
          hooks: [logAllTools]
        }
      ],
      PostToolUse: [
        {
          matcher: "Bash",
          hooks: [checkBashOutput]
        }
      ],
      PostToolUseFailure: [
        {
          matcher: ".*",
          hooks: [logFailures]
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
