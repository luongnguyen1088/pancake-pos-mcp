import { readFileSync } from "fs";
import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

interface Variation {
  id: string;
  display_id?: string;
  custom_id?: string;
  remain_quantity: number;
}

interface Product {
  id: string;
  name: string;
  variations: Variation[];
}

function parseTranscription(): Record<string, number> {
  const filePath = "C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\f97f8359-c9ac-47ad-9fc1-47581d96d8e8\\browser\\scratchpad_bzivzx5w.md";
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const counts: Record<string, number> = {};

  for (const line of lines) {
    if (line.trim().startsWith("|") && !line.includes("SKU") && !line.includes("---")) {
      const parts = line.split("|").map(p => p.trim());
      if (parts.length >= 4) {
        const sku = parts[1];
        const qty = parseInt(parts[3], 10);
        if (sku && !isNaN(qty)) {
          counts[sku] = qty;
        }
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
  const note = "Kiểm kho định kỳ theo phiếu ảnh 2026-05-19";

  const items: { variation_id: string; changed_quantity: number }[] = [];
  const logDetails: { sku: string; variation_id: string; remain_quantity: number; actual_quantity: number; changed_quantity: number }[] = [];

  for (const product of products) {
    for (const v of product.variations || []) {
      const sku = v.custom_id || v.display_id || "";
      if (!sku) continue;
      
      const count = transcribedCounts[sku] !== undefined ? transcribedCounts[sku] : 0;
      const remain = v.remain_quantity !== undefined && v.remain_quantity !== null ? v.remain_quantity : 0;
      const changed = count - remain;
      
      items.push({
        variation_id: v.id,
        changed_quantity: changed
      });

      logDetails.push({
        sku,
        variation_id: v.id,
        remain_quantity: remain,
        actual_quantity: count,
        changed_quantity: changed
      });
    }
  }

  console.log(`Prepared ${items.length} items for stocktaking.`);
  console.log(`Non-zero actual quantity items count: ${logDetails.filter(i => i.actual_quantity > 0).length}`);
  console.log(`Zero actual quantity items count: ${logDetails.filter(i => i.actual_quantity === 0).length}`);
  console.log(`Adjusted (changed_quantity !== 0) items count: ${logDetails.filter(i => i.changed_quantity !== 0).length}`);

  // Print sample non-zero and zero items as a verification log
  console.log("\nSample non-zero actual quantity items:");
  console.log(logDetails.filter(i => i.actual_quantity > 0).slice(0, 5));
  console.log("\nSample zero actual quantity items:");
  console.log(logDetails.filter(i => i.actual_quantity === 0).slice(0, 5));

  console.log("\nSubmitting stocktaking payload to Pancake POS API (plural: stocktakings)...");
  const payload = {
    stocktaking: {
      warehouse_id: warehouseId,
      note: note,
      status: 1, // Approve immediately
      items: items
    }
  };

  try {
    const res = await client.post<any>("stocktakings", payload);
    console.log("Stocktaking API Response:");
    console.log(JSON.stringify(res, null, 2));
    console.log("\nStocktaking successfully created and processed!");
  } catch (error) {
    console.error("Failed to execute stocktaking:", error);
  }
}

main().catch(console.error);
