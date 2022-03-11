import { join } from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class LambdaDockerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dockerfile = join(__dirname, './lambda-fns');

    const lambda = new DockerImageFunction(this, 'LambdaDockerFunction', {
      code: DockerImageCode.fromImageAsset(dockerfile),
    });

    const gtw = new RestApi(this, 'LambdaDockerGateway', {
      restApiName: 'lambda-docker-apigateway',
    });

    const integration = new LambdaIntegration(lambda);
    const root = gtw.root;
    root.addMethod('POST', integration);
  }
}
