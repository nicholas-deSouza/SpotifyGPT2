//npx tsx openai-test.ts
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey:  process.env.OPENAI_API_KEY
});

const chatCompletion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{"role": "user", "content": "what is batman's name?"}],
});
console.log(chatCompletion.choices[0].message);


  

