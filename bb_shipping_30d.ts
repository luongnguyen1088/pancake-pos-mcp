import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  // 30 days ago from today (May 14)
  const end = Math.floor(new Date().getTime() / 1000);
  const start = end - (30 * 24 * 60 * 60);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    action: "revenue_summary",
    page_size: 1
  });

  const shippingFee = result.aggs?.shipping_fee?.value || 0;
  
  console.log(`--- BÁO CÁO PHÍ SHIP THU KHÁCH SHOP BB (30 NGÀY QUA) ---`);
  console.log(`Từ ngày: ${new Date(start * 1000).toLocaleDateString("vi-VN")}`);
  console.log(`Đến ngày: ${new Date(end * 1000).toLocaleDateString("vi-VN")}`);
  console.log(`Tổng phí ship thu của khách: ${shippingFee.toLocaleString()} VND`);
}

main();
