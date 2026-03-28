// helper function - just returns the first meaningful token for now
// TO DO - investigate this - we returned 'purchase' as pattern for costco
export function generateCategoryRule(
  transactionDesc: string,
  categoryId: string,
) {
  if (!transactionDesc || !categoryId) return "";

  // logic to generate a pattern to store in category_rules
  // 1.) split transaction into tokens and remove whitespace
  // 2.) remove generic common words
  // 3.) remove numeric or alpha numeric tokens
  // 4.) return the first token with length >= 3

  const stopWords = new Set([
    "pos",
    "debit",
    "credit",
    "purchase",
    "card",
    "visa",
    "mc",
    "checkcard",
    "check",
    "ach",
    "transfer",
    "payment",
    "online",
    "withdrawal",
    "deposit",
    "auth",
    "pending",
    "store",
    "market",
    "service",
  ]);
  const normalizedDesc = normalizeDescription(transactionDesc);

  const tokens = normalizedDesc
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !stopWords.has(t))
    .filter((t) => !/^\d+$/.test(t))
    .filter((t) => !/^[a-z]*\d+[a-z\d]*$/i.test(t))
    .filter((t) => t.length >= 3);

  return tokens[0] || "";
}

type CategoryRuleMatch = {
  pattern: string;
  category_id: string;
};

// we will take in the transactiond description and list of category rules that were found for the user
// we will search the transaction rules to find one where our transactionDesc includes the pattern
// if we find a match - we return the category id to be inserted into the transaction
// if not - we return null and the transaction will be uncategorized
export function matchTransactionCategory(
  transactionDesc: string,
  transactionRules: CategoryRuleMatch[],
) {
  if (!transactionDesc || !transactionRules.length) return null;

  const normalizedDesc = normalizeDescription(transactionDesc);

  if (!normalizedDesc) return null;

  const matchedRule = [...transactionRules]
    .filter((rule) => rule.pattern)
    .sort((a, b) => b.pattern.length - a.pattern.length)
    .find((rule) => normalizedDesc.includes(rule.pattern));

  return matchedRule?.category_id ?? null;
}

export function normalizeDescription(description: string) {
  if (!description) return "";

  return description
    .toLowerCase()
    .trim()
    .replace(/\*/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(
      /\b(pos|debit|purchase|card|visa|mc|checkcard|check|ach|transfer)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}
