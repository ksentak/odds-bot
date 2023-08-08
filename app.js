import axios from 'axios';
import { DateTime, Duration } from 'luxon';
import 'dotenv/config';

const apiKey = process.env.ODDS_API_KEY;

const getNFLWeek = (currentDate) => {
  const startDate = DateTime.fromISO('2023-09-07');
  const endDate = DateTime.fromISO(currentDate);
  const duration = Duration.fromMillis(endDate.diff(startDate).valueOf());
  const daysPassed = duration.as('days');
  return Math.ceil(daysPassed / 7);
};

// 

const x = getNFLWeek(DateTime.now().toISODate());
console.log(x);

const filterGamesForTheWeek = (data) => {
  const currentWeek = getNFLWeek(DateTime.now().toISODate());
  const startOfWeek = DateTime.fromISO('2023-09-08').plus({
    days: (currentWeek - 1) * 7,
  });
  const endOfWeek = startOfWeek.plus({ days: 6 });

  return data.filter((game) => {
    const gameDate = DateTime.fromISO(game.commence_time);
    return gameDate >= startOfWeek && gameDate <= endOfWeek;
  });
};

// Add JSDoc
const getOdds = async () => {
  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american&bookmakers=draftkings&markets=h2h,spreads,totals&apiKey=${apiKey}`;

  try {
    const res = await axios.get(url);
    console.log('Remaing requests: ', res.headers['x-requests-remaining']);
    const dataArr = res.data;
    return dataArr;
  } catch (err) {
    console.error(err);
  }
};

// Function to format odds
const formatMsg = (data) => {
  let formattedMsg = '';

  data.forEach((game) => {
    const awayTeam = game.away_team;
    const homeTeam = game.home_team;
    const commenceTime = game.commence_time;

    let h2h = '';
    let spreads = '';

    const draftKings = game.bookmakers.find((b) => b.key === 'draftkings');
    if (draftKings) {
      const h2hMarket = draftKings.markets.find((m) => m.key === 'h2h');
      if (h2hMarket) {
        h2h = `${h2hMarket.outcomes[0].name} ${h2hMarket.outcomes[0].price} | ${h2hMarket.outcomes[1].name} ${h2hMarket.outcomes[1].price}`;
      }

      const spreadMarket = draftKings.markets.find((m) => m.key === 'spreads');
      if (spreadMarket) {
        spreads = `${spreadMarket.outcomes[0].name} ${spreadMarket.outcomes[0].point} (${spreadMarket.outcomes[0].price}) | ${spreadMarket.outcomes[1].name} ${spreadMarket.outcomes[1].point} (${spreadMarket.outcomes[1].price})`;
      }

      formattedMsg += `
${awayTeam} @ ${homeTeam} - ${commenceTime}
DraftKings - ${draftKings.last_update}
Moneyline 
${h2h}
Spread
${spreads}
===============
      `;
    }
  });

  return formattedMsg;
};

// Add JSDoc
const sendDiscordMsg = async (msg) => {
  const url = process.env.DISCORD_BOT_URL;

  const formattedMsg = {
    content: '```' + msg + '```',
  };

  try {
    const res = await axios.post(url, formattedMsg);
    if (res.status === 204) {
      console.log('Msg send successfully');
    }
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  const rawData = await getOdds();
  const filteredData = await filterGamesForTheWeek(rawData);
  console.log(filteredData);
  const formattedMsg = await formatMsg(filteredData);
  console.log('==========YUP==========');
  console.log(formattedMsg);
  // sendDiscordMsg(formattedMsg);
};

// main();
