const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'fontend')));

app.get('/canvas', (req, res) => {
  res.sendFile(path.join(__dirname, 'fontend', 'canvas', 'canvas.html'));
});

app.post('/api/add-vertex', (req, res) => {
  console.log(req)
})

app.post('/api/delete-vertex', (req, res) => {
  console.log(req)
})

app.post('/api/update-vertex', (req, res) => {
  console.log(req)
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});