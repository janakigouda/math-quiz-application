import fs from "fs/promises";
const file = "./scores.json";

async function read() {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch {
    return { users: {} };
  }
}

async function write(data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function getScores() {
  const data = await read();
  return data.users || {};
}

export async function incrementScore(username) {
  const data = await read();
  data.users[username] = (data.users[username] || 0) + 1;
  await write(data);
}
