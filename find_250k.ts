import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const start = Math.floor(new Date("2026-04-14").getTime() / 1000);
  const end = Math.floor(new Date("2026-04-16").getTime() / 1000);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 200,
  });
  
  const match = result.data.find((o: any) => o.partner_fee === 250000);
  if (match) {
    console.log(JSON.stringify(match, null, 2));
  } else {
    console.log("Không tìm thấy đơn phí 250k.");
    console.log("Dữ liệu trang 1 có " + result.data.length + " đơn.");
  }
}

main();
