const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
res.sendFile(__dirname + '/views/index.html');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});
