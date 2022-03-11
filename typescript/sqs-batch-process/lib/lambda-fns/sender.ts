import { SQSClient, SendMessageBatchCommand, SendMessageBatchCommandInput, SendMessageBatchRequestEntry, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';

const sqsclient = new SQSClient({ region: process.env.AWS_REGION });

export const handler = async() => {

  const arr = ['msg1'];
  let listBatchItems = []
  for (const item of arr) {
    let input: SendMessageBatchRequestEntry = {
      Id: item,
      MessageBody: 'Message',
      MessageAttributes : {
        Msg: {
          DataType: 'String',
          StringValue: item
        }
      }
    }
    listBatchItems.push(input);
  }

  const inputBatch: SendMessageBatchCommandInput = {
    Entries: listBatchItems,
    QueueUrl: process.env.QUEUE_URL,
  }
  const command = new SendMessageBatchCommand(inputBatch);
  let data = await sqsclient.send(command);
  console.log(data);
}