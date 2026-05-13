import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

const COLOR_MAP: Record<string, string> = {
  "Đen": "DEN",
  "Trắng": "TRA",
  "Xám Chì": "XCH",
  "Xanh Navy": "NAV",
  "Đỏ Đô": "DDO",
  "Xanh Thiên Thanh": "XTT",
  "Hồng Phấn": "HPN",
  "Vàng Nghệ": "VNG",
  "Kem Beige": "KBE",
  "Nâu Đất": "NDA",
  "Hồng Sen": "HSE"
};

async function fixAllSKUs() {
  console.log("Fetching all products...");
  const productsRes = await client.getList("products", { page_size: 50 });
  
  for (const p of productsRes.data) {
    if (!p.name.includes("Phôi Áo Oversize")) continue;
    
    console.log(`Processing ${p.name}...`);
    const full = await client.get(`products/${p.id}`);
    const gsmMatch = p.name.match(/\d+/);
    const gsm = gsmMatch ? gsmMatch[0] : "210";
    
    const variationUpdates = full.data.variations.map((v: any) => {
      const colorField = v.fields.find((f: any) => f.name === "Màu sắc");
      const sizeField = v.fields.find((f: any) => f.name === "Size");
      
      const colorCode = COLOR_MAP[colorField?.value] || "UNK";
      const sizeCode = sizeField?.value || "S";
      const sku = `OS${gsm}-${colorCode}-${sizeCode}`;
      
      return {
        id: v.id,
        custom_id: sku // The magic field!
      };
    });

    console.log(`  Updating ${variationUpdates.length} variations...`);
    try {
      await client.put(`products/${p.id}`, {
        product: {
          variations: variationUpdates
        }
      });
      console.log(`  Success for ${p.name}`);
    } catch (err: any) {
      console.error(`  Failed for ${p.name}:`, err.message);
    }
  }
  
  console.log("\nSKU Fix Complete! All variations should now show the correct SKU in 'Mã mẫu'.");
}

fixAllSKUs();
