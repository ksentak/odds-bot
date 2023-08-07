import axios from 'axios';
import 'dotenv/config';

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
