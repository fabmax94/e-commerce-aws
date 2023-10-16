import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`Request IDs ${lambdaRequestId} ${apiRequestId}`);
  if (event.resource === "/products") {
    console.log("POST");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "POST Products - OK",
      }),
    };
  } else if (event.resource === `/products/{id}`) {
    if (event.httpMethod === "PUT") {
      console.log("PUT");

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "PUT Products - OK",
        }),
      };
    } else if (event.httpMethod === "DELETE") {
      console.log("DELETE");

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "PUT Products - OK",
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
