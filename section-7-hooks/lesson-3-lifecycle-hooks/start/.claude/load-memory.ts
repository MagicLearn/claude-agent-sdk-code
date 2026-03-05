import { readFileSync } from "fs"
import { join } from "path"

const memoryPath = join(import.meta.dirname, "..", "memory.md")
const memory = readFileSync(memoryPath, "utf-8")

console.error("[SessionStart] Memory loaded")

const output = JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: `Here is the user's memory file. Follow these preferences:\n\n${memory}`
  }
})

process.stdout.write(output)
