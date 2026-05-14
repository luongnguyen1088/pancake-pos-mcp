import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  // Fetch specific order by ID
  try {
    const orderId = "87163";
    const res = await client.getList("orders", {
      fields: ["id", "display_id", "bill_full_name", "customer", "partner_id", "order_code", "inserted_at", "status", "shipping_fee", "partner_fee"]
    });
    
    // Actually getList doesn't support fetching by ID easily in the current tool, 
    // but I can fetch with a range around that ID or just search.
    // Wait, I'll use the 'id' field in the result if I find it.
    
    const result = await client.getList("orders", {
        startDateTime: Math.floor(new Date("2026-04-14").getTime()/1000),
        endDateTime: Math.floor(new Date("2026-04-16").getTime()/1000),
        page_size: 200
    });
    
    const order = result.data.find((o: any) => String(o.id) === orderId);
    
    if (order) {
      console.log("--- CHI TIẾT ĐƠN HÀNG 87163 ---");
      console.log(JSON.stringify(order, null, 2));
    } else {
      console.log("Không tìm thấy đơn hàng 87163 trong khoảng thời gian 15/4.");
    }
  } catch (e) {
    console.log("Lỗi khi truy vấn đơn hàng.");
  }
}

main();
