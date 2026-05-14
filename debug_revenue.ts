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

  // Fetch all orders for yesterday
  // We'll fetch in batches if needed, but 346 should fit in 2 pages of 200
  let allOrders: any[] = [];
  for (let page = 1; page <= 2; page++) {
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200,
      fields: ["id", "total_price", "status", "cod", "prepaid", "shipping_fee", "discount"]
    });
    allOrders = allOrders.concat(result.data);
    if (result.data.length < 200) break;
  }

  console.log(`Fetched ${allOrders.length} orders.`);

  const filteredOrders = allOrders.filter(o => o.status !== 6);
  console.log(`Orders excluding status 6 (Cancelled): ${filteredOrders.length}`);

  let sumTotalPrice = 0;
  let sumCod = 0;
  let sumPrepaid = 0;
  let sumShipping = 0;
  let sumDiscount = 0;

  for (const o of filteredOrders) {
    sumTotalPrice += (o.total_price || 0);
    sumCod += (o.cod || 0);
    sumPrepaid += (o.prepaid || 0);
    sumShipping += (o.shipping_fee || 0);
    sumDiscount += (o.discount || 0);
  }

  console.log(`--- Stats for Filtered Orders ---`);
  console.log(`Sum total_price: ${sumTotalPrice}`);
  console.log(`Sum cod: ${sumCod}`);
  console.log(`Sum prepaid: ${sumPrepaid}`);
  console.log(`Sum shipping_fee: ${sumShipping}`);
  console.log(`Sum discount: ${sumDiscount}`);
  console.log(`Calculated Revenue (Total Price): ${sumTotalPrice}`);
  
  // Checking if Status 6 is actually Cancelled
  const cancelledOrders = allOrders.filter(o => o.status === 6);
  console.log(`Cancelled orders value (total_price): ${cancelledOrders.reduce((acc, o) => acc + (o.total_price || 0), 0)}`);
}

main();
