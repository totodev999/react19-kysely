import axios from 'axios';

const url =
  'https://datasets-server.huggingface.co/rows?dataset=fujiki%2Fwiki40b_ja&config=default&split=train';

let baseOffset = 0;
const limit = 100;

const insertFunc = async (offset: number) => {
  console.log(offset);
  const { data } = await axios.get(`${url}&offset=${offset}&length=${limit}`);

  const promises = data.rows.map(async (row: any) => {
    await axios.post('http://localhost:3001/api/to-do', {
      content: row.row.text,
    });
  });

  await Promise.allSettled(promises);
};

const insertData = async () => {
  while (baseOffset < 20000) {
    await insertFunc(baseOffset);
    baseOffset += limit;
  }
};

insertData();
