import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";
import * as fs from 'fs';

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

  while (hasMore && page <= 50) { // Safety limit 10k orders
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200,
      fields: ["id", "inserted_at", "partner_fee", "shipping_fee", "customer_name", "status"]
    });

    const partnerOrders = result.data.filter((o: any) => (o.partner_fee || 0) > 0);
    allPartnerOrders = allPartnerOrders.concat(partnerOrders);

    console.log(`Trang ${page}: Tìm thấy ${partnerOrders.length} đơn có phí đối tác. Tổng cộng: ${allPartnerOrders.length}`);

    if (result.data.length < 200) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Create CSV content
  const header = "ID Đơn,Ngày Tạo,Khách Hàng,Trạng Thái,Phí Thu Khách,Phí Trả Đối tác\n";
  const rows = allPartnerOrders.map(o => {
    return `${o.id},${o.inserted_at},"${o.customer_name || ''}",${o.status},${o.shipping_fee || 0},${o.partner_fee || 0}`;
  }).join("\n");

  const fileName = "danh_sach_phi_ship_doi_tac_30_ngay.csv";
  fs.writeFileSync(fileName, "\ufeff" + header + rows); // Add BOM for Excel Vietnamese support

  console.log(`\n✅ Đã trích xuất xong ${allPartnerOrders.length} đơn hàng.`);
  console.log(`📁 Tệp kết quả: ${fileName}`);
  
  const totalPartnerFee = allPartnerOrders.reduce((acc, o) => acc + (o.partner_fee || 0), 0);
  console.log(`Tổng phí đối tác trong tệp: ${totalPartnerFee.toLocaleString()} VND`);
}

main();
