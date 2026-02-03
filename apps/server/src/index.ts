import express from 'express';
// Create Express app

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Worldmaker Server is running!');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

export default app;
