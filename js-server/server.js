import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import runResearchAssistant from './api/live-agent.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = 4000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors()); 

app.use(cors({
  origin: 'http://localhost:3000',
}));

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    console.log(`Received message => ${message}`);
    const data = JSON.parse(message);
    const query = data.query;

    try {
      // Start the agent and stream the responses
      await runResearchAssistant(query, ws);
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', content: error.message }));
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Check if the file is a text file
    if (path.extname(file.originalname) !== '.txt') {
      return res.status(400).send('Only .txt files are allowed.');
    }

    // Read the file content
    const fileContent = fs.readFileSync(file.path, 'utf-8');

    // Clean up the uploaded file
    fs.unlinkSync(file.path);

    // Return the file content
    res.json({ text: fileContent });
  } catch (error) {
    console.error('Error processing file upload:', error);
    res.status(500).send('Internal server error.');
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});