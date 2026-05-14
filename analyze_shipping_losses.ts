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

  let allPartnerOrders: any[] = [];
  let page = 1;
  let hasMore = true;

  console.log("Đang quét dữ liệu đơn hàng 30 ngày qua...");

  while (hasMore && page <= 50) {
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200,
      fields: ["id", "inserted_at", "partner_fee", "shipping_fee", "customer_name", "status"]
    });
    const partnerOrders = result.data.filter((o: any) => (o.partner_fee || 0) > 0);
    allPartnerOrders = allPartnerOrders.concat(partnerOrders);
    if (result.data.length < 200) hasMore = false;
    else page++;
  }

  // Calculate loss and sort
  const lossOrders = allPartnerOrders
    .map(o => ({
      ...o,
      loss: (o.shipping_fee || 0) - (o.partner_fee || 0)
    }))
    .filter(o => o.loss < 0)
    .sort((a, b) => a.loss - b.loss); // Most negative first

  console.log(`--- DANH SÁCH ĐƠN HÀNG BÙ LỖ SHIP NẶNG NHẤT (30 NGÀY QUA) ---`);
  console.log(`| Rank | ID Đơn | Ngày Tạo | Khách Hàng | Phí Thu Khách | Phí Trả Đối Tác | Mức Bù Lỗ |`);
  console.log(`|------|--------|----------|------------|---------------|-----------------|-----------|`);
  
  lossOrders.slice(0, 25).forEach((o, i) => {
    console.log(`| ${i+1} | ${o.id} | ${o.inserted_at.split('T')[0]} | ${o.customer_name || 'N/A'} | ${o.shipping_fee.toLocaleString()} | ${o.partner_fee.toLocaleString()} | ${o.loss.toLocaleString()} |`);
  });

  const totalLoss = lossOrders.reduce((acc, o) => acc + o.loss, 0);
  console.log(`\nTổng số đơn bù lỗ: ${lossOrders.length}`);
  console.log(`Tổng tiền bù lỗ ship trong 30 ngày: ${totalLoss.toLocaleString()} VND`);
}

main();
