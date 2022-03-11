import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { AppConfigClient, 
  GetHostedConfigurationVersionCommand,
  GetHostedConfigurationVersionCommandInput } from '@aws-sdk/client-appconfig';
import axios from 'axios';

const appconfigclient = new AppConfigClient({
  credentials: {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID !== undefined) ? process.env.AWS_ACCESS_KEY_ID : '',
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY !== undefined) ? process.env.AWS_SECRET_ACCESS_KEY : '',
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

console.log('process.env.AWS_ACCESS_KEY_ID ' + process.env.AWS_ACCESS_KEY_ID)
console.log('process.env.AWS_SECRET_ACCESS_KEY ' + process.env.AWS_SECRET_ACCESS_KEY)
console.log('process.env.AWS_SESSION_TOKEN ' + process.env.AWS_SESSION_TOKEN)

export const handler = async(event: SQSEvent) => {

  console.log('process.env.APPCONFIG_APP_ID ' + process.env.APPCONFIG_APP_ID)
  console.log('process.env.CONFIGURATION_PROFILE_ID ' + process.env.CONFIGURATION_PROFILE_ID)
  console.log('process.env.HOSTED_VERSION ' + process.env.HOSTED_VERSION)

  let url = 'http://localhost:2772/applications/basic-application/environments/dev/configurations/basic-configuration-profile'
  let configData = await axios.get(url);
  console.log(configData);

  const input: GetHostedConfigurationVersionCommandInput = {
    ApplicationId: process.env.APPCONFIG_APP_ID,
    ConfigurationProfileId: process.env.CONFIGURATION_PROFILE_ID,
    VersionNumber: parseInt((process.env.HOSTED_VERSION !== undefined) ? process.env.HOSTED_VERSION : '')
  }
  const command = new GetHostedConfigurationVersionCommand(input);
  const response = await appconfigclient.send(command);

  const appconfigData = JSON.parse(String.fromCharCode(...(response.Content !== undefined) ? response.Content : []));

  let { sqsurl } = appconfigData;

  let batchItemFailures: SQSBatchItemFailure[] = [];
  let msgToProcess: SQSBatchResponse = {
    batchItemFailures: batchItemFailures,
  };

  for (const item of event.Records) {
    let result = await axios.post(sqsurl);
    if (result.status === 200) {
      console.log('msg: ' + item.messageId);
    } else {
      let itemError: SQSBatchItemFailure = {
        itemIdentifier: item.messageId,
      };
      msgToProcess.batchItemFailures.push(itemError);
    }
  }
  
  return msgToProcess
}