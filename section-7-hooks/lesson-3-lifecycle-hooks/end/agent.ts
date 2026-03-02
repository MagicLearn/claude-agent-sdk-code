import {
  query,
  type HookCallback,
  type SessionStartHookInput,
  type StopHookInput,
  type UserPromptSubmitHookInput
} from "@anthropic-ai/claude-agent-sdk"

const onSessionStart: HookCallback = async (input) => {
  const hookInput = input as SessionStartHookInput

  console.log(`[SessionStart] Source: ${hookInput.source}`)

  if (hookInput.source === "resume") {
    return {
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext:
          "This is a resumed session. Review your previous findings before continuing."
      }
    }
  }

  return {}
}

const ensureComplete: HookCallback = async (input) => {
  const hookInput = input as StopHookInput

  // Prevent infinite loops
  if (hookInput.stop_hook_active) {
    return {}
  }

  return {
    hookSpecificOutput: {
      hookEventName: "Stop",
      decision: "block",
      reason:
        "Before finishing, provide a brief summary of what you found and any open questions."
    }
  }
}

const validatePrompt: HookCallback = async (input) => {
  const hookInput = input as UserPromptSubmitHookInput

  if (hookInput.prompt.trim().length < 10) {
    return {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        decision: "block",
        reason: "Prompt is too short. Please provide more detail."
      }
    }
  }

  return {}
}

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Research the files in this project and explain the overall structure"
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
      SessionStart: [{ hooks: [onSessionStart] }],
      UserPromptSubmit: [{ hooks: [validatePrompt] }],
      Stop: [{ hooks: [ensureComplete] }]
    }
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
