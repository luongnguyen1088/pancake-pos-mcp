import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

const COLORS = [
  { name: "Xanh trời", code: "XTR" },
  { name: "Hồng sen", code: "HSN" },
  { name: "Vàng nghệ", code: "VNG" },
  { name: "Đỏ đô", code: "DDO" },
  { name: "Xám chì", code: "XCH" },
  { name: "Xanh navy", code: "NAV" },
  { name: "Hồng pastel", code: "HPA" },
  { name: "Đen", code: "DEN" },
  { name: "Nâu", code: "NAU" },
  { name: "Kem", code: "KEM" },
  { name: "Trắng", code: "TRG" }
];

const SIZES = ["S", "M", "L", "XL"];
const GSMS = [210, 230, 250];

async function createProducts() {
  console.log("Starting product creation...");

  for (const gsm of GSMS) {
    const productName = `Phôi Áo Oversize ${gsm}GSM`;
    const productSKU = `OS-${gsm}`;
    
    const variations = [];
    for (const color of COLORS) {
      for (const size of SIZES) {
        variations.push({
          keyword: `${color.name} - ${size}`,
          custom_id: `OS-${gsm}-${color.code}-${size}`,
          retail_price: 0, // Placeholder
          fields: [
            { name: "Màu sắc", value: color.name },
            { name: "Kích thước", value: size },
            { name: "GSM", value: gsm.toString() }
          ]
        });
      }
    }

    try {
      console.log(`Creating product: ${productName} with ${variations.length} variations...`);
      const response = await client.post("products", {
        product: {
          name: productName,
          custom_id: productSKU,
          type: "product",
          variations: variations
        }
      });
      console.log(`Successfully created ${productName}.`);
    } catch (error) {
      console.error(`Failed to create ${productName}:`, error);
    }
  }

  console.log("All products created.");
}

createProducts();
