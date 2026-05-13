import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import * as fs from 'fs';

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function exportAllProducts() {
  const allProducts: any[] = [];
  let page = 1;
  let totalPages = 1;

  console.log("Starting export...");

  try {
    do {
      console.log(`Fetching page ${page}...`);
      const result = await client.getList("products", { page, page_size: 50 });
      if (result.data) {
        allProducts.push(...result.data);
      }
      totalPages = result.total_pages || 1;
      page++;
    } while (page <= totalPages);

    const backupPath = "pancake_products_backup.json";
    fs.writeFileSync(backupPath, JSON.stringify(allProducts, null, 2), 'utf-8');
    console.log(`Successfully exported ${allProducts.length} products to ${backupPath}`);
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

exportAllProducts();
