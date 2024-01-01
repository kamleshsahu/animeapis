import {getDB} from '../app.js'
import DB from '../db.js';
import {ObjectId} from "mongodb";
import {inCond, orCond} from "../common/util.js";

export const getAnimeById = async (id) => {
  const db = getDB(DB.SCHEMA.BUSINESS);
  const anime = await db.collection(DB.COLLECTION.ANIME).findOne({ animeId: id });
  return anime;
};

export const filterAnime = async (params) => {
  const { genre, releaseYear, type, status, pageSize = 10, nextKey } = params;
  const query = {};
  const sort = {
    releasedDate: -1,
    id: 1
  };
  if (genre) {
    query.genres = inCond(genre);
  }

  if (releaseYear) {
    query.releasedDate = releaseYear;
  }
  const andArr = [];
  if (type) {
    andArr.push(orCond("type", type));
  }
  if (status) {
    andArr.push(orCond("status", status));
  }

  if (andArr.length > 0) {
    query.$and = andArr;
  }

  if (nextKey) {
    query._id = { $gt: new ObjectId(nextKey) }
  }
  const db = getDB(DB.SCHEMA.BUSINESS);
  const animeList = await db.collection(DB.COLLECTION.ANIME)
    .find(query)
    .sort(sort)
    .project({
      episodesList: false,
    })
    .limit(pageSize)
    .toArray();

  const response = { animeList }
  if (animeList && animeList.length === pageSize) {
    response.nextKey = animeList[animeList.length - 1]._id.toHexString();
  }

  return response;
};

export const getEpisodeLink = async (episodeId) => {
  const db = getDB(DB.SCHEMA.BUSINESS);
  const episode = await db.collection(DB.COLLECTION.EPISODE).findOne({ episodeId });
  return episode;
};


export const searchByPhrase = async (params) => {
  const { searchString, pageSize = 10 } = params;

  const pipeline = [
    {
      $search: {
        index: "animesearch",
        compound: {
          should: [
            {
              phrase: {
                query: searchString,
                path: "animeTitle",
              },
            },
            {
              phrase: {
                query: searchString,
                path: "otherNames",
              },
            },
          ],
        },
      },
    },
    {
      $addFields: {
        length: {
          $min: [
            {
              $strLenCP: "$animeTitle",
            },
            {
              $strLenCP: "$otherNames",
            },
          ],
        },
      },
    },
    {
      $sort: {
        length: 1, // Sort in ascending order (shortest string first)
      },
    },
    {
      $limit: pageSize,
    },
  ]
  const db = getDB(DB.SCHEMA.BUSINESS);
  const animeList = await db.collection(DB.COLLECTION.ANIME).aggregate(pipeline)
    .project({
      episodesList: false
    })
    .toArray();

  const response = { animeList }
  return response;
};
