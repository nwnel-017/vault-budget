export function generateCategoryRule(transactionDesc: string) {
  if (!transactionDesc) return "";

  const tokens = getMeaningfulTokens(transactionDesc);

  if (tokens.length === 0) return "";

  if (tokens.length === 1) return tokens[0];

  if (tokens[0].length <= 3) {
    return `${tokens[0]} ${tokens[1]}`;
  }

  return tokens[0];
}

export function updateTransactionRule(
  currentPattern: string,
  newTransactionDesc: string,
) {
  if (!currentPattern || !newTransactionDesc) return "";

  const normalizedCurrentPattern = normalizeDescription(currentPattern);

  if (!normalizedCurrentPattern) return "";

  const oldTokenLength = normalizedCurrentPattern
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean).length;

  if (!oldTokenLength) return "";

  const tokens = getMeaningfulTokens(newTransactionDesc);
  const newPattern = tokens
    .slice(0, oldTokenLength + 1)
    .join(" ")
    .trim();

  if (!newPattern || newPattern === normalizedCurrentPattern) {
    return "";
  }

  return newPattern;
}

export type CategoryRuleMatch = {
  id: string;
  pattern: string;
  category_id: string;
};

export function matchTransactionCategory(
  transactionDesc: string,
  transactionRules: CategoryRuleMatch[],
) {
  if (!transactionDesc || !transactionRules.length) return null;

  const normalizedDesc = normalizeDescription(transactionDesc);

  if (!normalizedDesc) return null;

  const descTokens = normalizedDesc.split(" ").filter(Boolean);
  const matchedRule = transactionRules.find((rule) => {
    if (!rule.pattern) return false;

    const ruleTokens = rule.pattern.split(" ").filter(Boolean);

    if (!ruleTokens.length) return false;

    return containsTokenPhrase(descTokens, ruleTokens);
  });

  return matchedRule ?? null;
}

function containsTokenPhrase(descTokens: string[], ruleTokens: string[]) {
  for (
    let startIndex = 0;
    startIndex <= descTokens.length - ruleTokens.length;
    startIndex += 1
  ) {
    const candidateTokens = descTokens.slice(
      startIndex,
      startIndex + ruleTokens.length,
    );

    if (candidateTokens.join(" ") === ruleTokens.join(" ")) {
      return true;
    }
  }

  return false;
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

function getMeaningfulTokens(transactionDesc: string) {
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

  return normalizeDescription(transactionDesc)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !stopWords.has(token))
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => !/^[a-z]*\d+[a-z\d]*$/i.test(token))
    .filter((token) => token.length >= 3);
}
