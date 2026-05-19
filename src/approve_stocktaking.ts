import { readFileSync } from "fs";
import * as os from "os";
import * as path from "path";
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
  const homeDir = os.homedir();
  const scratchpadPath = path.join(
    homeDir,
    ".gemini/antigravity/brain",
    "f97f8359-c9ac-47ad-9fc1-47581d96d8e8",
    "browser/scratchpad_bzivzx5w.md"
  );
  const content = readFileSync(scratchpadPath, "utf-8");
  const lines = content.split("\n");
  const counts: Record<string, number> = {};

  for (const line of lines) {
    if (line.trim().startsWith("|") && !line.includes("SKU") && !line.includes("---")) {
      const parts = line.split("|").map(p => p.trim());
      if (parts.length >= 4) {
        const sku = parts[1];
        const count = parseInt(parts[3], 10);
        if (sku && !isNaN(count)) {
          counts[sku] = count;
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
    }
  }

  const stocktakingId = "718a147f-8d18-4edd-b1bc-9a0a045b2f9e";
  console.log(`Sending full PUT request to stocktakings/${stocktakingId} to approve...`);

  const payload = {
    stocktaking: {
      warehouse_id: warehouseId,
      note: note,
      status: 1, // Approved status
      items: items
    }
  };

  try {
    const res = await client.put<any>(`stocktakings/${stocktakingId}`, payload);
    console.log("Response:");
    console.log(JSON.stringify(res, null, 2));
    console.log("\nStocktaking successfully approved!");
  } catch (error) {
    console.error("Failed to approve stocktaking:", error);
  }
}

main();
