import * as express from 'express';
import * as awsServerlessExpress from 'aws-serverless-express';
import app from '../../../app';
import { ConversationState, MemoryStorage } from 'botbuilder';
import { SlackAdapter, SlackEventMiddleware } from 'botbuilder-adapter-slack';
import ExampleSlackBot from './simple-slack-bot';

const router = express.Router();
const adapter = new SlackAdapter({
  clientSigningSecret: process.env.CLIENT_SIGNNING_SECRET,
  botToken: process.env.BOT_TOKEN,
  verificationToken: process.env.VERIFICATION_TOKEN,
  redirectUri: '',
});

adapter.use(new SlackEventMiddleware());
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  console.error(`\n [onTurnError]: ${error}`);
  // Send a message to the user
  context.sendActivity(`Oops. Something went wrong!`);
  // Clear out state
  await conversationState.clear(context);
};

const bot = new ExampleSlackBot(adapter);

router.post('/api/messages', function(req, res) {
  if (req.headers['x-slack-retry-reason'] === 'http_timeout') {
    // slackの3秒リトライ時の処理
    res.sendStatus(200);
  } else {
    adapter.processActivity(req, res, async context => {
      await bot.run(context);
    });
  }
});

app.use('/', router);

const server = awsServerlessExpress.createServer(app);
exports.entrypoint = (event, context) =>
  awsServerlessExpress.proxy(server, event, context);
