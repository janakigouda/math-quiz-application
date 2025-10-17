import { randomInt } from "crypto";
const ops = [
  { symbol: "+", fn: (a,b)=>a+b },
  { symbol: "-", fn: (a,b)=>a-b },
  { symbol: "*", fn: (a,b)=>a*b },
];

export function generateQuestion() {
  const a = randomInt(1, 21);
  const b = randomInt(1, 21);
  const op = ops[randomInt(0, ops.length)];
  const left = op.symbol === "-" && a < b ? b : a;
  const right = op.symbol === "-" && a < b ? a : b;
  return { id: Date.now(), text: `${left} ${op.symbol} ${right}`, answer: op.fn(left, right) };
}
