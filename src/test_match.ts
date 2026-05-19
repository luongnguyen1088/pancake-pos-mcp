import { readFileSync } from "fs";

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

function main() {
  const products: Product[] = JSON.parse(readFileSync("pancake_products_dump.json", "utf-8"));
  const transcribedCounts = parseTranscription();

  console.log("Transcribed SKU counts:", Object.keys(transcribedCounts).length);
  console.log(transcribedCounts);

  const matched: Record<string, string> = {};
  const allVariations: { sku: string; id: string; currentRemain: number }[] = [];

  for (const product of products) {
    for (const v of product.variations || []) {
      const sku = v.custom_id || v.display_id || "";
      if (!sku) continue;
      allVariations.push({ sku, id: v.id, currentRemain: v.remain_quantity });
      if (transcribedCounts[sku] !== undefined) {
        matched[sku] = v.id;
      }
    }
  }

  console.log(`\nMatched variations count: ${Object.keys(matched).length} / ${Object.keys(transcribedCounts).length}`);
  
  const unmatched = Object.keys(transcribedCounts).filter(sku => !matched[sku]);
  if (unmatched.length > 0) {
    console.log("Unmatched SKUs in transcription:", unmatched);
  } else {
    console.log("All transcribed SKUs matched perfectly!");
  }

  console.log(`Total active variations in shop products: ${allVariations.length}`);
}

main();
