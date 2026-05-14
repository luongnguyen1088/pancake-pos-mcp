import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const apiKey = config.PANCAKE_POS_API_KEY; // Shop POD key

  const baseUrl = "https://pos.pages.fm/api/v1";
  
  try {
    const res = await fetch(`${baseUrl}/shops?api_key=${apiKey}`);
    const data = await res.json();
    console.log("Accessible shops for POD key:", JSON.stringify(data.shops.map((s: any) => ({id: s.id, name: s.name})), null, 2));
  } catch (e) {
    console.log("Could not list shops for POD key.");
  }
}

main();
