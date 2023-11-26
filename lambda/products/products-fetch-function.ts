import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as process from "process";
import { DynamoDB } from "aws-sdk";
import { ProductRepository } from "/opt/nodejs/productsLayer";

const productsDb = process.env.PRODUCTS_DDB!;
const dynamoDb = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(dynamoDb, productsDb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`Request IDs ${lambdaRequestId} ${apiRequestId}`);
  if (event.resource === "/products") {
    if (method === "GET") {
      console.log("GET");

      const products = await productRepository.getAllProducts();
      return {
        statusCode: 200,
        body: JSON.stringify(products),
      };
    }
  } else if (event.resource === "/products/{id}") {
    if (method === "GET") {
      console.log("GET");
      const product = await productRepository.getProductById(
        event.pathParameters!.id as string,
      );
      if (product) {
        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Product not found",
          }),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad request",
    }),
  };
}
