import express from 'express';

const app = express();
const port = 4002;

app.get('/me', (req, res) => {
  res.json({
    id: '1',
    username: '@ava',
  });
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
