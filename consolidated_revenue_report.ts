import { PancakeHttpClient } from "./src/api-client/pancake-http-client.js";
import { handleAnalyticsTool } from "./src/tools/analytics-tool.js";
import { loadConfig } from "./src/config.js";

async function getRevenueForShop(apiKey: string, shopId: string, name: string) {
  const client = new PancakeHttpClient({
    PANCAKE_POS_API_KEY: apiKey,
    PANCAKE_POS_SHOP_ID: shopId,
    PANCAKE_POS_BASE_URL: "https://pos.pages.fm/api/v1"
  } as any);

  // Yesterday 2026-05-13 in GMT+7
  const start = Math.floor(new Date("2026-05-13T00:00:00+07:00").getTime() / 1000);
  const end = Math.floor(new Date("2026-05-13T23:59:59+07:00").getTime() / 1000);

  try {
    const result = await handleAnalyticsTool({
      action: "revenue_summary",
      startDateTime: start,
      endDateTime: end
    }, client);
    return { name, success: true, ...result };
  } catch (error) {
    return { name, success: false, error: (error as Error).message };
  }
}

async function main() {
  const config = loadConfig();
  const shops = [
    { key: config.PANCAKE_POS_API_KEY, id: config.PANCAKE_POS_SHOP_ID, name: config.PANCAKE_POS_SHOP_NAME },
  ];

  if (config.PANCAKE_POS_API_KEY_2 && config.PANCAKE_POS_SHOP_ID_2) {
    shops.push({ 
      key: config.PANCAKE_POS_API_KEY_2, 
      id: config.PANCAKE_POS_SHOP_ID_2, 
      name: config.PANCAKE_POS_SHOP_NAME_2 
    });
  }

  console.log(`📊 BÁO CÁO DOANH THU NGÀY 13/05/2026 (GMT+7)\n`);

  let totalRevenue = 0;
  let totalOrders = 0;

  for (const shop of shops) {
    const report = await getRevenueForShop(shop.key, shop.id, shop.name);
    if (report.success) {
      const revenue = (report.revenue_cod || 0) + (report.prepaid || 0);
      totalRevenue += revenue;
      totalOrders += report.total_orders || 0;

      console.log(`📌 ${report.name}:`);
      console.log(`   - Tổng đơn: ${report.total_orders}`);
      console.log(`   - Doanh thu: ${revenue.toLocaleString()} VND`);
      console.log(`   - COD: ${(report.revenue_cod || 0).toLocaleString()} VND`);
      console.log(`   - Trả trước: ${(report.prepaid || 0).toLocaleString()} VND`);
      console.log(`   - Phí ship đối tác: ${(report.partner_fee || 0).toLocaleString()} VND`);
      console.log(`   ----------------------------`);
    } else {
      console.log(`📌 ${shop.name}: LỖI - ${report.error}`);
    }
  }

  console.log(`\n🔥 TỔNG CỘNG DOANH THU: ${totalRevenue.toLocaleString()} VND`);
  console.log(`📈 TỔNG CỘNG ĐƠN HÀNG: ${totalOrders}`);
}

main();
