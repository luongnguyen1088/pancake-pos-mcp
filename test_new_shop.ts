import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const newApiKey = "51f1892ac1cc485b8541ac8ddf41b7d5";
  const newShopId = "1290002634";

  const config = {
    PANCAKE_POS_API_KEY: newApiKey,
    PANCAKE_POS_SHOP_ID: newShopId,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  };

  const client = new PancakeHttpClient(config as any);

  try {
    const result = await client.get("warehouses");
    console.log("Success! Warehouses info:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Failed to connect to new shop:", error);
  }
}

main();
