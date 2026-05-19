import { readFileSync } from "fs";

function main() {
  const content = readFileSync("docs/poscake-api-docs.md", "utf-8");
  const lines = content.split("\n");
  
  console.log("Searching for PUT or PATCH endpoints...");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("PUT") || line.includes("PATCH") || line.includes("update") || line.includes("sửa")) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  }
}

main();
