import { query } from "@anthropic-ai/claude-agent-sdk"

const SYSTEM_PROMPT = `You are a helpful AI assistant in Slack.

Keep responses concise and to the point.
Be friendly and helpful. If you don't know something, say so.

Format your responses using Slack mrkdwn syntax:
- Use *bold* for emphasis (not **bold**)
- Use _italic_ for secondary emphasis
- Use \`code\` for inline code
- Use \`\`\` for code blocks
- Use > for blockquotes
- Use bullet lists with - or •
- Never use markdown headers (# or ##) — use *bold text* on its own line instead
- Never use markdown links [text](url) — use <url|text> instead`

const SESSION_CWD = process.env.SESSION_CWD ?? process.cwd()

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
      maxTurns: 30,
      maxBudgetUsd: 1.00,
      cwd: SESSION_CWD,
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
