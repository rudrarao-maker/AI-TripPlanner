import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testModel(modelName: string) {
  try {
    const result = await generateObject({
      model: google(modelName),
      prompt: 'Hello, world!',
      schema: z.object({ response: z.string() }),
    });
    console.log(`Model ${modelName} SUCCESS!`);
  } catch (err: any) {
    console.error(`Model ${modelName} FAILED:`, err.message);
  }
}

async function run() {
  await testModel("gemini-3.5-flash");
  await testModel("gemini-flash-latest");
}
run();
