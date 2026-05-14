import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const start = Math.floor(new Date("2026-05-12T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-14T23:59:59+07:00").getTime() / 1000);

  let allOrders: any[] = [];
  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 200
  });
  allOrders = result.data;

  const dayStart = "2026-05-13T00:00:00";
  const dayEnd = "2026-05-13T23:59:59";

  const targetOrders = allOrders.filter(o => o.inserted_at >= dayStart && o.inserted_at <= dayEnd);
  const closed = targetOrders.filter(o => o.status !== 6);
  console.log(`Shop POD Closed count for May 13: ${closed.length}`);
}

main();
