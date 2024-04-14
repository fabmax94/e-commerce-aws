import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as process from "process";
import { DynamoDB } from "aws-sdk";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { v4 as uuid } from "uuid";
import * as AWSXRay from "aws-xray-sdk";

AWSXRay.captureAWS(require("aws-sdk"));

const productsDb = process.env.PRODUCTS_DDB!;
const dynamoDb = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(dynamoDb, productsDb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`Request IDs ${lambdaRequestId} ${apiRequestId}`);
  if (event.resource === "/products" && event.body) {
    console.log("POST");
    const product = JSON.parse(event.body) as Product;
    await productRepository.create({
      ...product,
      id: uuid(),
    });
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Created product",
      }),
    };
  } else if (event.resource === `/products/{id}`) {
    if (event.httpMethod === "PUT" && event.body) {
      console.log("PUT");
      const product = JSON.parse(event.body) as Product;
      try {
        await productRepository.update({
          ...product,
          id: event.pathParameters!.id as string,
        });
      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Product not found",
          }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "PUT Products - OK",
        }),
      };
    } else if (event.httpMethod === "DELETE") {
      console.log("DELETE");

      await productRepository.delete(event.pathParameters!.id as string);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Deleted product",
        }),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad request",
    }),
  };
}
