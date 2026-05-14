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

  // Trying to match the Dashboard's "Doanh thu"
  // Let's fetch all non-cancelled orders and look at their fields
  let allOrders: any[] = [];
  for (let page = 1; page <= 3; page++) {
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200,
      fields: ["id", "total_price", "status", "cod", "prepaid", "shipping_fee", "discount", "deposited_amount", "extend_data"]
    });
    allOrders = allOrders.concat(result.data);
    if (result.data.length < 200) break;
  }

  const closedOrders = allOrders.filter(o => o.status !== 6);
  console.log(`Closed Orders for Shop BB: ${closedOrders.length}`);

  let sumTotalPrice = 0;
  let sumCod = 0;
  let sumPrepaid = 0;
  let sumShipping = 0;
  let sumDiscount = 0;
  let sumDeposited = 0;

  for (const o of closedOrders) {
    sumTotalPrice += (o.total_price || 0);
    sumCod += (o.cod || 0);
    sumPrepaid += (o.prepaid || 0);
    sumShipping += (o.shipping_fee || 0);
    sumDiscount += (o.discount || 0);
    sumDeposited += (o.deposited_amount || 0);
  }

  console.log(`\n--- PHÂN TÍCH DOANH THU SHOP BB (CHỈ ĐƠN CHỐT) ---`);
  console.log(`Số lượng đơn chốt: ${closedOrders.length}`);
  console.log(`1. Tổng giá trị sản phẩm (total_price): ${sumTotalPrice.toLocaleString()} VND`);
  console.log(`2. Tổng COD: ${sumCod.toLocaleString()} VND`);
  console.log(`3. Tổng Trả trước (prepaid): ${sumPrepaid.toLocaleString()} VND`);
  console.log(`4. Tổng Cọc (deposited_amount): ${sumDeposited.toLocaleString()} VND`);
  console.log(`5. Tổng Phí ship: ${sumShipping.toLocaleString()} VND`);
  console.log(`6. Tổng Giết khấu: ${sumDiscount.toLocaleString()} VND`);
  
  console.log(`\nTổng hợp thực thu (COD + Trả trước): ${(sumCod + sumPrepaid).toLocaleString()} VND`);
  console.log(`Tổng hợp giá trị (Total Price + Ship): ${(sumTotalPrice + sumShipping).toLocaleString()} VND`);
}

main();
