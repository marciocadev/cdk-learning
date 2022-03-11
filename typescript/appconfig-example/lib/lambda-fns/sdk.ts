import { AppConfigClient, 
  GetHostedConfigurationVersionCommand,
  GetHostedConfigurationVersionCommandInput } from '@aws-sdk/client-appconfig';

const appconfigclient = new AppConfigClient({
  credentials: {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID !== undefined) ? process.env.AWS_ACCESS_KEY_ID : '',
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY !== undefined) ? process.env.AWS_SECRET_ACCESS_KEY : '',
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

export const handler = async() => {
  const input: GetHostedConfigurationVersionCommandInput = {
    ApplicationId: process.env.APPCONFIG_APP,
    ConfigurationProfileId: process.env.APPCONFIG_CONFIG,
    VersionNumber: parseInt((process.env.APPCONFIG_HOSTED !== undefined) ? process.env.APPCONFIG_HOSTED : '')
  }
  const command = new GetHostedConfigurationVersionCommand(input);
  const response = await appconfigclient.send(command);

  const appconfigData = JSON.parse(String.fromCharCode(...(response.Content !== undefined) ? response.Content : []));
  console.log(appconfigData);
}