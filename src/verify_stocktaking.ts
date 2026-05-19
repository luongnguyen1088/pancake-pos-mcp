import { readFileSync } from "fs";
import * as os from "os";
import * as path from "path";

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

function main() {
  const products: Product[] = JSON.parse(readFileSync("pancake_products_dump.json", "utf-8"));
  const transcribedCounts = parseTranscription();

  const discrepancies: { sku: string; expected: number; actual: number }[] = [];
  let checkedCount = 0;

  for (const product of products) {
    for (const v of product.variations || []) {
      const sku = v.custom_id || v.display_id || "";
      if (!sku) continue;
      
      const expected = transcribedCounts[sku] !== undefined ? transcribedCounts[sku] : 0;
      const actual = v.remain_quantity !== undefined && v.remain_quantity !== null ? v.remain_quantity : 0;
      
      checkedCount++;
      if (actual !== expected) {
        discrepancies.push({ sku, expected, actual });
      }
    }
  }

  console.log(`Checked ${checkedCount} variations in total.`);
  if (discrepancies.length === 0) {
    console.log("SUCCESS: All variations match expected physical quantities perfectly!");
  } else {
    console.log(`WARNING: Found ${discrepancies.length} discrepancies!`);
    console.log("Sample discrepancies:");
    console.log(discrepancies.slice(0, 10));
  }
}

main();
