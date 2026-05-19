import { readFileSync } from "fs";
import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);
  
  const products = JSON.parse(readFileSync("pancake_products_dump.json", "utf-8"));
  const realVariationId = products[0].variations[0].id;

  const payload = {
    stocktaking: {
      warehouse_id: "abbf28ae-1514-4aec-82ce-e407605b77d8",
      note: "Test auto-approve with stocktaking_at",
      status: 1,
      stocktaking_at: new Date().toISOString(),
      items: [
        {
          variation_id: realVariationId,
          changed_quantity: 1
        }
      ]
    }
  };

  console.log("Sending POST to stocktakings with stocktaking_at...");
  try {
    const res = await client.post<any>("stocktakings", payload);
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.log("Failed:", e.message || e);
  }
}

main();
