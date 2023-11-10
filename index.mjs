import axios from 'axios';
import { DateTime } from 'luxon';
import { abbreviateTeam, prependPlusSign } from './utils.mjs';
import 'dotenv/config';

const apiKey = process.env.ODDS_API_KEY;
const nflStartDate = process.env.NFL_START_DATE;
const bookmaker = process.env.BOOKMAKER;
const timezone = process.env.TIMEZONE;
const currentDate = DateTime.utc().toISO();

/**
 * Get the NFL week based on a given date
 * @param {DateTime} date The date for which to get the NFL week
 * @returns {number} The NFL week number
 */
const getNFLWeek = (date) => {
  const startDate = nflStartDate;
  const endDate = DateTime.fromISO(startDate).plus({ weeks: 18 }).toISODate();

  if (date < startDate) {
    return 1;
  } else if (date > endDate) {
    return 18;
  }

  let week = 1;
  let currentWeekStart = startDate;
  while (currentWeekStart <= date) {
    if (
      date < DateTime.fromISO(currentWeekStart).plus({ days: 4 }).toISODate()
    ) {
      return week;
    }
    week++;
    currentWeekStart = DateTime.fromISO(currentWeekStart)
      .plus({ days: 7 })
      .toISODate();
  }

  return week;
};

/**
 * Filter the dataset for games within a given NFL week
 * @param {Array} data The dataset to filter
 * @param {number} week The NFL week for which to filter
 * @returns {Array} The filtered dataset
 */
const filterData = (data, week) => {
  const weekStart = DateTime.fromISO(nflStartDate)
    .plus({ weeks: week - 1 })
    .toISODate();
  const weekEnd = DateTime.fromISO(weekStart).plus({ days: 6 }).toISODate();

  return data.filter((game) => {
    const gameDate = game.commence_time;
    return gameDate >= weekStart && gameDate <= weekEnd;
  });
};

/**
 * Fetches odds for NFL games from the Odds API.
 * @async
 * @function
 * @returns {Object[]|undefined} Returns an array of game odds or undefined if there's an error.
 * @throws {Error} Throws an error if unable to fetch data from the API.
 */
const getOdds = async () => {
  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american&bookmakers=${bookmaker}&markets=h2h,spreads,totals&apiKey=${apiKey}`;

  try {
    const res = await axios.get(url);
    console.log('Remaing requests: ', res.headers['x-requests-remaining']);
    const { data } = res;
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Formats the odds data into a human-readable message for each game.
 * @function
 * @param {Array} data - An array of game objects, each containing information about the away and home teams, the commence time, and various betting odds.
 * @returns {string} A formatted message string representing the odds for each game in the input data.
 */
const formatMsg = (data) => {
  let formattedMsg = '';

  data.forEach((game) => {
    const awayTeam = game.away_team;
    const homeTeam = game.home_team;
    const commenceTime = DateTime.fromISO(game.commence_time)
      .setZone(timezone)
      .toFormat('L/dd h:mma');

    let h2h = '';
    let spreads = '';
    let totals = '';

    const selectedBook = game.bookmakers.find((b) => b.key === bookmaker);
    if (selectedBook) {
      const h2hMarket = selectedBook.markets.find(
        (market) => market.key === 'h2h',
      );
      if (h2hMarket) {
        h2h = `${abbreviateTeam(h2hMarket.outcomes[0].name)} ${prependPlusSign(
          h2hMarket.outcomes[0].price,
        )} | ${abbreviateTeam(h2hMarket.outcomes[1].name)} ${prependPlusSign(
          h2hMarket.outcomes[1].price,
        )}`;
      }

      const spreadMarket = selectedBook.markets.find(
        (market) => market.key === 'spreads',
      );
      if (spreadMarket) {
        spreads = `${abbreviateTeam(
          spreadMarket.outcomes[0].name,
        )} ${prependPlusSign(spreadMarket.outcomes[0].point)} (${
          spreadMarket.outcomes[0].price
        }) | ${abbreviateTeam(spreadMarket.outcomes[1].name)} ${prependPlusSign(
          spreadMarket.outcomes[1].point,
        )} (${spreadMarket.outcomes[1].price})`;
      }

      const totalsMarket = selectedBook.markets.find(
        (market) => market.key === 'totals',
      );
      if (totalsMarket) {
        totals = `${totalsMarket.outcomes[0].name} ${totalsMarket.outcomes[0].point} ${totalsMarket.outcomes[0].price} | ${totalsMarket.outcomes[1].name} ${totalsMarket.outcomes[1].point} ${totalsMarket.outcomes[1].price}`;
      }

      formattedMsg +=
        abbreviateTeam(awayTeam) +
        ' @ ' +
        abbreviateTeam(homeTeam) +
        ' - ' +
        commenceTime +
        '\n' +
        spreads +
        '\n' +
        h2h +
        '\n' +
        totals +
        '\n\n';
    }
  });

  return formattedMsg;
};

/**
 * Sends a message to a Discord channel via a bot.
 * @async
 * @function
 * @param {string} msg - The message to be sent to Discord.
 * @returns {void}
 * @throws {Error} Throws an error if unable to send the message to Discord.
 */
const sendDiscordMsg = async (msg) => {
  const url = process.env.DISCORD_BOT_URL;

  const msgObj = {
    content: '```' + msg + '```',
  };

  try {
    const res = await axios.post(url, msgObj);
    if (res.status === 204) {
      console.log('Msg send successfully');
    }
  } catch (err) {
    console.log(err.response.data);
    throw err;
  }
};

export const handler = async () => {
  try {
    const currentWeek = getNFLWeek(currentDate);
    const oddsData = await getOdds();
    const filteredData = filterData(oddsData, currentWeek);
    const formattedMsg = await formatMsg(filteredData);
    await sendDiscordMsg(formattedMsg);
  } catch (err) {
    console.error('Error in handler: ', err.message);
    throw err;
  }
};
