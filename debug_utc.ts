import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  // UTC Yesterday
  const start = Math.floor(new Date("2026-05-13T00:00:00Z").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-13T23:59:59Z").getTime() / 1000);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 1,
    fields: ["id"]
  });

  console.log("Total entries (UTC range):", result.total_entries);
  console.log("Aggregations (UTC range):");
  console.log(JSON.stringify(result.aggs, null, 2));
}

main();
