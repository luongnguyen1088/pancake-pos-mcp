import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);

  console.log("Fetching products...");
  const res = await client.getList<any>("products", { page_size: 100 });
  console.log(`Found ${res.data.length} products`);

  for (const product of res.data) {
    const detail = await client.get<any>(`products/${product.id}`);
    console.log(`\nProduct: ${detail.data.name} (ID: ${detail.data.id})`);
    console.log("Variations:");
    for (const v of detail.data.variations || []) {
      console.log(`  - SKU/CustomID: ${v.custom_id || v.display_id || 'N/A'}, Name: ${v.name || 'N/A'}, ID: ${v.id}, Remain: ${v.remain_quantity}`);
    }
  }
}

main().catch(console.error);
