import { bvbIndexSmall, unitsNextBuy } from "./bvb.js";
import { startws } from "./tradeville.js";

/**
 * Entry point apelat din server.js
 */
export const webMain = async (config) => {
  console.log("▶ webMain START");

  const {
    username,
    password,
    moneyToSpend,
    minOrder,
    feePerOrder
  } = config;

  if (!username || !password) {
    throw new Error("User sau parolă lipsă");
  }

  // 1️⃣ Citește ponderile BET
  console.log("▶ Citesc ponderile BET");
  const bet = await bvbIndexSmall("BET");

  if (!bet || bet.length === 0) {
    throw new Error("Nu am putut citi indicele BET");
  }
  console.log(`✔ BET citit (${bet.length} simboluri)`);

  // 2️⃣ Login + portofoliu TradeVille
  console.log("▶ Login TradeVille + portofoliu");
  const portfolio = await startws({ username, password });

  if (!portfolio || !portfolio.Symbol) {
    throw new Error("Portofoliu TradeVille invalid");
  }
  console.log(`✔ Portofoliu primit (${portfolio.Symbol.length} poziții)`);

  // 3️⃣ Construire date pentru calcul
  console.log("▶ Construiesc datele pentru calcul");

  const weights = [];
  const prices = [];
  const quantities = [];
  const rows = [];

  let totalInvestment = 0;

  for (const item of bet) {
    const symbol = item[1];
    const weight = Number(item[3]);

    const idx = portfolio.Symbol.indexOf(symbol);
    if (idx === -1) {
      // simbol din BET pe care nu-l ai în portofoliu
      continue;
    }

    const quantity = Number(portfolio.Quantity[idx]);
    const marketPrice = Number(portfolio.MarketPrice[idx]);

    const investment = quantity * marketPrice;

    weights.push(weight);
    prices.push(marketPrice);
    quantities.push(quantity);
    totalInvestment += investment;

    rows.push({
      symbol,
      name: item[2],
      targetWeight: weight,
      quantity,
      marketPrice,
      investment
    });
  }

  if (rows.length === 0) {
    throw new Error("Nu există simboluri comune BET ↔ portofoliu");
  }

  console.log(`✔ Date pregătite (${rows.length} poziții)`);

  // 4️⃣ Calcul rebalansare
  console.log("▶ Calculez unitsNextBuy");

  const unitsNext = unitsNextBuy(
    prices,
    weights,
    quantities,
    Number(moneyToSpend),
    Number(minOrder),
    Number(feePerOrder)
  );

  console.log("✔ Calcul finalizat");

  // 5️⃣ Completare rezultate
  rows.forEach((row, i) => {
    row.unitsNextBuy = unitsNext[i] || 0;
    row.valueNextBuy = row.unitsNextBuy * row.marketPrice;
    row.actualWeight =
      totalInvestment > 0
        ? (row.investment * 100) / totalInvestment
        : 0;
    row.weightDiff = row.actualWeight - row.targetWeight;
  });

  // 6️⃣ CSV
  console.log("▶ Generez CSV");
  const csv = toCSV(rows);
  console.log("✔ CSV generat");

  console.log("▶ webMain END");
  return csv;
};

/**
 * Helper CSV
 */
function toCSV(rows) {
  const columns = [
    "symbol",
    "name",
    "targetWeight",
    "quantity",
    "marketPrice",
    "investment",
    "actualWeight",
    "weightDiff",
    "unitsNextBuy",
    "valueNextBuy"
  ];

  const header = columns.join(",");

  const body = rows
    .map(row =>
      columns
        .map(col => `"${row[col] ?? ""}"`)
        .join(",")
    )
    .join("\n");

  return header + "\n" + body;
}
