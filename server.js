const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Nazerke's part "Custom logger middleware (HTTP method + URL)"
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/contact.html'));
});

// Amina's part "returns project information in JSON format"
app.get('/api/info', (req, res) => {
  fs.readFile('project-info.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load project info' });
    }

    res.json(JSON.parse(data));
  });
});


app.post('/contact', (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    time: new Date().toISOString()
  };

  fs.readFile('messages.json', 'utf8', (err, content) => {
    const messages = content ? JSON.parse(content) : [];
    messages.push(data);

    fs.writeFile('messages.json', JSON.stringify(messages, null, 2), () => {
      res.send(`<h2>Thanks, ${data.name}! Your message has been received.</h2>`);
    });
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
