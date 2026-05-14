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

  const res = await client.getList("orders", { startDateTime: start, endDateTime: end, page_size: 200 });
  const targetOrders = res.data.filter((o: any) => [92792, 92619].includes(o.id));

  targetOrders.forEach(o => {
    console.log(`ID: ${o.id} | Giá trị đơn hàng: ${o.total_price.toLocaleString()} VND`);
  });
}

main();
