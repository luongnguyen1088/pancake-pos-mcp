import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const orderId = 87163;
  let page = 1;
  
  // Searching from the end (most recent)
  while (page <= 60) {
    const result = await client.getList("orders", {
      page_number: page,
      page_size: 200,
    });
    const order = result.data.find((o: any) => o.id === orderId);
    if (order) {
      console.log(JSON.stringify(order, null, 2));
      return;
    }
    if (result.data.length < 200) break;
    page++;
  }
  console.log("Không tìm thấy.");
}

main();
