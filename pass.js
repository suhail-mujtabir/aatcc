// genPasswords.js
const fs = require("fs");
const csv = require("csv-parser"); // npm i csv-parser
const crypto = require("crypto");

function genPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pw = "";
  while (pw.length < len) {
    const b = crypto.randomBytes(1)[0];
    const idx = b % chars.length;
    pw += chars.charAt(idx);
  }
  return pw;
}

const input = "userId.csv";
const output = "students.csv";
const rows = [];

fs.createReadStream(input)
  .pipe(csv())
  .on("data", (data) => {
    rows.push(data);
  })
  .on("end", () => {
    const out = [];
    out.push("userId,password");
    for (const r of rows) {
      const userId = r.userId || r.userID || r.UserId;
      if (!userId) continue;
      const pw = genPassword(12);
      out.push(`${userId},${pw}`);
    }
    fs.writeFileSync(output, out.join("\n"), "utf8");
    console.log("Wrote", output);
  });
