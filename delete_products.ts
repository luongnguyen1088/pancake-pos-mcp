import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import * as fs from 'fs';

const config = {
  PANCAKE_POS_API_KEY: "f5c53445bad742e086d24c2361a56fa1",
  PANCAKE_POS_SHOP_ID: "1328353673",
  PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
};

const client = new PancakeHttpClient(config as any);

async function deleteAllProducts() {
  const backupPath = "pancake_products_backup.json";
  if (!fs.existsSync(backupPath)) {
    console.error("Backup file not found. Aborting deletion for safety.");
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  const total = products.length;
  console.log(`Starting deletion of ${total} products...`);

  let count = 0;
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await Promise.all(batch.map(async (product: any) => {
      const id = product.id;
      try {
        await client.delete(`products/${id}`);
        count++;
      } catch (error) {
        console.error(`Failed to delete product ${id}:`, error);
      }
    }));
    
    if (count % 20 === 0 || count >= total - batchSize) {
      console.log(`Progress: ${count}/${total} products deleted.`);
    }
  }

  console.log(`Deletion complete. ${count} products removed.`);
}

deleteAllProducts();
