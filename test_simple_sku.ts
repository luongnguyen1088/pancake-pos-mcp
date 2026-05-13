import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function testSimpleSKU() {
  const productsRes = await client.getList("products", { page_size: 50 });
  const phoi = productsRes.data.find((p: any) => p.name.includes("210GSM"));
  
  if (phoi) {
    const full = await client.get(`products/${phoi.id}`);
    const v = full.data.variations[0];
    console.log(`Trying to set display_id of ${v.id} to 'TESTSKU'...`);
    
    try {
      await client.put(`products/${phoi.id}`, {
        product: {
          variations: [{ id: v.id, display_id: "TESTSKU" }]
        }
      });
      console.log("Success!");
    } catch (err: any) {
      console.error("Failed:", err.message);
    }
  }
}

testSimpleSKU();
