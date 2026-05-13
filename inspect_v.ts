import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function inspectVariation() {
  const productsRes = await client.getList("products", { page_size: 50 });
  const phoi = productsRes.data.find((p: any) => p.name.includes("210GSM"));
  
  if (phoi) {
    const full = await client.get(`products/${phoi.id}`);
    const v = full.data.variations.find((v: any) => v.display_id === "004" || v.barcode?.includes("XTRXL"));
    console.log("Full Variation Data:", JSON.stringify(v, null, 2));
  }
}

inspectVariation();
