import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import path from "path";

const app = express();

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.get('/api/quiz', async (req, res) => {
  try {
    console.log("Request received to fetch quiz data");
    const response = await axios.get('https://api.jsonserve.com/Uw5CrX');
    console.log("Response received from external API");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching quiz data:", error.message);
    res.status(500).json({ error: 'Failed to fetch quiz data' });
  }
});


if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log('Server is listening on PORT:', PORT);
});