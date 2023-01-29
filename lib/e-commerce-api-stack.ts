import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cwLogs from "aws-cdk-lib/aws-logs";

interface ECommerceAPIStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJS.NodejsFunction;
  productsAdminHandler: lambdaNodeJS.NodejsFunction;
}

export class ECommerceAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ECommerceAPIStackProps) {
    super(scope, id, props);

    const logGroup = new cwLogs.LogGroup(this, "e-commerce-api-logs");
    const api = new apigateway.RestApi(this, "e-commerce-api", {
      cloudWatchRole: true,
      restApiName: "e-commerce-api",
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true,
        }),
      },
    });

    const productsFetchIntegration = new apigateway.LambdaIntegration(
      props.productsFetchHandler
    );

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", productsFetchIntegration);

    const productIdResource = productsResource.addResource("{id}")
    productIdResource.addMethod("GET", productsFetchIntegration);


    const productsAdminIntegration = new apigateway.LambdaIntegration(
      props.productsAdminHandler
    );

    productsResource.addMethod("POST", productsAdminIntegration);

    productIdResource.addMethod("PUT", productsAdminIntegration);
    
    productIdResource.addMethod("DELETE", productsAdminIntegration);
  }
}
