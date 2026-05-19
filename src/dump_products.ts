import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";
import { writeFileSync } from "fs";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);

  console.log("Fetching products list...");
  const res = await client.getList<any>("products", { page_size: 100 });
  console.log(`Found ${res.data.length} products`);

  const fullProducts: any[] = [];
  for (const product of res.data) {
    const detail = await client.get<any>(`products/${product.id}`);
    fullProducts.push(detail.data);
  }

  writeFileSync("pancake_products_dump.json", JSON.stringify(fullProducts, null, 2));
  console.log("Dumped all products and variations to pancake_products_dump.json");
}

main().catch(console.error);
