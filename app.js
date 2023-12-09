import express from 'express';
import {MongoClient} from 'mongodb';
import config from "./config.js";
import anime from "./controller/anime.js";

const app = express();
const port = process.env.PORT || 8000;

app.use('/anime', anime);

app.get('/', (req, res) => {
  res.send('Hello World');
});

MongoClient.connect(config.database.url)
  .catch(err => console.error(err.stack))
  .then(db => {
    app.locals.db = db;
    app.listen(port, () => {
      console.log(`Node.js app is listening at http://localhost:${port}`);
    });
  });


export function getDB(schema) {
  return app.locals.db.db(schema);
}
