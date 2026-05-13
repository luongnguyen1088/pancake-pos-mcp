import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function checkAll() {
  const res = await client.getList("products", { page_size: 50 });
  console.log("Total products found:", res.data.length);
  for (const p of res.data) {
    const full = await client.get(`products/${p.id}`);
    console.log(`Product: ${p.name} (${p.id})`);
    console.log(`  Variations count: ${full.data.variations.length}`);
    if (full.data.variations.length > 0) {
      console.log(`  First variation SKU (display_id): ${full.data.variations[0].display_id}`);
    }
  }
}

checkAll();
