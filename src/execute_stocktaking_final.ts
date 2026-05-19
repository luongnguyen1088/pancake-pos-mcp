import { readFileSync } from "fs";
import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

interface Variation {
  id: string;
  custom_id: string;
  display_id: string;
  remain_quantity: number;
}

interface Product {
  name: string;
  variations: Variation[];
}

function parseTranscription(): Record<string, number> {
  const rawText = `
OS250-DEN-S	7
OS250-DEN-M	8
OS250-DEN-L	5
OS250-DEN-XL	5
OS250-TRA-S	12
OS250-TRA-M	7
OS250-TRA-L	7
OS250-TRA-XL	8
OS250-XCH-S	1
OS250-XCH-M	8
OS250-XCH-L	6
OS250-XCH-XL	3
OS250-NAV-S	8
OS250-NAV-M	14
OS250-NAV-L	9
OS250-NAV-XL	6
OS250-DDO-S	10
OS250-DDO-M	4
OS250-DDO-L	8
OS250-DDO-XL	6
OS250-HPN-S	5
OS250-HPN-M	1
OS250-HPN-L	8
OS250-HPN-XL	7
OS250-VNG-L	1
OS250-KBE-S	5
OS250-KBE-M	4
OS250-KBE-L	10
OS250-KBE-XL	8
OS250-NDA-S	1
OS250-NDA-M	8
OS250-NDA-L	5
OS250-NDA-XL	4
OS250-HSE-L	1
OS230-DEN-M	2
OS230-DEN-L	9
OS230-DEN-XL	13
OS230-TRA-L	8
OS230-TRA-XL	15
OS210-TRA-M	3
OS210-TRA-L	7
OS210-TRA-XL	15
OS210-NAV-M	7
OS210-NAV-L	8
OS210-NAV-XL	12
  `;
  const lines = rawText.trim().split("\n");
  const counts: Record<string, number> = {};

  for (const line of lines) {
    const parts = line.split("\t").map(p => p.trim());
    if (parts.length >= 2) {
      const sku = parts[0];
      const count = parseInt(parts[1], 10);
      if (sku && !isNaN(count)) {
        counts[sku] = count;
      }
    }
  }
  return counts;
}

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);
  
  const products: Product[] = JSON.parse(readFileSync("pancake_products_dump.json", "utf-8"));
  const transcribedCounts = parseTranscription();

  const warehouseId = "abbf28ae-1514-4aec-82ce-e407605b77d8"; // Kho mặc định
  const note = "Kiểm kho định kỳ tự động (các mã không có trong list = 0)";

  const items: { variation_id: string; changed_quantity: number }[] = [];
  let totalProcessed = 0;

  for (const product of products) {
    for (const v of product.variations || []) {
      const sku = v.custom_id || v.display_id || "";
      if (!sku) continue;
      
      const count = transcribedCounts[sku] !== undefined ? transcribedCounts[sku] : 0;
      const remain = v.remain_quantity !== undefined && v.remain_quantity !== null ? v.remain_quantity : 0;
      const changed = count - remain;
      
      totalProcessed++;
      
      // Only send items that actually have a difference in stock!
      if (changed !== 0) {
        items.push({
          variation_id: v.id,
          changed_quantity: changed
        });
      }
    }
  }

  console.log(`Processed ${totalProcessed} variations.`);
  console.log(`Prepared ${items.length} items with actual stock changes for the stocktaking sheet.`);

  const payload = {
    stocktaking: {
      warehouse_id: warehouseId,
      note: note,
      status: 1,
      items: items
    }
  };

  console.log("\nSubmitting final stocktaking payload to Pancake POS...");
  try {
    const res = await client.post<any>("stocktakings", payload);
    console.log("Success! Stocktaking sheet created.");
    console.log(`Stocktaking ID: ${res.data.id}`);
  } catch (error) {
    console.error("Failed to execute stocktaking:", error);
  }
}

main();
