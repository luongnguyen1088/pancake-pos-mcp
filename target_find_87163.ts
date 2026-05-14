import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const start = Math.floor(new Date("2026-04-14T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-04-16T23:59:59+07:00").getTime() / 1000);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 200
  });
  
  const orderId = 87163;
  const order = result.data.find((o: any) => o.id === orderId);
  
  if (order) {
    console.log("--- TÌM THẤY ĐƠN HÀNG 87163 ---");
    console.log(`ID: ${order.id}`);
    console.log(`Display ID: ${order.display_id}`);
    console.log(`Order Code: ${order.order_code}`);
    console.log(`Customer: ${order.customer?.name}`);
    console.log(`Status: ${order.status}`);
  } else {
    console.log("Không tìm thấy trong khoảng 14-16/4.");
  }
}

main();
