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

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 200
  });

  const order92792 = result.data.find((o: any) => o.id === 92792);
  const order92619 = result.data.find((o: any) => o.id === 92619);

  console.log("ORDER 92792:");
  console.log(JSON.stringify(order92792, null, 2));
  console.log("\nORDER 92619:");
  console.log(JSON.stringify(order92619, null, 2));
}

main();
