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
  let found = false;

  console.log(`Đang tìm đơn hàng ID ${orderId}...`);

  while (!found && page <= 50) {
    const result = await client.getList("orders", {
      page_number: page,
      page_size: 200,
      // No date filter to find it anywhere
    });
    
    const order = result.data.find((o: any) => o.id === orderId);
    if (order) {
      console.log("--- TÌM THẤY ĐƠN HÀNG ---");
      console.log(`ID: ${order.id}`);
      console.log(`Mã hiển thị (Display ID): ${order.display_id}`);
      console.log(`Mã đơn (Order Code): ${order.order_code}`);
      console.log(`Tên khách: ${order.customer?.name}`);
      console.log(`Ngày tạo: ${order.inserted_at}`);
      found = true;
    } else {
      if (result.data.length < 200) break;
      page++;
    }
  }
  
  if (!found) console.log("Không tìm thấy đơn hàng này.");
}

main();
