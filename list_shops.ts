import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { loadConfig } from "./src/config.js";

async function main() {
  const config = loadConfig();
  const apiKey = config.PANCAKE_POS_API_KEY_2;

  // The Pancake POS API usually requires a shop ID in the URL.
  // But maybe there is a global endpoint.
  // We'll try to guess based on standard Pancake patterns.
  
  const baseUrl = "https://pos.pages.fm/api/v1";
  
  try {
    const res = await fetch(`${baseUrl}/shops?api_key=${apiKey}`);
    const data = await res.json();
    console.log("Accessible shops:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Could not list shops.");
  }
}

main();
