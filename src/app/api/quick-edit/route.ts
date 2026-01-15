import { deepseek } from "@ai-sdk/deepseek"
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic"

import { firecrawl } from "@/lib/firecrawl"


const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    baseURL: process.env.ANTHROPIC_BASE_URL || ""
});

const quickEditSchema = z.object({
    editedCode: z.string().describe("The edited version of the selected code based on the instruction")
});

const URL_REGEX = /https?:\/\/[^\s]+/g;

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;


export async function POST(request: Request) {

    try {
        // const {userId} = use
        const { selectedCode, fullCode, instruction } = await request.json();


        if (!selectedCode) {
            return NextResponse.json({ error: "Selected code is required" }, { status: 400 });
        }
        if (!instruction) {
            return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
        }

        const urls: string[] = instruction.match(URL_REGEX) || [];
        let documentContext = ""

        if (urls.length > 0) {
            const scrapedResults = await Promise.all(urls.map(url => {
                urls.map(async url => {
                    try {
                        const result = await firecrawl.scrape(url, {
                            formats: ["markdown"]
                        })
                        if (result.markdown) {
                            return `<doc url="${url}">\n${result.markdown}\n</doc>`
                        }
                        return null
                    } catch (error) {
                        return null
                    }
                })
            }));
            const validResults = scrapedResults.filter(Boolean)

            if (validResults.length > 0) {
                documentContext = `<documentation>\n${validResults.join("\n\n")}\n</documentation>`
            }

        }


        const prompt = QUICK_EDIT_PROMPT
            .replace("{selectedCode}", selectedCode)
            .replace("{fullCode}", fullCode)
            .replace("{instruction}", instruction)
            .replace("{documentation}", documentContext);

        
        const {output} = await generateText({
            model: anthropic("claude-3-5-haiku-latest"),
            prompt,
            output: Output.object({ schema: quickEditSchema })
        });

        return NextResponse.json(output);
    } catch (error) {
        console.error("Error editing code:",error);
        return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }


}
