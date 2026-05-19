import { PancakeHttpClient } from "./api-client/pancake-http-client.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const client = new PancakeHttpClient(config);
  
  const stocktakingId = "718a147f-8d18-4edd-b1bc-9a0a045b2f9e";
  
  // Method 1: PUT /stocktakings/:id/status
  console.log("Trying PUT /stocktakings/:id/status...");
  try {
    const res = await client.put<any>(`stocktakings/${stocktakingId}/status`, { status: 1 });
    console.log("Success:", res);
    return;
  } catch (e: any) {
    console.log("Failed Method 1:", e.message);
  }

  // Method 2: POST /stocktakings/:id/approve
  console.log("\nTrying POST /stocktakings/:id/approve...");
  try {
    const res = await client.post<any>(`stocktakings/${stocktakingId}/approve`, {});
    console.log("Success:", res);
    return;
  } catch (e: any) {
    console.log("Failed Method 2:", e.message);
  }

  // Method 3: PUT /stocktakings/:id (with just status: 1 unwrapped)
  console.log("\nTrying PUT /stocktakings/:id with unwrapped status...");
  try {
    const res = await client.put<any>(`stocktakings/${stocktakingId}`, { status: 1 });
    console.log("Success:", res);
    return;
  } catch (e: any) {
    console.log("Failed Method 3:", e.message);
  }
}

main();
