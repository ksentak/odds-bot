import axios from 'axios';
import 'dotenv/config';

const apiKey = process.env.ODDS_API_KEY;

// Add JSDoc
const getInSeasonSports = async () => {
  const url = `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`;

  try {
    const res = await axios.get(url);
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
};

// Add JSDoc
const getOdds = async () => {
  const apiKey = process.env.ODDS_API_KEY;
  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american&apiKey=${apiKey}`;

  try {
    const res = await axios.get(url);
    console.log(res);
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
};

// Function to format odds
const formatMsg = (msg) => {};

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

getOdds();
