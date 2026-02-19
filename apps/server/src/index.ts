import express from 'express';
import cors from 'cors';
// Create Express app
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).send('Worldmaker Server is running!');
});

app.get('/hello', (req, res) => {
  res.status(200).send('hello monorepo!');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

export default app;
