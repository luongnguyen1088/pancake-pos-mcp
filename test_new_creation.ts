import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function testNewCreation() {
  console.log("Creating a test product with a specific SKU format...");
  
  const payload = {
    product: {
      name: "Phôi Áo Test SKU",
      custom_id: "TEST-PARENT",
      product_attributes: [
        { name: "Màu sắc", values: ["Đen"] },
        { name: "Size", values: ["S"] }
      ],
      variations: [
        {
          display_id: "PHOS210-DEN-S", // Test with a different prefix and dashes
          barcode: "PHOS210DENS",
          retail_price: 0,
          fields: [
            { name: "Màu sắc", value: "Đen" },
            { name: "Size", value: "S" }
          ]
        }
      ]
    }
  };

  try {
    const res = await client.post("products", payload);
    console.log("Created. Variation display_id in response:", res.data.variations[0].display_id);
    console.log("Full variation object:", JSON.stringify(res.data.variations[0], null, 2));
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}

testNewCreation();
