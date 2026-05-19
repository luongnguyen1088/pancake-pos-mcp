import { readFileSync } from "fs";

function main() {
  const content = readFileSync("docs/poscake-api-docs.md", "utf-8");
  const lines = content.split("\n");
  
  console.log("Searching for stocktaking related lines...");
  let found = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toLowerCase().includes("stock") || line.toLowerCase().includes("kho") || line.toLowerCase().includes("duyet") || line.toLowerCase().includes("duyệt")) {
      console.log(`${i + 1}: ${line.trim()}`);
      found++;
      if (found > 100) {
        console.log("...truncated search results...");
        break;
      }
    }
  }
}

main();
