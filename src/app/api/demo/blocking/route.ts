import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const open = createOpenAICompatible({
    name: "provider-zhipu",
    apiKey: process.env.GLM_API_KEY,
    baseURL: process.env.GLM_URL!
});

export async function POST() {

    const { text } = await generateText({
        model: open('GLM-4.7'),
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    });

    return NextResponse.json({ text });

}