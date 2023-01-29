#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductsAppStack } from "../lib/products-app-stack";
import { ECommerceAPIStack } from "../lib/e-commerce-api-stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: "456514076725",
  region: "us-east-1",
};

const tags = {
  cost: "e-commerce-aws",
  team: "fabmax94",
};

const productsAppStack = new ProductsAppStack(app, "products-app-stack", {
  tags,
  env,
});

const eCommerceAPIStack = new ECommerceAPIStack(app, "e-commerce-api-stack", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env,
});

eCommerceAPIStack.addDependency(productsAppStack);
