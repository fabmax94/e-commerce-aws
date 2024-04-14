import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
  productUrl: string;
}

export class ProductRepository {
  private ddClient: DocumentClient;
  private productsTable: string;

  constructor(ddClient: DocumentClient, productsTable: string) {
    this.ddClient = ddClient;
    this.productsTable = productsTable;
  }

  public async getAllProducts(): Promise<Product[]> {
    const data = await this.ddClient
      .scan({
        TableName: this.productsTable,
      })
      .promise();

    return data.Items as Product[];
  }

  public async getProductById(productId: string): Promise<Product | undefined> {
    const data = await this.ddClient
      .get({
        TableName: this.productsTable,
        Key: {
          id: productId,
        },
      })
      .promise();

    return data.Item as Product;
  }

  public async create(product: Product): Promise<void> {
    await this.ddClient
      .put({
        TableName: this.productsTable,
        Item: product,
      })
      .promise();
  }

  public async delete(productId: string): Promise<void> {
    await this.ddClient
      .delete({
        TableName: this.productsTable,
        Key: {
          id: productId,
        },
      })
      .promise();
  }

  public async update(product: Product): Promise<void> {
    await this.ddClient
      .update({
        TableName: this.productsTable,
        Key: {
          id: product.id,
        },
        ConditionExpression: "attribute_exists(id)",
        UpdateExpression:
          "set productName = :n, code = :c, price = :p, model = :m, productUrl = :u",
        ExpressionAttributeValues: {
          ":n": product.productName,
          ":c": product.code,
          ":p": product.price,
          ":m": product.model,
          ":u": product.productUrl,
        },
      })
      .promise();
  }
}
