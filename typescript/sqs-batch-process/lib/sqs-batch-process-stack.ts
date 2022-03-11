import { join } from 'path';
import { Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class SqsBatchProcessStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const deadletterqueue = new Queue(this, 'DeadLetterQueue', {
      queueName: 'DeadLetterQueue',
    });
    const queue = new Queue(this, 'BatchProcessQueue', {
      queueName: 'BatchProcessQueue',
      visibilityTimeout: Duration.minutes(1),
      deadLetterQueue: {
        queue: deadletterqueue,
        maxReceiveCount: 1,
      },
    });

    const lambdaSender = new NodejsFunction(this, 'LambdaSender', {
      functionName: 'LambdaSQSSender',
      entry: join(__dirname, './lambda-fns/sender.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
      bundling: {
        minify: true,
      }
    });
    queue.grantSendMessages(lambdaSender);

    const lambdaConsumer = new NodejsFunction(this, 'LambdaConsumer', {
      functionName: 'LambdaSQSConsumer',
      entry: join(__dirname, './lambda-fns/consumer.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      environment: {
        'APPCONFIG_APP_ID': Fn.importValue('appconfig-application-id'),
        'CONFIGURATION_PROFILE_ID': Fn.importValue('appconfig-configuration-profile-id'),
        'HOSTED_VERSION': Fn.importValue('appconfig-hosted-version')
      },
      bundling: {
        minify: true,
      }
    });
    queue.grantConsumeMessages(lambdaConsumer);
    const sqsEventSource = new SqsEventSource(queue, { 
      reportBatchItemFailures: true 
    });
    lambdaConsumer.addEventSource(sqsEventSource);

    const appconfigPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'appconfig:GetHostedConfigurationVersion',
        'appconfig:GetConfiguration',
      ],
      resources: ['*'],
    });
    lambdaConsumer.addToRolePolicy(appconfigPolicy);
  }
}
