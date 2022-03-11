import axios from 'axios';

export const handler = async() => {
  const port = process.env.AWS_APPCONFIG_EXTENSION_HTTP_PORT;
  const appId = process.env.APPCONFIG_APP;
  const envId = process.env.APPCONFIG_ENV;
  const confId = process.env.APPCONFIG_CONFIG;
  let url = `http://localhost:${port}/applications/${appId}/environments/${envId}/configurations/${confId}`;
  console.log(url);
  let configData = await axios.get(url);
  console.log(configData.data);
}