import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("Key is:", OPENAI_API_KEY)
const PORT = process.env.PORT || 3001;

import express from 'express';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())


app.get('/getOpenAIKey', async (req, res) => {
  try {
    res.json({OPENAI_API_KEY})
    
  } catch (error) {
    console.error('Error sending OPENAI_API_KEY', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});










