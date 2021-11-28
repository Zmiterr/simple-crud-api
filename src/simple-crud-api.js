const http = require('http');
require('dotenv').config();
const { validate, v4: uuidv4 } = require('uuid');
let persons = require('./persons');
const validateParams = require('./validate-params');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-type': 'application/json',
  });

  const path = req.url.split('/');
  const personIdParam = path[path.indexOf('person') + 1];

  const sendRequestError = (code, errorMessage) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorMessage, null, 2));
  };

  if ((req.url === '/person' || req.url === '/person/') && req.method === 'GET') {
    try {
      // throw new Error('This is 500 error');
      res.end(JSON.stringify(persons));
    } catch (error) {
      sendRequestError(500, `Error execution ${error}`);
    }
  } else if (req.url.match(/\/person\/\w+/) && req.method === 'GET') {
    try {
      if (validate(personIdParam)) {
        const editedPerson = persons.filter((person) => person.id === personIdParam);
        if (editedPerson[0]) {
          const selectedPerson = persons.filter((person) => person.id === personIdParam);
          res.end(JSON.stringify(selectedPerson[0]));
        } else {
          sendRequestError(404, 'ID not found');
        }
      } else {
        const message = 'invalid ID';
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message, null, 2));
      }
    } catch (error) {
      sendRequestError(500, `Error execution ${error}`);
    }
  } else if ((req.url === '/person' || req.url === '/person/') && req.method === 'POST') {
    try {
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
          sendRequestError(400, validatedUser.message);
        }
      });
    } catch (error) {
      sendRequestError(500, `Error execution ${error}`);
    }
  } else if (req.url.match(/\/person\/\w+/) && req.method === 'PUT') {
    try {
      req.on('data', (data) => {
        const { name, age, hobbies } = JSON.parse(data);
        const validatedUser = validateParams(name, age, hobbies);

        const id = String(personIdParam);
        if (validate(id)) {
          if (!(validatedUser.valid)) {
            sendRequestError(400, validatedUser.message);
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
              sendRequestError(404, 'ID not found');
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id, ...editedPerson[0] }, null, 2));
          }
        } else {
          sendRequestError(400, 'wrong or empty id parameter!');
        }
      });
    } catch (error) {
      sendRequestError(500, `Error execution ${error}`);
    }
  } else if (req.url.match(/\/person\/\w+/) && req.method === 'DELETE') {
    try {
      const delId = String(personIdParam);
      if (!delId) {
        sendRequestError(400, 'no query parameter!');
      }
      if (validate(delId)) {
        const editedPerson = persons.filter((person) => person.id === delId);
        if (editedPerson[0]) {
          persons = persons.filter((person) => person.id !== delId);
        } else {
          sendRequestError(404, 'ID not found');
        }
        res.writeHead(204, { 'Content-Type': 'application/json' });
        res.end();
      } else {
        sendRequestError(400, 'invalid ID');
      }
    } catch (error) {
      sendRequestError(500, `Error execution ${error}`);
    }
  } else {
    sendRequestError(404, `Error 404:  ${req.url} not found`);
  }
});

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`server started on port ${PORT}`));
