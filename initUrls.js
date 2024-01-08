import { mongoClient } from './helpers/mongo.js';
import DB from './db.js';

export let ANIME_DETAIL_URL = 'https://gogoanime3.net/category/';
export let M3U8_URL = 'https://gogoanime3.net/';
const ajax_url = 'https://ajax.gogo-load.com/';
export let RECENT_RELEASE_URL = `${ajax_url}ajax/page-recent-release.html`;
export let MAX_EPISODE_RETRY = 1;
export let MAX_ANIME_RETRY = 2;


export const initUrls = async () => {
 const urls = await mongoClient.db(DB.SCHEMA.BUSINESS).collection(DB.COLLECTION.GOGO_URLS).findOne();
 const {
  anime,
  m3u8,
  recentRelease,
  maxEpisodeRetry,
  maxAnimeRetry,
 } = urls;

 ANIME_DETAIL_URL = anime;
 M3U8_URL = m3u8;
 RECENT_RELEASE_URL = recentRelease;
 MAX_EPISODE_RETRY = maxEpisodeRetry || 3;
 MAX_ANIME_RETRY = maxAnimeRetry || 3;
 return;
};
