const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 6000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-type': 'application/json',
  });
  if (req.url === '/') {
    res.end(JSON.stringify([{
      hello: 'world',
    }]));
  }
  if (req.url === '/q') {
    res.end(JSON.stringify([{
      hello: 'q',
    }]));
  }
});

server.listen(PORT, () => console.log(`server started on port ${PORT}`));
