import express from 'express';
import cors from 'cors';
import anime from "./controller/anime.js";
import {getMongoClient} from "./helpers/mongo.js";
import {initUrls} from "./initUrls.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: '*'
}));

app.use('/anime', anime);

app.get('/', (req, res) => {
  res.send('Hello World');
});

getMongoClient()
  .catch(err => console.error(err.stack))
  .then(async db => {
    app.locals.db = db;

    try {
      await initUrls();
    } catch (err) {
      console.log("Err while init url:");
      console.log(err);
    }

    app.listen(port, () => {
      console.log(`Node.js app is listening at http://localhost:${port}`);
    });
  });


export function getDB(schema) {
  return app.locals.db.db(schema);
}
