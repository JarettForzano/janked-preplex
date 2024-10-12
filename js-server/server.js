import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import runResearchAssistant from './api/live-agent.js';

const app = express();
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



app.get('/', (req, res) => {
  res.send('Server is running!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});