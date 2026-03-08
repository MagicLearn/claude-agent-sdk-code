export function stripMention(text: string): string {
  return text.replace(/<@[A-Z0-9]+>\s*/g, "").trim()
}

export function markdownToSlackMrkdwn(text: string): string {
  // Convert markdown links [text](url) to Slack <url|text>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<$2|$1>")
  // Convert **bold** to *bold*
  text = text.replace(/\*\*(.+?)\*\*/g, "*$1*")
  // Convert ~~strikethrough~~ to ~strikethrough~
  text = text.replace(/~~(.+?)~~/g, "~$1~")
  // Convert markdown headers (## Header) to bold text
  text = text.replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
  return text
}

export function formatThreadContext(
  message: string,
  channel: string,
  isDm: boolean,
  isResumed: boolean
): string {
  const location = isDm ? "Direct message" : `Channel ${channel}`
  const session = isResumed
    ? "Resumed (you have memory of previous messages in this thread)"
    : "New conversation"
  const time = new Date().toLocaleString()

  return `[Context]
- Location: ${location}
- Session: ${session}
- Current time: ${time}

${message}`
}
