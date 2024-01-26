import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Use a single CORS middleware with the specific origin
// app.use(
//   cors({
//     origin: 'https://main.d2dkrnlelmb9rv.amplifyapp.com',
//     methods: 'GET', // Specify the allowed HTTP methods
//   })
// );

app.get('/getOpenAIKey', async (req, res) => {
  try {
    res.json({ OPENAI_API_KEY });
  } catch (error) {
    console.error('Error sending OPENAI_API_KEY', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export const handler = serverless(app);
