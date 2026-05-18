"use client";

import { useState } from "react";
import type { AmountMappingMode } from "@/types/upload-actions";
import styles from "./FileConfig.module.css";
import ModeStep from "./_components/ModeStep";
import MultiSelectStep from "./_components/MultiSelectStep";
import OverviewStep from "./_components/OverviewStep";
import SingleSelectStep from "./_components/SingleSelectStep";

export type UploadColumnSelection = {
  merchantField: string;
  amountMappingMode: "SINGLE" | "SPLIT";
  amountField: string | null;
  positiveAmountFields: string[];
  negativeAmountFields: string[];
  dateField: string;
};

type Step =
  | "overview"
  | "mode"
  | "merchant"
  | "amount"
  | "positive"
  | "negative"
  | "date";

type SelectedColumnsState = {
  merchantField: string;
  amountField: string;
  positiveAmountFields: string[];
  negativeAmountFields: string[];
  dateField: string;
};

const INITIAL_SELECTED_COLUMNS: SelectedColumnsState = {
  merchantField: "",
  amountField: "",
  positiveAmountFields: [],
  negativeAmountFields: [],
  dateField: "",
};

const STEP_TITLES: Record<Step, string> = {
  overview: "Before you upload",
  mode: "Are your transaction amounts split across multiple columns?",
  merchant: "Please find the column for: merchant / transaction description",
  amount: "Please find the column for: transaction amount",
  positive: "Select the columns for incoming amounts such as deposits",
  negative:
    "Select the columns for outgoing amounts such as withdrawals, credits, or debits",
  date: "Please choose a column for: date of transaction",
};

const STEP_DESCRIPTIONS: Partial<Record<Step, string[]>> = {
  overview: [
    "Open spreadsheet you uploaded and find the columns that match the transaction description, amount information, and effective date.",
    `${process.env.NEXT_PUBLIC_APP_NAME} will remember your choices for next time, so if your spreadsheet has the same format in the future, you can skip this step.`,
  ],
  mode: [
    "Choose Yes if your file uses separate incoming and outgoing amount columns instead of one column. (Example: separate columns for Credit / Debit / Withdrawal / Deposit)",
  ],
  merchant: ["Example: Costco, Chevron, etc."],
  positive: ["You can choose more than one column for this step."],
  negative: ["You can choose more than one column for this step."],
};

const SINGLE_SELECT_FIELDS = {
  merchant: "merchantField",
  amount: "amountField",
  date: "dateField",
} as const;

const MULTI_SELECT_FIELDS = {
  positive: "positiveAmountFields",
  negative: "negativeAmountFields",
} as const;

export default function FileConfig({
  active,
  headers,
  onComplete,
}: {
  active: boolean;
  headers: string[];
  onComplete: (selectedColumns: UploadColumnSelection) => void;
}) {
  const [amountMappingMode, setAmountMappingMode] =
    useState<AmountMappingMode | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState(
    INITIAL_SELECTED_COLUMNS,
  );

  if (!active) {
    return null;
  }

  const steps: Step[] =
    amountMappingMode === "SPLIT"
      ? ["overview", "merchant", "mode", "positive", "negative", "date"]
      : ["overview", "merchant", "mode", "amount", "date"];

  const currentStep = steps[currentStepIndex];

  function resetFlow() {
    setAmountMappingMode(null);
    setCurrentStepIndex(0);
    setSelectedColumns(INITIAL_SELECTED_COLUMNS);
  }

  function nextStep() {
    setCurrentStepIndex((index) => index + 1);
  }

  function completeFlow(nextSelectedColumns: SelectedColumnsState) {
    if (amountMappingMode === "SPLIT") {
      onComplete({
        merchantField: nextSelectedColumns.merchantField,
        amountMappingMode: "SPLIT",
        amountField: null,
        positiveAmountFields: nextSelectedColumns.positiveAmountFields,
        negativeAmountFields: nextSelectedColumns.negativeAmountFields,
        dateField: nextSelectedColumns.dateField,
      });
    } else {
      onComplete({
        merchantField: nextSelectedColumns.merchantField,
        amountMappingMode: "SINGLE",
        amountField: nextSelectedColumns.amountField,
        positiveAmountFields: [],
        negativeAmountFields: [],
        dateField: nextSelectedColumns.dateField,
      });
    }

    resetFlow();
  }

  function getHeadersInUse() {
    const headersInUse = [
      selectedColumns.merchantField,
      selectedColumns.dateField,
      ...selectedColumns.positiveAmountFields,
      ...selectedColumns.negativeAmountFields,
    ];

    if (amountMappingMode !== "SPLIT") {
      headersInUse.push(selectedColumns.amountField);
    }

    return headersInUse.filter(Boolean);
  }

  function getAvailableHeaders() {
    const headersInUse = getHeadersInUse();

    return headers.filter((header) => {
      if (currentStep === "positive") {
        return !selectedColumns.negativeAmountFields.includes(header);
      }

      if (currentStep === "negative") {
        return !selectedColumns.positiveAmountFields.includes(header);
      }

      return !headersInUse.includes(header);
    });
  }

  function selectMode(mode: AmountMappingMode) {
    setAmountMappingMode(mode);
    nextStep();
  }

  function selectHeader(header: string) {
    if (!(currentStep in SINGLE_SELECT_FIELDS)) {
      return;
    }

    const field =
      SINGLE_SELECT_FIELDS[currentStep as keyof typeof SINGLE_SELECT_FIELDS];
    const nextSelectedColumns = {
      ...selectedColumns,
      [field]: header,
    };

    setSelectedColumns(nextSelectedColumns);

    if (currentStep === "date") {
      completeFlow(nextSelectedColumns);
      return;
    }

    nextStep();
  }

  function toggleHeader(header: string) {
    if (!(currentStep in MULTI_SELECT_FIELDS)) {
      return;
    }

    const field =
      MULTI_SELECT_FIELDS[currentStep as keyof typeof MULTI_SELECT_FIELDS];

    setSelectedColumns((current) => {
      const values = current[field];

      return {
        ...current,
        [field]: values.includes(header)
          ? values.filter((value) => value !== header)
          : [...values, header],
      };
    });
  }

  function continueMultiSelect() {
    if (!(currentStep in MULTI_SELECT_FIELDS)) {
      return;
    }

    const field =
      MULTI_SELECT_FIELDS[currentStep as keyof typeof MULTI_SELECT_FIELDS];

    if (selectedColumns[field].length === 0) {
      return;
    }

    nextStep();
  }

  const availableHeaders =
    currentStep === "merchant" ||
    currentStep === "amount" ||
    currentStep === "positive" ||
    currentStep === "negative" ||
    currentStep === "date"
      ? getAvailableHeaders()
      : [];

  const isMultiSelect =
    currentStep === "positive" || currentStep === "negative";
  const selectedMultiValues = isMultiSelect
    ? selectedColumns[MULTI_SELECT_FIELDS[currentStep]]
    : [];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {currentStep === "overview" ? (
          <OverviewStep
            title={STEP_TITLES[currentStep]}
            description={STEP_DESCRIPTIONS[currentStep] ?? []}
            onContinue={nextStep}
          />
        ) : null}

        {currentStep === "mode" ? (
          <ModeStep
            title={STEP_TITLES[currentStep]}
            description={STEP_DESCRIPTIONS[currentStep] ?? []}
            onSelectMode={selectMode}
          />
        ) : null}

        {isMultiSelect ? (
          <MultiSelectStep
            title={STEP_TITLES[currentStep]}
            description={STEP_DESCRIPTIONS[currentStep]}
            headers={availableHeaders}
            selectedHeaders={selectedMultiValues}
            onToggleHeader={toggleHeader}
            onContinue={continueMultiSelect}
          />
        ) : null}

        {currentStep !== "overview" &&
        currentStep !== "mode" &&
        !isMultiSelect ? (
          <SingleSelectStep
            title={STEP_TITLES[currentStep]}
            description={STEP_DESCRIPTIONS[currentStep]}
            headers={availableHeaders}
            onSelectHeader={selectHeader}
          />
        ) : null}
      </div>
    </div>
  );
}
