import { scrapeM3U8 } from './anime_parser.js';
import DB from '../db.js';
import { mongoClient } from '../helpers/mongo.js';
import { getISTTime } from '../utils.js';
import { MAX_EPISODE_RETRY } from '../initUrls.js';
import { ObjectId } from 'mongodb';

export default async ([animeTitle, animeObjId, episodeId, episodeNum, throwIfErr]) => {
 try {
  const { m3u8, animeId } = await scrapeM3U8({ id: episodeId });
  const savedEpisode =
   await mongoClient.db(DB.SCHEMA.BUSINESS).collection(DB.COLLECTION.EPISODE).updateOne({
     episodeId: episodeId
    },
    {
     $set: {
      animeObjId: animeObjId,
      animeId,
      m3u8,
      episodeId: episodeId,
      lastModifiedDate: getISTTime()
     },
     $setOnInsert: {
      createdDate: getISTTime()
     }
    }, { upsert: true });
  console.log('processed: ' + animeTitle + ' episode: ' + episodeId + ' animeObjId: ' + animeObjId);
  return 1;
 } catch (err) {
  if (throwIfErr) {
   throw err;
  }
  const savedErr =
   await mongoClient.db(DB.SCHEMA.BUSINESS).collection(DB.COLLECTION.EPISODE_ERR).findOneAndUpdate({ 'episodeId': episodeId }, {
    $set: {
     'animeObjId': animeObjId,
     'episodeId': episodeId,
     lastModifiedDate: getISTTime()
    },
    $setOnInsert: {
     createdDate: getISTTime()
    },
    $inc: {
     'retried': 1
    },
    $push: {
     logs: {
      err: JSON.stringify(err),
      createdDate: getISTTime()
     }
    }
   }, { upsert: true });

  const { retried = 0 } = savedErr.value || {};
  if (retried >= MAX_EPISODE_RETRY) {

   const query = { '_id': new ObjectId(animeObjId) };
   const update = {
    $set: {
     'episodesList.$[elem].isActive': false
    }
   };
   const options = {
    arrayFilters: [
     { 'elem.episodeId': episodeId }
    ]
   };

   const updatedAnimeResp =
    await mongoClient.db(DB.SCHEMA.BUSINESS).collection(DB.COLLECTION.ANIME).updateOne(query, update, options);
  }
  console.log('failed: ' + animeTitle + ' episode: ' + episodeId + ' animeObjId: ' + animeObjId);
 }
};
