import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

export interface AppConfigUrlAccessConstructProps {
  readonly appId: string;
  readonly envId: string;
  readonly confgId: string;
}

export class AppConfigUrlAccessConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: AppConfigUrlAccessConstructProps) {
    super(scope, id);

    const appconfigArn = 'arn:aws:lambda:us-east-1:027255383542:layer:AWS-AppConfig-Extension:61';
    const layer = LayerVersion.fromLayerVersionArn(this, 'AppConfigLayer', appconfigArn);
    
    const lambda = new NodejsFunction(this, 'AppConfigUrlLambda', {
      entry: join(__dirname, './lambda-fns/url.ts'),
      functionName: 'AppConfigUrlLambda',
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      environment: {
        'AWS_APPCONFIG_EXTENSION_POLL_INTERVAL_SECONDS': '45',
        'AWS_APPCONFIG_EXTENSION_POLL_TIMEOUT_MILLIS': '3000',
        'AWS_APPCONFIG_EXTENSION_HTTP_PORT': '2772',
        'APPCONFIG_APP': (props?.appId !== undefined) ? props?.appId : '',
        'APPCONFIG_ENV': (props?.envId !== undefined) ? props?.envId : '',
        'APPCONFIG_CONFIG': (props?.confgId !== undefined) ? props?.confgId : '',

      },
      layers: [layer],
      bundling: {
        minify: true,
      },
    });

    const appconfigPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'appconfig:StartConfigurationSession',
        'appconfig:GetLatestConfiguration',
      ],
      resources: ['*'],
    });
    lambda.addToRolePolicy(appconfigPolicy);
  }
}