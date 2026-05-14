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
  for (let p = 1; p <= 3; p++) {
    const res = await client.getList("orders", { startDateTime: start, endDateTime: end, page_number: p, page_size: 200 });
    allOrders = allOrders.concat(res.data);
    if (res.data.length < 200) break;
  }

  const orderIds = [92792, 92619];
  const targetOrders = allOrders.filter(o => orderIds.includes(o.id));

  targetOrders.forEach(o => {
    console.log(`\n========================================`);
    console.log(`ĐƠN HÀNG ID: ${o.id}`);
    console.log(`Mã hiển thị: ${o.display_id || 'N/A'}`);
    console.log(`Khách hàng: ${o.bill_full_name || o.customer?.name} - SĐT: ${o.bill_phone_number || 'N/A'}`);
    console.log(`Địa chỉ: ${o.customer?.full_address || 'N/A'}`);
    console.log(`Ghi chú: ${o.note || o.note_print || 'N/A'}`);
    console.log(`Trạng thái: ${o.status_name || o.status}`);
    console.log(`Phí thu khách: ${o.shipping_fee.toLocaleString()} VND`);
    console.log(`Phí trả đối tác: ${o.partner_fee.toLocaleString()} VND`);
    console.log(`Sản phẩm:`);
    o.items.forEach((item: any) => {
        const name = item.variation_info?.name || item.product_name || 'N/A';
        console.log(` - ${name} | SL: ${item.quantity} | Khối lượng: ${item.variation_info?.weight || 0}g`);
    });
  });
}

main();
