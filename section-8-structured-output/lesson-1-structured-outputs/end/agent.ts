import { z } from "zod"
import { query } from "@anthropic-ai/claude-agent-sdk"

const CompanyInfo = z.object({
  company_name: z.string(),
  founded_year: z.number(),
  headquarters: z.string(),
  key_products: z.array(z.string()),
  description: z.string()
})

type CompanyInfo = z.infer<typeof CompanyInfo>

async function* messages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Research Anthropic and provide key company information"
    }
  }
}

for await (const message of query({
  prompt: messages(),
  options: {
    model: "claude-sonnet-4-6",
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    allowedTools: ["WebSearch", "WebFetch"],
    outputFormat: {
      type: "json_schema",
      schema: z.toJSONSchema(CompanyInfo)
    }
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    const parsed = CompanyInfo.safeParse(message.structured_output)

    if (parsed.success) {
      const info: CompanyInfo = parsed.data
      console.log(`Company: ${info.company_name}`)
      console.log(`Founded: ${info.founded_year}`)
      console.log(`HQ: ${info.headquarters}`)
      console.log(`Products: ${info.key_products.join(", ")}`)
      console.log(`About: ${info.description}`)
    } else {
      console.error("Failed to parse output:", parsed.error)
    }
  } else if (
    message.type === "result" &&
    message.subtype === "error_max_structured_output_retries"
  ) {
    console.error("Could not produce valid output after retries")
  }
}
