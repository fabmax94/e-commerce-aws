import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynadb from "aws-cdk-lib/aws-dynamodb";

export class ProductsAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;
  readonly productsAdminHandler: lambdaNodeJS.NodejsFunction;
  readonly productsDdb: dynadb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.productsDdb = new dynadb.Table(this, "products-ddb", {
      tableName: "products",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynadb.AttributeType.STRING,
      },
      billingMode: dynadb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "products-fetch-function",
      {
        functionName: "products-fetch-function",
        entry: "lambda/products/products-fetch-function.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName,
        },
      }
    );

    this.productsDdb.grantReadData(this.productsFetchHandler);

    this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "products-admin-function",
      {
        functionName: "products-admin-function",
        entry: "lambda/products/products-admin-function.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName,
        },
      }
    );

    this.productsDdb.grantWriteData(this.productsAdminHandler);
  }
}
