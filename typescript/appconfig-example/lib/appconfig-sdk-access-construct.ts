import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

export interface AppConfigSDKAccessConstructProps {
  readonly appId: string;
  readonly confgId: string;
  readonly hostedVersionId: string;
}

export class AppConfigSDKAccessConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: AppConfigSDKAccessConstructProps) {
    super(scope, id);

    const lambda = new NodejsFunction(this, 'AppConfigSDKLambda', {
      entry: join(__dirname, './lambda-fns/sdk.ts'),
      functionName: 'AppConfigSDKLambda',
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      environment: {
        'APPCONFIG_APP': (props?.appId !== undefined) ? props?.appId : '',
        'APPCONFIG_CONFIG': (props?.confgId !== undefined) ? props?.confgId : '',
        'APPCONFIG_HOSTED': (props?.hostedVersionId !== undefined) ? props?.hostedVersionId : '',
      },
      bundling: {
        minify: true,
      },
    });

    const appconfigPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['appconfig:GetHostedConfigurationVersion'],
      resources: ['*'],
    });
    lambda.addToRolePolicy(appconfigPolicy);
  }
}