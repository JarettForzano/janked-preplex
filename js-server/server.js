require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 4000;

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/search', (req, res) => {
  const { query } = req.body;
  console.log(query);
  res.send(`Search request received ${query}`);
});