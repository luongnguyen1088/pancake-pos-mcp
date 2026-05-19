import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);
  
  console.log("Fetching list of stocktaking sheets...");
  try {
    const res = await client.get<any>("stocktakings");
    console.log("Response:");
    console.log(JSON.stringify(res, null, 2));
  } catch (error) {
    console.error("Failed to fetch stocktakings:", error);
  }
}

main();
