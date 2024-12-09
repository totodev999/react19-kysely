import express from 'express';
import cookieParse from 'cookie-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import { db } from './db/database';
import { sql } from 'kysely';
import { GetTodos } from './db/types';

const app = express();
const port = 3001;
dotenv.config();

const cookieSecret = process.env.COOKIE_SECRET;

app.use(express.json());
app.use(cookieParse(cookieSecret));

app.get('/api/login', (req, res) => {
  if (req.signedCookies.test) {
    return res.send('Cookie is signed');
  }
  res.cookie('test', { name: 'test' }, { signed: true });
  res.send('Cookie is set');
});

// app.use((req, res, next) => {
//   if (req.signedCookies.test) {
//     return next();
//   }
//   return res.status(401).send('Unauthorized');
// });

app.post('/api/to-do', async (req, res) => {
  const { title, content } = req.body;
  console.log(title, content);
  const vectorized = await axios.post('http://localhost:8000/vectorize', {
    text: title + content,
  });

  const vector = vectorized.data.vector as number[];
  console.log(
    'vectorized.data.vector',
    Array.isArray(vectorized.data.vector),
    vectorized.data.vector
  );

  const vectorForDB = '[' + vector + ']';

  const insResult =
    await sql<GetTodos>`INSERT INTO todos (title, content, text_vector) VALUES (${title}, ${content}, ${vectorForDB}) RETURNING *`.execute(
      db
    );

  console.log(insResult.rows[0]);
  return res.send(insResult.rows[0]);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
