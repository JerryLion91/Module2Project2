import express from 'express';
import { promises as fs } from 'fs';
import gradesRouter from './routes/grades.js';

const { writeFile, readFile } = fs;

const app = express();
app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(3000, async () => {
  try {
    await readFile('grades.json');
    console.log('API grades started');
  } catch (err) {
    console.error(err);
  }
});
