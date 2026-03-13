import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("prisma schema is upgraded for postgres and core inventory domains", () => {
  const schema = fs.readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");

  assert.match(schema, /provider = "postgresql"/);
  assert.match(schema, /model Warehouse/);
  assert.match(schema, /model RefreshToken/);
  assert.match(schema, /model StockLedger/);
  assert.match(schema, /model PurchaseOrder/);
  assert.match(schema, /model GoodsReceipt/);
  assert.match(schema, /model AlertRule/);
  assert.match(schema, /model AuditEvent/);
});

test("backend package exposes production and test entrypoints", () => {
  const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(typeof pkg.scripts["start:prod"], "string");
  assert.equal(typeof pkg.scripts.test, "string");
});
