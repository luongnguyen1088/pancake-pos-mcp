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
  for (let page = 1; page <= 3; page++) {
    const result = await client.getList("orders", {
      startDateTime: start,
      endDateTime: end,
      page_number: page,
      page_size: 200,
      fields: ["id", "status", "total_price", "cod", "prepaid", "line_items", "shipping_fee", "discount"]
    });
    allOrders = allOrders.concat(result.data);
    if (result.data.length < 200) break;
  }

  const closedOrders = allOrders.filter(o => o.status !== 6);
  
  let totalProducts = 0;
  let totalGrossValue = 0; // Sum of price * quantity

  for (const o of closedOrders) {
    if (o.line_items) {
      for (const item of o.line_items) {
        totalProducts += (item.quantity || 0);
        totalGrossValue += (item.price || 0) * (item.quantity || 0);
      }
    }
  }

  console.log(`--- PHÂN TÍCH CHI TIẾT SẢN PHẨM SHOP BB ---`);
  console.log(`Số đơn chốt: ${closedOrders.length}`);
  console.log(`Tổng số lượng sản phẩm: ${totalProducts}`);
  console.log(`Tổng giá trị niêm yết (Gross Value): ${totalGrossValue.toLocaleString()} VND`);
  console.log(`Doanh thu Net (COD + Prepaid): ${closedOrders.reduce((acc, o) => acc + (o.cod || 0) + (o.prepaid || 0), 0).toLocaleString()} VND`);
}

main();
