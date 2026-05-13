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

// Mockup mapping (from previous steps)
const MOCKUP_MAP: Record<string, string> = {
  "DEN": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_black_1778647256036.png",
  "TRA": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_white_classic_1778647300700.png",
  "XCH": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_charcoal_grey_1778647199952.png",
  "NAV": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_navy_blue_1778647226514.png",
  "DDO": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_burgundy_red_1778647187215.png",
  "XTT": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_sky_blue_1778647137862.png",
  "HPN": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_pastel_pink_1778647242588.png",
  "VNG": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_turmeric_yellow_1778647172502.png",
  "KBE": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_cream_beige_1778647286533.png",
  "NDA": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_brown_earthy_1778647270099.png",
  "HSE": "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_magenta_1778647151133.png"
};

async function finalRecreation() {
  console.log("Cleanup...");
  const productsRes = await client.getList("products", { page_size: 100 });
  for (const p of productsRes.data) {
    if (p.name.includes("Phôi Áo Oversize") || p.name.includes("Test SKU")) {
      await client.delete(`products/${p.id}`);
    }
  }

  for (const gsm of GSMS) {
    const parentName = `Phôi Áo Oversize ${gsm}GSM`;
    const parentCustomId = `OS${gsm}`; // Set parent SKU as prefix
    
    console.log(`Creating ${parentName}...`);
    
    const variations = [];
    for (const color of COLORS) {
      for (const size of SIZES) {
        variations.push({
          barcode: `OS${gsm}${color.code}${size}`,
          retail_price: 0,
          images: MOCKUP_MAP[color.code] ? [MOCKUP_MAP[color.code]] : [],
          fields: [
            { name: "Màu sắc", value: color.name, keyValue: color.code },
            { name: "Size", value: size, keyValue: size }
          ]
        });
      }
    }

    await client.post("products", {
      product: {
        name: parentName,
        custom_id: parentCustomId,
        product_attributes: [
          { 
            name: "Màu sắc", 
            values: COLORS.map(c => c.name),
            keyword: COLORS.map(c => ({ value: c.name, keyValue: c.code }))
          },
          { 
            name: "Size", 
            values: SIZES,
            keyword: SIZES.map(s => ({ value: s, keyValue: s }))
          }
        ],
        variations: variations
      }
    });
  }
  
  console.log("Done! Please check the catalog now.");
}

finalRecreation();
