import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { handleAnalyticsTool } from "./src/tools/analytics-tool.js";
import { loadConfig } from "./src/config.js";

async function main() {
  try {
    const config = loadConfig();
    const client = new PancakeHttpClient(config);

    // Yesterday 2026-05-13 in GMT+7
    // Using explicit dates to be sure
    const start = Math.floor(new Date("2026-05-13T00:00:00+07:00").getTime() / 1000);
    const end = Math.floor(new Date("2026-05-13T23:59:59+07:00").getTime() / 1000);

    console.log(`Fetching revenue for period: 2026-05-13 00:00:00 to 23:59:59 (GMT+7)`);
    console.log(`Timestamps: ${start} - ${end}`);

    const result = await client.getList("orders", {
      page_number: 1,
      page_size: 1,
      fields: ["id"],
      startDateTime: start,
      endDateTime: end,
    });

    console.log("--- FULL AGGREGATIONS ---");
    console.log(JSON.stringify(result.aggs, null, 2));

    const analyticsResult = await handleAnalyticsTool({
      action: "revenue_summary",
      startDateTime: start,
      endDateTime: end
    }, client);

    console.log("--- REVENUE SUMMARY ---");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching revenue:", error);
  }
}

main();
