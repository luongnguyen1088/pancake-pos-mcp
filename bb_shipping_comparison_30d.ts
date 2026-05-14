import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const end = Math.floor(new Date().getTime() / 1000);
  const start = end - (30 * 24 * 60 * 60);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    action: "revenue_summary",
    page_size: 1
  });

  const shippingFeeFromCustomer = result.aggs?.shipping_fee?.value || 0;
  const partnerFeePaid = result.aggs?.partner_fee?.value || 0;
  const difference = shippingFeeFromCustomer - partnerFeePaid;
  
  console.log(`--- SO SÁNH PHÍ VẬN CHUYỂN SHOP BB (30 NGÀY QUA) ---`);
  console.log(`1. Phí thu từ khách hàng:  ${shippingFeeFromCustomer.toLocaleString()} VND`);
  console.log(`2. Phí trả cho vận chuyển: ${partnerFeePaid.toLocaleString()} VND`);
  console.log(`--------------------------------------------------`);
  
  if (difference >= 0) {
    console.log(`✅ Kết quả: Shop đang DƯ ${difference.toLocaleString()} VND từ phí ship.`);
  } else {
    console.log(`⚠️ Kết quả: Shop đang BÙ LỖ ${Math.abs(difference).toLocaleString()} VND tiền ship.`);
  }
}

main();
