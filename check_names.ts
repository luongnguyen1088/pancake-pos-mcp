import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  
  const shop1 = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const shop2 = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  try {
    const res1 = await shop1.get("shop");
    console.log("Shop 1 info:", res1.data.name);
  } catch (e) { console.log("Shop 1 error"); }

  try {
    const res2 = await shop2.get("shop");
    console.log("Shop 2 info:", res2.data.name);
  } catch (e) { console.log("Shop 2 error"); }
}

main();
