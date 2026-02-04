import { deepseek } from "@ai-sdk/deepseek"
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic"


const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    baseURL: process.env.ANTHROPIC_BASE_URL || ""
});

const suggestionSchema = z.object({
    suggestion: z.string().describe("The code to insert at cursor, or empty string if no completion needed")
});


const SUGGESTION_PROMPT = `You are a code suggestion assistant.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_cursor>{textBeforeCursor}</before_cursor>
<after_cursor>{textAfterCursor}</after_cursor>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER:

1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.

2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.

3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.

Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
</instructions>`;

export async function POST(request: Request) {
    try {
        const {
            fileName,
            previousLines,
            lineNumber,
            currentLine,
            textBeforeCursor,
            textAfterCursor,
            nextLines,
            code
        } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const prompt = SUGGESTION_PROMPT
            .replace("{fileName}", fileName)
            .replace("{previousLines}", previousLines || "")
            .replace("{lineNumber}", lineNumber.toString())
            .replace("{currentLine}", currentLine)
            .replace("{textBeforeCursor}", textBeforeCursor)
            .replace("{textAfterCursor}", textAfterCursor)
            .replace("{nextLines}", nextLines || "")
            .replace("{code}", code);

        const { output } = await generateText({
            model: anthropic("claude-3-5-haiku-latest"),
            prompt,
            output: Output.object({ schema: suggestionSchema })
        });

        return NextResponse.json(output);
    } catch (error) {
        console.error("Failed to generate suggestion:", error);
        return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
    }
}

