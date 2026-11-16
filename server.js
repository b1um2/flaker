const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.redirect('/canvas/');
});

app.get('/canvas', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'canvas', 'canvas.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
