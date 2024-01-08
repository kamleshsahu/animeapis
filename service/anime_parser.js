import axios from 'axios';
import cheerio from 'cheerio';
import {
  generateEncryptAjaxParameters,
  decryptEncryptAjaxResponse
} from '../helpers/extractors/goload.js';
import {USER_AGENT} from '../utils.js';
import {M3U8_URL} from "../initUrls.js";


// export const getUrl = async () => {
//
// }


export const scrapeM3U8 = async ({ id }) => {
  let sources = [];
  let sources_bk = [];
  let animeId;
  try {
    let epPage, server, $, serverUrl;
    if (id) {
      epPage = await axios.get(M3U8_URL + id);
      $ = cheerio.load(epPage.data);
      const animeInfoElement = $('.anime-info');

// Output the result
      if (animeInfoElement.length > 0) {
        // Find the href attribute inside the anime-info element
        const hrefValue = animeInfoElement.find('a').attr('href');

        if (hrefValue) {
          animeId = hrefValue.split('/')[2];
        }
      }
      server = $('#load_anime > div > div > iframe').attr('src');
      serverUrl = new URL(server);
    } else throw Error('Episode id not found');

    const goGoServerPage = await axios.get(serverUrl.href, {
      headers: { 'User-Agent': USER_AGENT }
    });
    const $$ = cheerio.load(goGoServerPage.data);

    const params = await generateEncryptAjaxParameters(
      $$,
      serverUrl.searchParams.get('id')
    );

    const fetchRes = await axios.get(
      `
        ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    const res = decryptEncryptAjaxResponse(fetchRes.data);

    if (!res.source) return { error: 'No sources found!! Try different source.' };

    res.source.forEach((source) => sources.push(source));
    res.source_bk.forEach((source) => sources_bk.push(source));

    return {
      m3u8: {
        Referer: serverUrl.href,
        sources: sources,
        sources_bk: sources_bk
      }, 'animeId': animeId
    };
  } catch (err) {
    throw err;
  }
};
