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

const COLOR_MAPPING: Record<string, string> = {
  "mockup_black": "Đen",
  "mockup_white_classic": "Trắng",
  "mockup_cream_beige": "Kem",
  "mockup_brown_earthy": "Nâu",
  "mockup_sky_blue": "Xanh trời",
  "mockup_magenta": "Hồng sen",
  "mockup_turmeric_yellow": "Vàng nghệ",
  "mockup_burgundy_red": "Đỏ đô",
  "mockup_charcoal_grey": "Xám chì",
  "mockup_navy_blue": "Xanh navy",
  "mockup_pastel_pink": "Hồng pastel"
};

const artifactDir = "C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\c28f5b9e-89a3-42c0-9b69-adec21eb6853";

async function uploadToSupabase(filePath: string, fileName: string) {
  const fileData = fs.readFileSync(filePath);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;
  
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "image/png",
      "x-upsert": "true"
    },
    body: fileData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload ${fileName}: ${error}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
}

async function run() {
  console.log("Step 1: Uploading images to Supabase...");
  const colorToUrl: Record<string, string> = {};
  const files = fs.readdirSync(artifactDir).filter(f => f.startsWith("mockup_") && f.endsWith(".png"));

  for (const file of files) {
    // Extract base name like mockup_black from mockup_black_123.png
    const baseMatch = file.match(/^(mockup_[a-z_]+)_\d+\.png$/);
    if (!baseMatch) continue;
    
    const baseName = baseMatch[1];
    const colorName = COLOR_MAPPING[baseName];
    if (!colorName) continue;

    console.log(`Uploading ${file} for color ${colorName}...`);
    const publicUrl = await uploadToSupabase(path.join(artifactDir, file), file);
    colorToUrl[colorName] = publicUrl;
  }

  console.log("Images uploaded. Color Mapping URLs:", JSON.stringify(colorToUrl, null, 2));

  console.log("\nStep 2: Updating Pancake POS variations...");
  const productsRes = await client.getList("products", { page_size: 50 });
  const phoiProducts = productsRes.total_entries > 0 
    ? productsRes.data.filter((p: any) => p.name.includes("Phôi Áo Oversize"))
    : [];

  for (const product of phoiProducts) {
    console.log(`Processing product: ${product.name} (${product.id})...`);
    
    // Get full product to have variations
    const fullProductRes = await client.get(`products/${product.id}`);
    const variations = fullProductRes.data.variations || [];
    
    const updatedVariations = variations.map((v: any) => {
      const colorPart = v.keyword?.split(" - ")[0];
      const imageUrl = colorPart ? colorToUrl[colorPart] : null;
      
      return {
        id: v.id,
        images: imageUrl ? [imageUrl] : (v.images && v.images.length > 0 ? v.images : [])
      };
    });

    if (updatedVariations.length > 0) {
      console.log(`Updating ${updatedVariations.length} variations for ${product.name}...`);
      try {
        await client.put(`products/${product.id}`, {
          product: {
            variations: updatedVariations
          }
        });
        console.log(`Successfully updated ${product.name}.`);
      } catch (err: any) {
        console.error(`Failed to update ${product.name}:`, err.message);
      }
    }
  }

  console.log("\nAll done!");
}

run().catch(console.error);
