import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function testCustomID() {
  const productsRes = await client.getList("products", { page_size: 50 });
  const phoi = productsRes.data.find((p: any) => p.name.includes("210GSM"));
  
  if (phoi) {
    const full = await client.get(`products/${phoi.id}`);
    const v = full.data.variations[0];
    const targetSKU = "OS210-DEN-S-TEST";
    
    console.log(`Trying to set custom_id of variation ${v.id} to '${targetSKU}'...`);
    
    try {
      // Try updating via product PUT
      const res = await client.put(`products/${phoi.id}`, {
        product: {
          variations: [{ 
            id: v.id, 
            custom_id: targetSKU,
            display_id: targetSKU // Also try setting display_id again alongside custom_id
          }]
        }
      });
      console.log("Update sent. Response success:", res.success);
      
      // Verify
      const verify = await client.get(`products/${phoi.id}`);
      const updatedV = verify.data.variations.find((v2: any) => v2.id === v.id);
      console.log("Updated Variation Data:", JSON.stringify(updatedV, null, 2));
    } catch (err: any) {
      console.error("Operation failed:", err.message);
    }
  }
}

testCustomID();
