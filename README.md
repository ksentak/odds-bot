# Odds Bot

### Project Structure

This project uses an AWS Lambda function to fetch NFL odds from the `odds-api`, format the fetched data, and then send it to a Discord channel. Here's a breakdown of the main functions:

1. `getNFLWeek(date)`: Determines the NFL week number based on a provided date.

2. `getOdds()`: Makes a call to the Odds API to fetch the odds for NFL games.

3. `filterData(data, week)`: Filters the fetched dataset to include only games for a specified NFL week.

4. `formatMsg(data)`: Transforms the filtered dataset into a human-readable message for each game.

5. `sendDiscordMsg(msg)`: Sends the formatted message to a Discord channel using a bot.

#### Flow

The flow is as follows:

1. Determine the Current NFL Week: The current date is used to find out the NFL week we're in.

2. API Call: A call is made to the Odds API to fetch game odds for the NFL.

3. Data Filtering: The fetched data is filtered to consider only games in the current NFL week.

4. Data Formatting: The filtered data is formatted into a message, making it user-friendly.

5. Send to Discord: The formatted message is then sent to a Discord channel using a bot.

### Environment Variables

Environment variables allow customization of the behavior of the Lambda function. Here are the variables used:

- `ODDS_API_KEY`: Your API key for the `odds-api`. Ensures authenticated and authorized access to the API.

- `NFL_START_DATE`: The start date for the NFL season. Use the date of the first Thursday of the NFL Season. Used to calculate the NFL week for a given date. Ex. `2023-09-07`

- `BOOKMAKER`: Specifies the bookmaker you're interested in when fetching odds. Different bookmakers may offer different odds. Ex. `FanDuel, DraftKings`

- `DISCORD_BOT_URL`: The webhook URL for your Discord bot. This is where the message will be sent.

- `TIMEZONE`: The timezone that game times are formatted for. Ex. `America/New_York`

By changing these variables, you can customize the results that the Lambda function produces.

### Preparing the AWS Lambda Package

Ensure you have all necessary node modules installed. If not, run:

```
npm install
```

Zip up the necessary files:

```
zip -r odds-bot.zip node_modules index.mjs utils.mjs .env
```

The odds-bot.zip file is now ready to be uploaded to AWS Lambda.

### Setting up the AWS Lambda

1. Lambda Creation:

- Navigate to AWS Lambda in the AWS Management Console.
- Click "Create function".
- Select "Author from scratch".
- Name your function and choose the appropriate runtime (e.g., Node.js 20.x).
- Create the function.

2. Upload Code:

- Under the "Function code" section, choose "Upload a .zip file" from the "Code entry type" dropdown.
- Click on "Upload" and select the lambda-upload.zip file you created.
- Click on "Save".

3. Environment Variables:

- Under the "Configuration" tab, go to the "Environment variables" section.
- Add each of the environment variables (ODDS_API_KEY, NFL_START_DATE, BOOKMAKER, DISCORD_BOT_URL).

4. Adjust Timeout:

- In the "Configuration" tab, go to "General configuration".
- Click "Edit" and adjust the timeout based on your needs (e.g., 30 seconds).

### Using AWS CloudWatch Events (Scheduler)

To trigger the Lambda function periodically:

1. Rule Creation:

- Navigate to AWS CloudWatch.
- On the left pane, under "Events", choose "Rules".
- Click on "Create rule".

2. Event Source:

- For "Event Source", choose "Schedule".
- Define the frequency (e.g., every 1 day).

3. Targets:

- Click on "Add target".
- Choose Lambda function as the target and select the function you created.
- Configure other settings as necessary.

4. Create Rule:

- Name your rule, describe it, and click "Create Rule".
- Your Lambda function will now execute based on the schedule you've set up in CloudWatch Events.
