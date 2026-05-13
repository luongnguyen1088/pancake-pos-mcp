import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function testUpdate() {
  const variationId = "2fd4baf0-f250-48d8-9814-3a80168485c7"; // From debug output
  const productId = "6a2a071d-ec16-4c76-b733-ac271cbf2b33";
  const imageUrl = "https://yskozvjojlntuqxkyakm.supabase.co/storage/v1/object/public/product-images/mockup_burgundy_red_1778647187215.png";

  try {
    console.log("Testing individual variation update...");
    // Try PUT /products/{p_id}/variations/{v_id}
    const res = await client.put(`products/${productId}/variations/${variationId}`, {
      variation: {
        images: [imageUrl]
      }
    });
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("Failed individual update:", err.message);
  }
}

testUpdate();
