import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import serverless from 'serverless-http';
import express from 'express';
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.post('/ListOfSongs', async (req, res) => {
  try {
    const userInput = req.body.userInput;

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: false,
    });
    const initialMessage = `Provide a list of 10 songs related to ${userInput} without any rankings or specific order. Simply provide the names of the songs without including the names of the artists.`;
    
    // openai call
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: initialMessage,
        },
      ],
    });
    
    // gets content from openai
    const list = chatCompletion.choices[0].message.content || "";
    
    // Process the list as needed
    // Assuming list is in the format '1. Show Me Love\n2. Finally\n3. Your Love\n...'
    const gptList = list
      .split("\n")
      .map((song) => song.replace(/\d+\./, "").trim());
    
    // Filter out empty strings or strings that only contain whitespaces
    const filteredList = gptList.filter((song) => song !== "");
    
    res.json({ gptList: filteredList });
  } catch (error) {
    console.error('Error processing OpenAI Response', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export const handler = serverless(app);
