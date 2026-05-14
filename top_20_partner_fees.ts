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

  // Sort by partner_fee DESC
  const top20 = allPartnerOrders
    .sort((a, b) => (b.partner_fee || 0) - (a.partner_fee || 0))
    .slice(0, 20);

  console.log(`--- TOP 20 ĐƠN HÀNG CÓ PHÍ SHIP ĐỐI TÁC CAO NHẤT (30 NGÀY QUA) ---`);
  console.log(`| Rank | ID Đơn | Ngày Tạo | Khách Hàng | Phí Trả Đối Tác | Phí Thu Khách | Lỗ/Lãi Ship |`);
  console.log(`|------|--------|----------|------------|-----------------|---------------|-------------|`);
  
  top20.forEach((o, i) => {
    const diff = (o.shipping_fee || 0) - (o.partner_fee || 0);
    const diffStr = diff >= 0 ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`;
    console.log(`| ${i+1} | ${o.id} | ${o.inserted_at.split('T')[0]} | ${o.customer_name || 'N/A'} | ${o.partner_fee.toLocaleString()} | ${o.shipping_fee.toLocaleString()} | ${diffStr} |`);
  });
}

main();
