import { query } from "@anthropic-ai/claude-agent-sdk"

const SYSTEM_PROMPT = `You are a helpful AI assistant.

Keep responses concise and to the point.
Be friendly and helpful. If you don't know something, say so.`

export async function agentChat(
  message: string,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> {
  let response = ""
  let resultSessionId = ""

  async function* messages() {
    yield {
      type: "user" as const,
      message: {
        role: "user" as const,
        content: message
      }
    }
  }

  for await (const msg of query({
    prompt: messages(),
    options: {
      model: "claude-sonnet-4-6",
      systemPrompt: SYSTEM_PROMPT,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      ...(sessionId ? { resume: sessionId } : {})
    }
  })) {
    if (msg.type === "result") {
      response = msg.subtype === "success" ? msg.result : "Something went wrong."
      resultSessionId = msg.session_id
    }
  }

  return { response, sessionId: resultSessionId }
}
