export interface ProposalStage {
  stageNumber: string;
  name: string;
  scope: string;
  timeline: string;
  price: string;
}

export interface ProposalConfig {
  developerName: string;
  developerEmail: string;
  developerPortfolio: string;
  availability: string;
  editPasswordHint: string;
  stages: ProposalStage[];
}

export const proposalConfig: ProposalConfig = {
  developerName: "Shahzaib Rajpoot Khan",
  developerEmail: "shahzaib@example.com",
  developerPortfolio: "https://github.com",
  availability: "Available to start immediately",
  editPasswordHint: "gecko",
  stages: [
    {
      stageNumber: "Stage 1",
      name: "Survey Intake & Pane Database",
      scope: "XLSX intake, validation grid, HubSpot sync, 4-level accordion & versioned pane lineage",
      timeline: "[2–3 weeks — you set]",
      price: "[£ — you set]",
    },
    {
      stageNumber: "Stage 2",
      name: "Quoting Engine & Customer Review",
      scope: "Rules-driven pricing engine, price override audits, coupon sync, calculators, customer accept/query portal",
      timeline: "[2–3 weeks — you set]",
      price: "[£ — you set]",
    },
    {
      stageNumber: "Stage 3",
      name: "Ordering, WooCommerce Push & Order Book",
      scope: "Transaction-safe WooCommerce order push, immutable ordered pane records, production order book, laser exports & acrylic batches",
      timeline: "[3–4 weeks — you set]",
      price: "[£ — you set]",
    },
    {
      stageNumber: "Stage 4",
      name: "Testing, Tuning & Cutover",
      scope: "End-to-end user trials with surveying & shopfloor staff, historical order book import, tuning & handoff",
      timeline: "[1–2 weeks — you set]",
      price: "[£ — you set]",
    },
  ],
};
