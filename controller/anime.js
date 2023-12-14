import {Router} from 'express';
import {filterAnime, getAnimeById, getEpisodeLink, searchByPhrase} from "../service/anime.js";

const router = new Router();

router.get('/filter', async (req, res, next) => {
  let { genre, releaseYear, type, status, pageSize, nextKey } = req.query || {};
  if (pageSize) pageSize = Number(pageSize);
  try {
    const response = await filterAnime({ genre, releaseYear, type, status, pageSize, nextKey });
    if (response) {
      res.send(response);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get('/episode/:episodeId', async (req, res, next) => {
  const { episodeId } = req.params || {};

  try {
    const episode = await getEpisodeLink(episodeId);
    if (episode) {
      res.send(episode);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get('/:animeId', async (req, res, next) => {

  const { animeId } = req.params || {};
  try {
    const anime = await getAnimeById(animeId);
    if (anime) {
      res.send(anime);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get('/search/:searchString', async (req, res, next) => {
  const { searchString } = req.params || {};
  let { pageSize, nextKey } = req.query || {}
  if (pageSize) pageSize = Number(pageSize);
  try {
    const response = await searchByPhrase({ searchString, pageSize, nextKey });
    if (response) {
      res.send(response);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});


export default router;
