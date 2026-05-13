import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import fs from "fs";
import path from "path";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

const COLORS = [
  { name: "Xanh trời", code: "XTR", mockup: "mockup_sky_blue" },
  { name: "Hồng sen", code: "HSE", mockup: "mockup_magenta" },
  { name: "Vàng nghệ", code: "VNG", mockup: "mockup_turmeric_yellow" },
  { name: "Đỏ đô", code: "DDO", mockup: "mockup_burgundy_red" },
  { name: "Xám chì", code: "XCH", mockup: "mockup_charcoal_grey" },
  { name: "Xanh navy", code: "XNA", mockup: "mockup_navy_blue" },
  { name: "Hồng pastel", code: "HPA", mockup: "mockup_pastel_pink" },
  { name: "Đen", code: "DEN", mockup: "mockup_black" },
  { name: "Nâu", code: "NAU", mockup: "mockup_brown_earthy" },
  { name: "Kem", code: "KEM", mockup: "mockup_cream_beige" },
  { name: "Trắng", code: "TRA", mockup: "mockup_white_classic" }
];

const SIZES = ["S", "M", "L", "XL"];

async function run() {
  console.log("Step 1: Fetching current products...");
  const productsRes = await client.getList("products", { page_size: 50 });
  const phoiProducts = productsRes.data.filter((p: any) => p.name.includes("Phôi Áo Oversize"));

  for (const product of phoiProducts) {
    console.log(`\nOptimizing variations for ${product.name}...`);
    
    // Get full product with variations
    const fullRes = await client.get(`products/${product.id}`);
    const variations = fullRes.data.variations || [];
    
    const updatedVariations = variations.map((v: any) => {
      // Find color and size from fields to reconstruct SKU
      const colorField = v.fields.find((f: any) => f.name === "Màu sắc");
      const sizeField = v.fields.find((f: any) => f.name === "Size");
      
      const color = COLORS.find(c => c.name === colorField?.value);
      const size = sizeField?.value;
      const gsm = product.name.match(/\d+/)?.[0] || "210";

      if (color && size) {
        const sku = `OS${gsm}-${color.code}-${size}`;
        const barcode = `OS${gsm}${color.code}${size}`;
        
        return {
          id: v.id,
          display_id: sku, // Force update Mã mẫu
          barcode: barcode  // Ensure Barcode is also correct
        };
      }
      return { id: v.id };
    });

    console.log(`Pushing ${updatedVariations.length} updates for ${product.name}...`);
    try {
      await client.put(`products/${product.id}`, {
        product: {
          variations: updatedVariations
        }
      });
      console.log(`Successfully forced update for ${product.name}.`);
    } catch (err: any) {
      console.error(`Failed to update ${product.name}:`, err.message);
    }
  }

  console.log("\nForce Update Complete! Please check 'Mã mẫu' again.");
}

run().catch(console.error);
