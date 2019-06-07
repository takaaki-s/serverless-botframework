import { TurnContext } from 'botbuilder';
import { SlackAdapter } from 'botbuilder-adapter-slack';

export default class SlackExampleBot {
  protected adapter: SlackAdapter;
  constructor(adapter: SlackAdapter) {
    this.adapter = adapter;
  }
  async run(context: TurnContext) {
    console.log(context.activity);
    if (context.activity.type === 'message') {
      if (context.activity.text === 'delayed') {
        await context.sendActivity('give me 10 seconds....');
        await this.respondDelayed(context);
      } else if (context.activity.text === 'delete') {
        // deleteActivityの引数の型と合わなくてエラーになるので、とりあえずany型で回避
        const outgoing: any = await context.sendActivity(
          'This message will self destruct in a few seconds!'
        );

        // console.log('outgoing id:', outgoing);
        const reference = TurnContext.getConversationReference(context.activity);

        await this.sleep(5);
        await this.adapter.continueConversation(
          reference,
          async new_context => {
            await this.adapter.deleteActivity(new_context, outgoing);
          }
        );
      } else if (context.activity.text === 'update') {
        const outgoing = await context.sendActivity(
          'This message will be updated in a few seconds!'
        );
        // console.log('outgoing id:', outgoing);
        const reference = TurnContext.getConversationReference(context.activity);
        await this.sleep(5);
        await this.adapter.continueConversation(
          reference,
          async new_context => {
            const update = {
              text: 'This has been updated',
              ...outgoing,
            };
            const activity = TurnContext.applyConversationReference(
              update,
              reference
            );
            this.adapter.updateActivity(new_context, activity);
          }
        );
      } else {
        await context.sendActivity({
          text: 'Heard: ' + context.activity.text,
          channelData: {
            attachments: [
              {
                title: 'Options',
                callback_id: '123',
                actions: [
                  {
                    name: 'ok_button',
                    text: 'OK',
                    value: true,
                    type: 'button',
                  },
                ],
              },
            ],
          },
        });
      }
    } else {
      // console.log('EVENT:', context.activity.type);
      if (context.activity.channelData.type === 'interactive_message') {
        const slack = await this.adapter.getAPI(context.activity);
        await slack.dialog.open({
          trigger_id: context.activity.channelData.trigger_id,
          dialog: {
            callback_id: 'ryde-46e2b0',
            title: 'Request a Ride',
            submit_label: 'Request',
            notify_on_cancel: true,
            state: 'Limo',
            elements: [
              {
                type: 'text',
                label: 'Pickup Location',
                name: 'loc_origin',
              },
              {
                type: 'text',
                label: 'Dropoff Location',
                name: 'loc_destination',
              },
            ],
          },
        });
      } else if (context.activity.type === 'dialog_submission') {
        console.log(
          'DIALOG SUBMISSION:',
          context.activity.channelData.submission
        );
      } else if (context.activity.type === 'self_bot_message') {
        console.log('I CAN HEAR MYSELF TALKING!!!');
      }
    }
  }
  sleep = waitSeconds => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, waitSeconds * 1000);
    });
  };

  async respondDelayed(context: TurnContext) {
    const reference = TurnContext.getConversationReference(context.activity);
    await this.sleep(10);
    await this.adapter.continueConversation(reference, async function(
      new_context
    ) {
      // console.log('GOT A NEW CONTEXT');
      await new_context.sendActivity('I waited 10 seconds to tell you this.');
    });
  }
}
