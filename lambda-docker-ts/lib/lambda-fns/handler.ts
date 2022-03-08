// handler.ts
import { APIGatewayProxyEvent } from 'aws-lambda';

export const run = async (event: APIGatewayProxyEvent) => {
  console.log(event);
  return {
    statusCode: 200,
    body: 'ok',
  };
};
