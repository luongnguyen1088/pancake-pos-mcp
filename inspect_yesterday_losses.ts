import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const orderIds = [92792, 92619];
  
  // Fetch from yesterday's list to find these specific IDs
  const start = Math.floor(new Date("2026-05-13T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-13T23:59:59+07:00").getTime() / 1000);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 200
  });

  const targetOrders = result.data.filter((o: any) => orderIds.includes(o.id));

  console.log("--- CHI TIẾT ĐƠN HÀNG BÙ LỖ SHIP ---");
  
  targetOrders.forEach((o: any) => {
    console.log(`\n========================================`);
    console.log(`ĐƠN HÀNG: ${o.display_id || o.id}`);
    console.log(`Khách hàng: ${o.customer?.name} - SĐT: ${o.customer?.phone_number || 'N/A'}`);
    console.log(`Địa chỉ: ${o.customer?.address || 'N/A'}`);
    console.log(`Trạng thái: ${o.status}`);
    console.log(`Phí thu khách: ${o.shipping_fee.toLocaleString()} VND`);
    console.log(`Phí trả đối tác: ${o.partner_fee.toLocaleString()} VND`);
    console.log(`Sản phẩm:`);
    if (o.items) {
      o.items.forEach((item: any) => {
        console.log(` - ${item.name} | SL: ${item.quantity} | Giá: ${item.price.toLocaleString()}`);
      });
    } else {
      console.log(` - (Không có thông tin sản phẩm chi tiết)`);
    }
    if (o.weight) console.log(`Khối lượng: ${o.weight}g`);
  });
}

main();
