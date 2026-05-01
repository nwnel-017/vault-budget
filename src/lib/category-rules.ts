// helper function - just returns the first meaningful token for now
// TO DO - investigate this - we returned 'purchase' as pattern for costco

// TO DO - we should check if the first token is generic (less than 4 characters) - include first two tokens if it is
// TO DO - improve token matching
export function generateCategoryRule(
  transactionDesc: string,
  categoryId: string,
) {
  if (!transactionDesc || !categoryId) return "";

  const tokens = getMeaningfulTokens(transactionDesc);

  // No useful tokens means we should not save a rule.
  if (tokens.length === 0) return "";

  // If there is only one useful token, use it as the rule.
  if (tokens.length === 1) return tokens[0];

  // Short leading tokens are too broad, so include the next token too.
  if (tokens[0].length <= 3) {
    return `${tokens[0]} ${tokens[1]}`;
  }

  return tokens[0];
}

// 1.) normalizes description
// 2.) splits into tokens and removes whitespace
// 3.) removes generic common words
// 4.) removes numeric or alpha numeric tokens
// 5.) returns a new pattern that has an extra token from the existing pattern
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

type CategoryRuleMatch = {
  id: string;
  pattern: string;
  category_id: string;
};

// we will take in the transaction description and list of category rules that were found for the user
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

  const descTokens = normalizedDesc.split(" ").filter(Boolean);

  // Check longer patterns first so more specific rules win before broad ones.
  const sortedRules = [...transactionRules].sort((firstRule, secondRule) => {
    const firstRuleLength = firstRule.pattern.split(" ").filter(Boolean).length;
    const secondRuleLength = secondRule.pattern
      .split(" ")
      .filter(Boolean).length;

    return secondRuleLength - firstRuleLength;
  });

  const matchedRule = sortedRules.find((rule) => {
    if (!rule.pattern) return false;

    const ruleTokens = rule.pattern.split(" ").filter(Boolean);

    if (!ruleTokens.length) return false;

    // Old behavior matched any substring inside the normalized description.
    // return normalizedDesc.includes(rule.pattern);

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

  // we are calling this twice?
  return normalizeDescription(transactionDesc)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !stopWords.has(token))
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => !/^[a-z]*\d+[a-z\d]*$/i.test(token))
    .filter((token) => token.length >= 3);
}
