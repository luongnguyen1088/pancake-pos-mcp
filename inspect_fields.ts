import { PancakeHttpClient } from "./src/api-client/pancake-http-client.ts";
import { loadConfig } from "./src/config.ts";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const res = await client.getList("orders", { page_number: 1, page_size: 5 });
  const order = res.data[0];
  
  console.log("FIELDS IN ORDER:");
  console.log("partner:", order.partner);
  console.log("saler:", order.saler);
  console.log("creator:", order.creator);
  console.log("items[0]:", order.items[0]);
  console.log("status:", order.status);
  console.log("status_name:", order.status_name);
}

main();
