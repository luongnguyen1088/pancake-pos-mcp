import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: config.PANCAKE_POS_API_KEY_2,
    PANCAKE_POS_SHOP_ID: config.PANCAKE_POS_SHOP_ID_2,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  // Search by customer name "Thảo" and date range
  const start = Math.floor(new Date("2026-04-14").getTime() / 1000);
  const end = Math.floor(new Date("2026-04-16").getTime() / 1000);

  const result = await client.getList("orders", {
    startDateTime: start,
    endDateTime: end,
    page_size: 200,
  });
  
  const matches = result.data.filter((o: any) => o.customer?.name?.includes("Thảo"));
  console.log(`Found ${matches.length} matches for 'Thảo'`);
  matches.forEach((o: any) => {
    console.log(`ID: ${o.id}, Display ID: ${o.display_id}, Date: ${o.inserted_at}, Fee: ${o.partner_fee}`);
  });
}

main();
