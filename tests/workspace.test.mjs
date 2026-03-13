import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("frontend GraphQL contracts include core production operations", () => {
  const graphql = fs.readFileSync(new URL("../lib/graphql.ts", import.meta.url), "utf8");

  assert.match(graphql, /refreshSession/);
  assert.match(graphql, /transferStock/);
  assert.match(graphql, /createPurchaseOrder/);
  assert.match(graphql, /receivePurchaseOrder/);
  assert.match(graphql, /saveAlertRule/);
  assert.match(graphql, /dashboardStats/);
});

test("frontend type contracts include refresh tokens and warehouse balances", () => {
  const authTypes = fs.readFileSync(new URL("../types/auth.ts", import.meta.url), "utf8");
  const productTypes = fs.readFileSync(new URL("../types/product.ts", import.meta.url), "utf8");

  assert.match(authTypes, /refreshToken/);
  assert.match(productTypes, /WarehouseBalance/);
  assert.match(productTypes, /PurchaseOrder/);
  assert.match(productTypes, /AlertRule/);
});
