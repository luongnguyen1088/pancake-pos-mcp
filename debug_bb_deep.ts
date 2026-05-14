import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  // Wide range to catch timezone issues
  const start = Math.floor(new Date("2026-05-12T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-14T23:59:59+07:00").getTime() / 1000);

  let allOrders: any[] = [];
  for (let page = 1; page <= 5; page++) {
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200,
      fields: ["id", "inserted_at", "status", "total_price", "cod", "prepaid"]
    });
    allOrders = allOrders.concat(result.data);
    if (result.data.length < 200) break;
  }

  console.log(`Fetched ${allOrders.length} orders in the wide range.`);

  // Filtering for exactly May 13 in GMT+7
  const dayStart = "2026-05-13T00:00:00";
  const dayEnd = "2026-05-13T23:59:59";

  const targetOrders = allOrders.filter(o => o.inserted_at >= dayStart && o.inserted_at <= dayEnd);
  console.log(`Orders inserted between ${dayStart} and ${dayEnd}: ${targetOrders.length}`);
  
  const closed = targetOrders.filter(o => o.status !== 6);
  console.log(`Closed count: ${closed.length}`);
  console.log(`Sum total_price (Closed): ${closed.reduce((acc, o) => acc + (o.total_price || 0), 0)}`);
}

main();
