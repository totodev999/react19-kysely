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
  const { content } = req.body;
  let vectorized: any;
  try {
    console.time('vectorize');
    vectorized = await axios.post('http://localhost:8000/vectorize', {
      text: content,
    });
    console.timeEnd('vectorize');
  } catch (e) {
    console.log(e);
    return res.status(500).send('Failed to vectorize');
  }

  const vector = vectorized.data.vector as number[];
  const vectorForDB = '[' + vector + ']';

  console.time('insert');
  // better to delete new lines before inserting.
  const insResult =
    await sql<GetTodos>`INSERT INTO todos (title, content, text_vector) VALUES ('test', ${content}, ${vectorForDB}) RETURNING *`.execute(
      db
    );
  console.timeEnd('insert');

  return res.send(insResult.rows[0]);
});

app.post('/api/to-do/full-text-search', async (req, res) => {
  const { search } = req.body;
  if (!search) {
    return res.status(404).json({ message: 'search text is not set.' });
  }

  const searchLike = `%${search}%`;

  console.time('full-text-search');
  const fullTextSearch = await db.transaction().execute(async (trx) => {
    // forcing to use index. But, still there is possibility to use seq scan.
    // enable_seqscan is just a way to add cost to seq scan.
    // Reference: https://pgpedia.info/e/enable_seqscan.html
    await sql<null>`SET LOCAL enable_seqscan = OFF;`.execute(trx);

    // check if index is used
    // console.log(
    //   await sql<null>`EXPLAIN SELECT * FROM todos WHERE title =% ${searchLike} OR content like ${searchLike};`.execute(
    //     trx
    //   )
    // );

    const res = await trx
      .selectFrom('todos')
      .select(['id', 'title', 'content'])
      .where((eb) =>
        eb.or([
          (eb('title', 'like', searchLike), eb('content', 'like', searchLike)),
        ])
      )
      .execute();
    return res;
  });
  console.timeEnd('full-text-search');

  return res.json(fullTextSearch);
});

app.post('/api/to-do/vector-search', async (req, res) => {
  const { search } = req.body;
  if (!search) {
    return res.status(404).json({ message: 'search text is not set.' });
  }

  let vectorized: any;
  try {
    vectorized = await axios.post('http://localhost:8000/vectorize', {
      text: search,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send('Failed to vectorize');
  }

  const vector = '[' + vectorized.data.vector + ']';

  console.time('vector-search');
  // pg_vector provides 3 ways to evaluate similarity. 1.cosine distance 2.Dot Product 3.Euclidean Distance .
  // For text similarity, cosine distance is most suitable, maybe.
  const result = await sql<
    GetTodos[]
  >`SELECT content, COSINE_DISTANCE(text_vector, ${vector}) AS similarity FROM todos ORDER BY COSINE_DISTANCE(text_vector, ${vector}) LIMIT 10;`.execute(
    db
  );
  console.timeEnd('vector-search');

  return res.json(result.rows);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
