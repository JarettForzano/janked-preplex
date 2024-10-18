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
import { createClient } from "@deepgram/sdk";

const PORT = 4000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(DEEPGRAM_API_KEY);

app.use(cors()); 

app.use(cors({
  origin: 'http://localhost:5173',
}));

const deepgramWss = new WebSocketServer({ server, path: '/deepgram' });

deepgramWss.on('connection', (ws) => {
  console.log('Client connected to Deepgram WebSocket');

  const deepgramLive = deepgram.transcription.live({
    punctuate: true,
    interim_results: true,
    encoding: 'linear16',
    sample_rate: 16000,
    language: 'en-US',
  });

  deepgramLive.addListener('open', () => {
    console.log('Deepgram live transcription connection opened');
  });

  deepgramLive.addListener('transcriptReceived', (dgResponse) => {
    const { channel } = dgResponse;
    const { alternatives } = channel;
    const { transcript } = alternatives[0];

    if (transcript) {
      console.log('Transcript:', transcript);
      // Send the transcript back to the client
      ws.send(JSON.stringify({ transcript }));
    }
  });

  deepgramLive.addListener('close', () => {
    console.log('Deepgram live transcription connection closed');
  });

  deepgramLive.addListener('error', (error) => {
    console.error('Deepgram live transcription error:', error);
  });

  ws.on('message', (message) => {
    if (Buffer.isBuffer(message)) {
      // Forward audio data to Deepgram
      deepgramLive.send(message);
    } else {
      console.error('Received non-binary message');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from Deepgram WebSocket');
    deepgramLive.finish();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    deepgramLive.finish();
  });
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    console.log(`Received message => ${message}`);
    const data = JSON.parse(message);
    const query = data.query;
    const fileText = data.fileText;

    try {
      // Start the agent and stream the responses
      await runResearchAssistant(query, ws, fileText);
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