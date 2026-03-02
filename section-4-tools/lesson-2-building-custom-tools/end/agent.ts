import {
  query,
  tool,
  createSdkMcpServer
} from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"

const getWeather = tool(
  "get_weather",
  "Get the current temperature for a location",
  {
    latitude: z.number().describe("Latitude coordinate"),
    longitude: z.number().describe("Longitude coordinate")
  },
  async (args) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current=temperature_2m&temperature_unit=fahrenheit`
      )

      if (!response.ok) {
        return {
          content: [
            { type: "text", text: `Weather API error: ${response.status}` }
          ],
          isError: true
        }
      }

      const data = await response.json()
      return {
        content: [
          {
            type: "text",
            text: `Temperature: ${data.current.temperature_2m}°F`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch weather: ${(error as Error).message}`
          }
        ],
        isError: true
      }
    }
  }
)

const weatherServer = createSdkMcpServer({
  name: "weather",
  tools: [getWeather]
})

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "What's the weather in San Francisco?"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    mcpServers: {
      weather: weatherServer
    },
    allowedTools: ["mcp__weather__get_weather"],
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text)
    }
  }
}
