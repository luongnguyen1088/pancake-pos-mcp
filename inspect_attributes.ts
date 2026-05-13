import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function inspectAttributes() {
  const productsRes = await client.getList("products", { page_size: 5 });
  const phoi = productsRes.data.find((p: any) => p.name.includes("Phôi Áo Oversize"));
  
  if (phoi) {
    const full = await client.get(`products/${phoi.id}`);
    console.log("Product Name:", full.data.name);
    console.log("Attributes:", JSON.stringify(full.data.attributes, null, 2));
    console.log("Variations Sample Fields:", JSON.stringify(full.data.variations?.[0]?.fields, null, 2));
  }
}

inspectAttributes();
