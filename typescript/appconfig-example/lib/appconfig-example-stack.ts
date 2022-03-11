import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppConfigCreateConstruct } from './appconfig-create-construct';
import { AppConfigSDKAccessConstruct } from './appconfig-sdk-access-construct';
import { AppConfigUrlAccessConstruct } from './appconfig-url-access-construct';

export class AppConfigExampleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const appconfig = new AppConfigCreateConstruct(this, 'AppConfigCreate');
    new AppConfigUrlAccessConstruct(this, 'AppConfigUrlTest', {
      appId: appconfig.application.ref,
      envId: appconfig.devEnv.ref,
      confgId: appconfig.confProfile.ref,
    });
    new AppConfigSDKAccessConstruct(this, 'AppConfigSDKTest', {
      appId: appconfig.application.ref,
      confgId: appconfig.confProfile.ref,
      hostedVersionId: appconfig.devHostedConf.ref,
    });
  }
}
