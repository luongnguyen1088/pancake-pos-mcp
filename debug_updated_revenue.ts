import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const start = Math.floor(new Date("2026-05-13T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-13T23:59:59+07:00").getTime() / 1000);

  // Fetch orders updated yesterday
  let allOrders: any[] = [];
  for (let page = 1; page <= 4; page++) { // Fetch up to 800
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      updateStatus: "updated_at",
      page_number: page,
      page_size: 200,
      fields: ["id", "total_price", "status"]
    });
    allOrders = allOrders.concat(result.data);
    if (result.data.length < 200) break;
  }

  console.log(`Fetched ${allOrders.length} orders updated yesterday.`);

  // "Đơn chốt" usually excludes Cancelled (6) and Draft (0?) and Returning (4, 5)
  // Let's try statuses like 1, 2, 3, 8, 9, 16, 20
  const closedStatuses = [1, 2, 3, 8, 9, 16, 20];
  const closedOrders = allOrders.filter(o => closedStatuses.includes(o.status));
  
  console.log(`"Đơn chốt" count (updated yesterday): ${closedOrders.length}`);
  
  const sumRevenue = closedOrders.reduce((acc, o) => acc + (o.total_price || 0), 0);
  console.log(`Sum Revenue of these orders: ${sumRevenue}`);
  
  // Status breakdown of updated orders
  const breakdown: Record<string, number> = {};
  allOrders.forEach(o => {
    breakdown[o.status] = (breakdown[o.status] || 0) + 1;
  });
  console.log("Status breakdown of updated orders:", JSON.stringify(breakdown, null, 2));
}

main();
