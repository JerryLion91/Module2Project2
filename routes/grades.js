import express from 'express';
import { promises as fs } from 'fs';

const { writeFile, readFile } = fs;

const router = express.Router();

/**
 * 1. Create a new grade:
 * consume [student, subject, type, value] add ID++, timestamp
 * return grade obj created
 {
   "id": 1,
   "student": "Loiane Groner",
   "subject": "01 - JavaScript",
   "type": "Fórum",
   "value": 15,
   "timestamp": "2020-05-19T18:21:24.958Z"
 }
 */
router.post('/', async (req, res, next) => {
  try {
    let newGrade = req.body;
    const data = JSON.parse(await readFile('./grades.json'));
    newGrade = {
      id: data.nextId++,
      student: newGrade.student,
      subject: newGrade.subject,
      type: newGrade.type,
      value: newGrade.value,
      timestamp: new Date(),
    };
    data.grades.push(newGrade);
    await writeFile('./grades.json', JSON.stringify(data, null, 2));
    res.send(newGrade);
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Update a grade
 * consume [id, student, subject, type, value]
 * validade id grade exists, return error if doent exists
 {
   "id": 1,
   "student": "Loiane Groner",
   "subject": "01 - JavaScript",
   "type": "Fórum",
   "value": 15
 }
 */
router.put('/', async (req, res, next) => {
  try {
    let newGrade = req.body;
    const data = JSON.parse(await readFile('./grades.json'));
    const gradeIndex = data.grades.findIndex((grade) => {
      // sempre preencher base do parseInt(string,base);
      return grade.id === parseInt(req.query.id, 10);
    });
    if (gradeIndex === -1) {
      throw new Error('Id nao encontrado');
    }
    // fazer a verificacao individual da presenca de cada campo evita bagunca no dataBank
    newGrade = {
      id: newGrade.id,
      student: newGrade.student,
      subject: newGrade.subject,
      type: newGrade.type,
      value: newGrade.value,
      timestamp: new Date(),
    };
    data.grades[gradeIndex] = newGrade;

    await writeFile('./grades.json', JSON.stringify(data, null, 2));
    res.send(newGrade);
  } catch (err) {
    next(err);
  }
});

/**
 * 3. Delete grade
 * consume [id]
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile('./grades.json'));
    const gradeIndex = data.grades.findIndex((grade) => {
      // sempre preencher base do parseInt(string,base);
      return grade.id === parseInt(req.query.id, 10);
    });
    if (gradeIndex === -1) {
      throw new Error('Id nao encontrado');
    }
    // another way to remove is using arr.filter();
    data.grades.splice(gradeIndex, 1);
    await writeFile('./grades.json', JSON.stringify(data, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
});

/**
 * 4. Get grade
 * consume [id]
 * return grade obj
 */
router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile('./grades.json'));
    const grade = data.grades.find((grade) => {
      // sempre preencher base do parseInt(string,base);
      return grade.id === parseInt(req.query.id, 10);
    });
    if (!grade) {
      throw new Error('Id nao encontrado');
    }
    res.send(grade);
  } catch (err) {
    next(err);
  }
});

/**
 * 5. Get total student grades
 * consume [student, subject]
 * return sum(value)
 */
router.get('/total', async (req, res, next) => {
  // metodo 'GET' nao deveria usar body, e sim url
  // para usar body, o metedo deveria ser 'POST'
  try {
    const filterValues = req.body;
    const data = JSON.parse(await readFile('./grades.json'));
    data.grades = data.grades.filter(({ student, subject }) => {
      return (
        filterValues.student === student && filterValues.subject === subject
      );
    });
    const totalGrade = data.grades.reduce((acc, grade) => {
      return acc + parseInt(grade.value, 10);
    }, 0);
    // poderia retornar um JSON com um atributo "total":
    // res.send({totalGrade});
    res.send(`${totalGrade}`);
  } catch (err) {
    next(err);
  }
});

/**
 * 6. Get average grade
 * consume [subject, type]
 * return sum(value)/length
 */
router.get('/average', async (req, res, next) => {
  // metodo 'GET' nao deveria usar body, e sim url
  // para usar body, o metedo deveria ser 'POST'
  try {
    const filterValues = req.body;
    const data = JSON.parse(await readFile('./grades.json'));
    data.grades = data.grades.filter(({ subject, type }) => {
      return filterValues.subject === subject && filterValues.type === type;
    });
    // if(!data.grades.length) poderia retornar o erro por nao encontrar nada
    const averageGrade =
      data.grades.reduce((acc, grade) => {
        return acc + parseInt(grade.value, 10);
      }, 0) / data.grades.length;

    // poderia retornar um JSON com um atributo "total":
    // res.send({averageGrade});
    res.send(`${averageGrade}`);
  } catch (err) {
    next(err);
  }
});

/**
 * 7. Get top 3
 * consume [subject, type]
 * return top > 3 grades
 */
router.get('/top3', async (req, res, next) => {
  // metodo 'GET' nao deveria usar body, e sim url
  // para usar body, o metedo deveria ser 'POST'
  try {
    const filterValues = req.body;
    const data = JSON.parse(await readFile('./grades.json'));
    delete data.nextId;
    data.grades = data.grades
      .filter(({ subject, type }) => {
        return filterValues.subject === subject && filterValues.type === type;
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    // if(!data.grades.length) poderia retornar o erro por nao encontrar nada
    res.send(data);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  res.status(400).send({ error: err.message });
});

export default router;
