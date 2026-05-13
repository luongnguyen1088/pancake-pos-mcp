import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function testCustomIdOnly() {
  const productsRes = await client.getList("products", { page_size: 50 });
  const p = productsRes.data.find((p: any) => p.name.includes("250GSM"));
  if (!p) return;
  
  const full = await client.get(`products/${p.id}`);
  const v = full.data.variations[0];
  
  console.log(`Trying custom_id: "OS250-DEN-S" for ${v.id}`);
  try {
    const res = await client.put(`products/${p.id}`, {
      product: {
        variations: [{ id: v.id, custom_id: "OS250-DEN-S" }]
      }
    });
    console.log("  Response success:", res.success);
    
    const verify = await client.get(`products/${p.id}`);
    console.log("  Variation Data:", JSON.stringify(verify.data.variations[0], null, 2));
  } catch (err: any) {
    console.log("  Failed:", err.message);
  }
}

testCustomIdOnly();
