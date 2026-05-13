import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function testVariousFields() {
  const productsRes = await client.getList("products", { page_size: 50 });
  const p = productsRes.data.find((p: any) => p.name.includes("250GSM"));
  if (!p) return;
  
  const full = await client.get(`products/${p.id}`);
  const v = full.data.variations[0];
  
  console.log(`Testing variation ${v.id} (current display_id: ${v.display_id})`);
  
  const fieldsToTry = [
    { display_id: "OS250-DEN-S" },
    { sku: "OS250-DEN-S" },
    { variation_sku: "OS250-DEN-S" },
    { custom_id: "OS250-DEN-S" }
  ];

  for (const fields of fieldsToTry) {
    console.log(`Trying fields: ${JSON.stringify(fields)}`);
    try {
      const res = await client.put(`products/${p.id}`, {
        product: {
          variations: [{ id: v.id, ...fields }]
        }
      });
      console.log("  Response success:", res.success);
      if (res.success) {
        const verify = await client.get(`products/${p.id}`);
        console.log("  New display_id:", verify.data.variations[0].display_id);
        break;
      }
    } catch (err: any) {
      console.log("  Failed:", err.message);
    }
  }
}

testVariousFields();
