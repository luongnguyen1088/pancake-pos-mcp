import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);
  
  const stocktakingId = "718a147f-8d18-4edd-b1bc-9a0a045b2f9e";
  console.log(`Fetching details of stocktaking ${stocktakingId}...`);

  try {
    const res = await client.get<any>(`stocktakings/${stocktakingId}`);
    console.log("Response:");
    console.log(JSON.stringify(res, null, 2));
  } catch (error) {
    console.error("Failed to fetch stocktaking:", error);
  }
}

main();
