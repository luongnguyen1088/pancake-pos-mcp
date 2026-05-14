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

  let allOrders: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200
    });
    allOrders = allOrders.concat(result.data);
    if (result.data.length < 200) hasMore = false;
    else page++;
  }

  const lossOrders = allOrders
    .map(o => ({
      id: o.id,
      display_id: o.display_id,
      customer_name: o.customer?.name || o.customer_name || "N/A",
      shipping_fee: o.shipping_fee || 0,
      partner_fee: o.partner_fee || 0,
      loss: (o.shipping_fee || 0) - (o.partner_fee || 0),
      status: o.status
    }))
    .filter(o => o.loss < 0 && o.status !== 6) // Only non-cancelled
    .sort((a, b) => a.loss - b.loss);

  console.log(`--- DANH SÁCH ĐƠN HÀNG BÙ LỖ SHIP NGÀY HÔM QUA (13/05) - SHOP BB ---`);
  console.log(`| Mã Đơn (Display ID) | Khách Hàng | Phí Thu Khách | Phí Trả Đối Tác | Mức Bù Lỗ |`);
  console.log(`|-------------------|------------|---------------|-----------------|-----------|`);
  
  lossOrders.forEach(o => {
    console.log(`| ${o.display_id || o.id} | ${o.customer_name} | ${o.shipping_fee.toLocaleString()} | ${o.partner_fee.toLocaleString()} | ${o.loss.toLocaleString()} |`);
  });

  const totalLoss = lossOrders.reduce((acc, o) => acc + o.loss, 0);
  console.log(`\nTổng số đơn bù lỗ ngày hôm qua: ${lossOrders.length}`);
  console.log(`Tổng tiền bù lỗ ship: ${totalLoss.toLocaleString()} VND`);
}

main();
