import { readFileSync } from 'fs';

try {
  const fileContent = readFileSync('c:\\Users\\ADMIN\\Desktop\\Code\\Antigravity 2026\\00.MCP\\pancake-pos-mcp\\docs\\pancake-openapi-spec.json', 'utf8');
  const spec = JSON.parse(fileContent);
  const paths = Object.keys(spec.paths || {});
  
  console.log('Total paths found:', paths.length);
  
  const stocktakingPaths = paths.filter(p => p.includes('stocktaking'));
  console.log('Stocktaking paths:', stocktakingPaths);
  
  const inventoryPaths = paths.filter(p => p.includes('inventory'));
  console.log('Inventory paths:', inventoryPaths);

  const purchasePaths = paths.filter(p => p.includes('purchase'));
  console.log('Purchase paths:', purchasePaths);
  
  // print a sample of 20 paths
  console.log('Sample paths:', paths.slice(0, 30));
} catch (error: any) {
  console.error('Error:', error.message);
}
