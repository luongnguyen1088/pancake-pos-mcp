import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

const COLORS = [
  { name: "Đen", code: "DEN" },
  { name: "Trắng", code: "TRA" },
  { name: "Xám Chì", code: "XCH" },
  { name: "Xanh Navy", code: "NAV" },
  { name: "Đỏ Đô", code: "DDO" },
  { name: "Xanh Thiên Thanh", code: "XTT" },
  { name: "Hồng Phấn", code: "HPN" },
  { name: "Vàng Nghệ", code: "VNG" },
  { name: "Kem Beige", code: "KBE" },
  { name: "Nâu Đất", code: "NDA" },
  { name: "Hồng Sen", code: "HSE" }
];

const SIZES = ["S", "M", "L", "XL"];
const GSMS = [210, 230, 250];

async function cleanupAndRecreate() {
  console.log("Step 1: Cleaning up existing products...");
  const productsRes = await client.getList("products", { page_size: 100 });
  for (const p of productsRes.data) {
    if (p.name.includes("Phôi Áo Oversize") || p.name.includes("Test SKU")) {
      console.log(`Deleting ${p.name}...`);
      await client.delete(`products/${p.id}`);
    }
  }

  console.log("\nStep 2: Re-creating products with step-by-step variations...");
  
  for (const gsm of GSMS) {
    const parentName = `Phôi Áo Oversize ${gsm}GSM`;
    const parentCustomId = `PH-OS-${gsm}`;
    
    console.log(`\nCreating Parent: ${parentName}...`);
    const parentRes = await client.post("products", {
      product: {
        name: parentName,
        custom_id: parentCustomId,
        product_attributes: [
          { name: "Màu sắc", values: COLORS.map(c => c.name) },
          { name: "Size", values: SIZES }
        ]
      }
    });

    const productId = parentRes.data.id;
    console.log(`Parent Created: ${productId}. Adding 44 variations...`);

    // We MUST add variations one by one or in small batches to set display_id correctly
    // The API for adding a variation is usually POST /products/{id}/variations
    for (const color of COLORS) {
      for (const size of SIZES) {
        const sku = `OS${gsm}-${color.code}-${size}`;
        const barcode = `OS${gsm}${color.code}${size}`;
        
        console.log(`  Adding Variation: ${sku}...`);
        try {
          await client.post(`products/${productId}/variations`, {
            variation: {
              display_id: sku,
              barcode: barcode,
              retail_price: 0,
              fields: [
                { name: "Màu sắc", value: color.name },
                { name: "Size", value: size }
              ]
            }
          });
        } catch (err: any) {
          console.error(`    Failed to add ${sku}:`, err.message);
        }
      }
    }
  }

  console.log("\nAll products re-created with forced SKUs!");
}

cleanupAndRecreate();
