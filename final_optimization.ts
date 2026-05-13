import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import fs from "fs";
import path from "path";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const SUPABASE_URL = "https://yskozvjojlntuqxkyakm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlza296dmpvamxudHVxeGt5YWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkyOTgwNiwiZXhwIjoyMDc1NTA1ODA2fQ.Pur69fXFUylreuoIiRcnmtOpvIlCAuy_k_92xFts6e0";
const BUCKET = "product-images";

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
const GSMS = [210, 230, 250];

const artifactDir = "C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\c28f5b9e-89a3-42c0-9b69-adec21eb6853";

async function run() {
  console.log("Step 1: Deleting current products for final optimization...");
  const productsRes = await client.getList("products", { page_size: 50 });
  const phoiProducts = productsRes.total_entries > 0 
    ? productsRes.data.filter((p: any) => p.name.includes("Phôi Áo Oversize"))
    : [];

  for (const p of phoiProducts) {
    console.log(`Deleting ${p.name}...`);
    await client.delete(`products/${p.id}`);
  }

  console.log("\nStep 2: Preparing Image URLs...");
  const colorToUrl: Record<string, string> = {};
  const files = fs.readdirSync(artifactDir).filter(f => f.startsWith("mockup_") && f.endsWith(".png"));
  for (const color of COLORS) {
    const file = files.find(f => f.startsWith(color.mockup));
    if (file) {
      colorToUrl[color.name] = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file}`;
    }
  }

  console.log("\nStep 3: Creating Optimized Catalog...");
  for (const gsm of GSMS) {
    console.log(`Creating Phôi Áo Oversize ${gsm}GSM...`);
    
    const variations = [];
    for (const color of COLORS) {
      for (const size of SIZES) {
        const sku = `OS${gsm}-${color.code}-${size}`;
        const barcode = `OS${gsm}${color.code}${size}`;
        
        variations.push({
          display_id: sku,
          barcode: barcode,
          retail_price: 0,
          images: colorToUrl[color.name] ? [colorToUrl[color.name]] : [],
          fields: [
            { name: "Màu sắc", value: color.name },
            { name: "Size", value: size }
          ]
        });
      }
    }

    const payload = {
      product: {
        name: `Phôi Áo Oversize ${gsm}GSM`,
        custom_id: `PH-OS-${gsm}`,
        product_attributes: [
          { name: "Màu sắc", values: COLORS.map(c => c.name) },
          { name: "Size", values: SIZES }
        ],
        variations: variations
      }
    };

    await client.post("products", payload);
    console.log(`Successfully created product PH-OS-${gsm} with 44 variations.`);
  }

  console.log("\nOptimization Complete!");
}

run().catch(console.error);
