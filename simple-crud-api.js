const http = require('http');
const url = require('url');
require('dotenv').config();
const { validate, v4: uuidv4 } = require('uuid');
let persons = require('./persons');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-type': 'application/json',
  });
  // if (req.url === '/') {
  //   res.end(JSON.stringify([{
  //     hello: 'world',
  //   }]));
  // }
  // if (req.url === '/q') {
  //   res.end(JSON.stringify(persons));
  // }
  const argparse = url.parse(req.url, true);

  if (argparse.pathname === '/person  ' && req.method === 'GET') {
    res.end(JSON.stringify(persons));
  }
  if (argparse.pathname === '/person' && req.method === 'POST') {
    req.on('end', () => {
      const message = { message: 'no title in body request!' };

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    });
    req.on('data', (data) => {
      const userData = JSON.parse(data);

      if (userData) {
        persons.push({ id: uuidv4(), ...userData });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(persons, null, 2));
      } else {
        const message = { message: 'no title in body request!' };

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message, null, 2));
      }
    });
  }
  if (argparse.pathname === '/person' && req.method === 'PUT') {
    req.on('data', (data) => {
      const userData = JSON.parse(data);
      if (userData) {
        const { id } = userData;
        if (validate(id)) {
          const jsondata = JSON.parse(data);
          const { name, age, hobbies } = jsondata;

          if (!true) { // TODO add validator function
            const message = { message: 'no title found in body request!' };

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(message, null, 2));
          } else {
            persons.forEach((person, index) => {
              if (person.id === id) {
                persons[index].name = name;
                persons[index].age = age;
                persons[index].hobbies = hobbies;
              }
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(persons, null, 2));
          }
        } else {
          const message = { message: 'wrong or empty id parameter!' };
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(message, null, 2));
        }
      } else {
        const message = { message: 'no query parameter!' };

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message, null, 2));
      }
    });
  }
  if (argparse.pathname === '/person' && req.method === 'DELETE') {
    const delId = '61eb8e5e-b734-4296-98f4-40aec1e6606c'; // TODO get id from query string
    if (validate(delId)) {
      persons = persons.filter((person) => person.id !== delId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(persons, null, 2));
    } else {
      const message = { message: 'no query parameter!' };
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    }
  }
});

server.listen(PORT, () => console.log(`server started on port ${PORT}`));
