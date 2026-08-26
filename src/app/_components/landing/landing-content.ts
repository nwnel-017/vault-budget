export const categories = [
  { name: "Groceries", amount: "$420", goal: "$500 goal", progress: 84 },
  { name: "Housing", amount: "$1,250", goal: "Monthly total", progress: 100 },
  { name: "Transport", amount: "$185", goal: "$250 goal", progress: 74 },
  { name: "Dining", amount: "$210", goal: "$300 goal", progress: 70 },
] as const;

export const transactions = [
  { merchant: "Fresh Market", amount: "−$64.20", category: "Groceries" },
  { merchant: "Metro Transit", amount: "−$28.00", category: "Transport" },
  { merchant: "Corner Cafe", amount: "−$18.40", category: "Dining" },
] as const;

export const workflowSteps = [
  {
    number: "01",
    title: "Upload your transactions",
    description:
      "Export a supported CSV from your bank, then map the date, merchant, and amount columns so FlowVault can organize it.",
    preview: "mapping",
  },
  {
    number: "02",
    title: "Review and categorize",
    description:
      "Organize expenses into categories that make sense to you. FlowVault remembers your choices to reduce repeat work on future imports.",
    preview: "review",
  },
  {
    number: "03",
    title: "Track spending and goals",
    description:
      "See spending summaries, monitor top categories, and compare your progress with category and savings goals.",
    preview: "summary",
  },
] as const;

export const features = [
  {
    marker: "Rule applied",
    title: "Categorize faster over time",
    description: "Reuse learned category rules for similar future transactions instead of starting over with every import.",
    proof: "Fresh Market → Groceries",
  },
  {
    marker: "May 1–31",
    title: "See spending by date range",
    description: "Review totals and top spending categories for the period that matters to your budget.",
    proof: "$2,480 total spending",
  },
  {
    marker: "84% used",
    title: "Set category spending goals",
    description: "Give categories clear targets and compare actual spending with your monthly plan.",
    proof: "Groceries  $420 / $500",
  },
  {
    marker: "60% complete",
    title: "Keep savings visible",
    description: "Set a savings goal and review average monthly savings across a selected range.",
    proof: "$600 / $1,000 goal",
  },
] as const;

export const faqs = [
  {
    question: "Do I need to connect my bank account?",
    answer: "No. FlowVault uses transaction files that you choose to export and upload, so it does not require a live connection to your bank account.",
  },
  {
    question: "How do I import transactions?",
    answer: "Export a supported CSV transaction file from your bank, upload it to FlowVault, and confirm how its columns map before reviewing the transactions.",
  },
  {
    question: "Which columns does my CSV need?",
    answer: "FlowVault's import workflow maps a purchase date, merchant, and amount. You can review the mapping before the transactions are added.",
  },
  {
    question: "How does automatic categorization work?",
    answer: "When you categorize a transaction, FlowVault can reuse that choice as a rule for similar transactions in future imports. You stay in control during review.",
  },
  {
    question: "Can I create categories and goals?",
    answer: "Yes. You can organize spending with your own categories, set category spending goals, and keep a savings goal visible alongside your progress.",
  },
] as const;
