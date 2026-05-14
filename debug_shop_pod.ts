import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  const start = Math.floor(new Date("2026-05-13T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-13T23:59:59+07:00").getTime() / 1000);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 1,
    fields: ["id"]
  });

  console.log("Shop POD Total entries:", result.total_entries);
  console.log("Status Breakdown:");
  console.log(JSON.stringify(result.aggs?.status, null, 2));
}

main();
