const http = require('http');
require('dotenv').config();
const { validate, v4: uuidv4 } = require('uuid');
let persons = require('./persons');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-type': 'application/json',
  });

  const path = req.url.split('/');
  const personIdParam = path[path.indexOf('person') + 1];

  const validateParams = (name, age, hobbies) => {
    if (!name || !age) {
      const message = { message: 'name and age is required params' };
      return { valid: false, message };
    }
    if (hobbies && !(Array.isArray(hobbies))) {
      const message = { message: 'hobbies must be array' };
      return { valid: false, message };
    }
    const userObject = {
      name: name.toString(),
      age: Number(age),
      hobbies,
    };
    return { valid: true, userObject };
  };

  if (req.url === '/person' && req.method === 'GET') {
    try {
      // throw new Error('This is 500 error');
      res.end(JSON.stringify(persons));
    } catch (error) {
      const message = { message: `Error execution ${error}` };
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    }
  }

  if (req.url.match(/\/person\/\w+/) && req.method === 'GET') {
    try {
      if (validate(personIdParam)) {
        const editedPerson = persons.filter((person) => person.id === personIdParam);
        if (editedPerson[0]) {
          const selectedPerson = persons.filter((person) => person.id === personIdParam);
          res.end(JSON.stringify(selectedPerson[0]));
        } else {
          const message = 'ID not found';
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(message, null, 2));
        }
      } else {
        const message = 'invalid ID';
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message, null, 2));
      }
    } catch (error) {
      const message = { message: `Error execution ${error}` };
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    }
  }

  if (req.url === '/person' && req.method === 'POST') {
    req.on('end', () => {
      const message = { message: 'no title in body request!' };

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    });
    req.on('data', (data) => {
      const { name, age, hobbies } = JSON.parse(data);
      const validatedUser = validateParams(name, age, hobbies);

      if (validatedUser.valid) {
        persons.push({ id: uuidv4(), ...validatedUser.userObject });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(persons[persons.length - 1], null, 2));
      } else {
        // const message = { message: 'no title in body request!' };

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(validatedUser.message, null, 2));
      }
    });
  }
  if (req.url.match(/\/person\/\w+/) && req.method === 'PUT') {
    req.on('data', (data) => {
      const { name, age, hobbies } = JSON.parse(data);
      const validatedUser = validateParams(name, age, hobbies);

      const id = String(personIdParam);
      if (validate(id)) {
        if (!(validatedUser.valid)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(validatedUser.message, null, 2));
        } else {
          const editedPerson = persons.filter((person) => person.id === id);
          if (editedPerson[0]) {
            persons.forEach((person, index) => {
              if (person.id === id) {
                persons[index].name = name;
                persons[index].age = age;
                persons[index].hobbies = hobbies;
              }
            });
          } else {
            const message = 'ID not found';
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(message, null, 2));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id, ...editedPerson[0] }, null, 2));
        }
      } else {
        const message = { message: 'wrong or empty id parameter!' };
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message, null, 2));
      }
    });
  }
  if (req.url.match(/\/person\/\w+/) && req.method === 'DELETE') {
    const delId = String(personIdParam);
    if (!delId) {
      const message = { message: 'no query parameter!' };
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    }
    if (validate(delId)) {
      const editedPerson = persons.filter((person) => person.id === delId);
      if (editedPerson[0]) {
        persons = persons.filter((person) => person.id !== delId);
      } else {
        const message = 'ID not found';
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message, null, 2));
      }
      res.writeHead(204, { 'Content-Type': 'application/json' });
      res.end();
    } else {
      const message = { message: 'empty or invalid ID!' };
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(message, null, 2));
    }
  }
});

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`server started on port ${PORT}`));
