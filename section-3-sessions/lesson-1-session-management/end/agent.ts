import { getSessionMessages, listSessions, query } from "@anthropic-ai/claude-agent-sdk";

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "What should I work on today?"
    }
  };
}

// Check for a recent session
const sessions = await listSessions({ dir: process.cwd(), limit: 1 });
console.log("sessions", sessions);
const lastSession = sessions[0];
console.log("lastSession", lastSession);
const sessionMessages = await getSessionMessages(lastSession?.sessionId || "");
console.log("sessionMessages", sessionMessages);
console.log("sessionMessages count", sessionMessages.length);

const options: any = {
  model: "claude-sonnet-4-6",
  permissionMode: "bypassPermissions",
  allowDangerouslySkipPermissions: true
};

// Resume if there's a session from today
if (lastSession) {
  const lastUsed = new Date(lastSession.lastModified);
  const today = new Date();
  if (lastUsed.toDateString() === today.toDateString()) {
    options.resume = lastSession.sessionId;
    console.log(`Resuming session: ${lastSession.summary}`);
  }
}

for await (const message of query({ prompt: messages(), options })) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
    }
  }
}
