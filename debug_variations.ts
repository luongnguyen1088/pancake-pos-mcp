import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function debug() {
  const productsRes = await client.getList("products", { page_size: 1 });
  const product = productsRes.data[0];
  console.log(`Product: ${product.name}`);
  const full = await client.get(`products/${product.id}`);
  console.log("Variations Sample:", JSON.stringify(full.data.variations?.[0], null, 2));
}

debug();
