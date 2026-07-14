# Multi-Agent Simulator & Visualizer

An interactive, client-side web application designed to help developers learn how multi-agent collaborative workflows function, inspect message hand-offs (traces), edit agent personalities (system prompts), and analyze evaluation audits.

## 🚀 Key Features

*   **Real-time Collaboration Graph**: A dynamic canvas mapping active node states and flow vectors representing communications.
*   **Step-by-Step Simulation Debugger**: Play, pause, or step through agent transitions to inspect interactions.
*   **Prompt Registry Editor**: Modify system prompts and temperature parameters directly inside the settings panel to change agent behaviors instantly.
*   **Deep Trace Payload Inspector**: Click to inspect exact JSON data payloads passed between active agents (outlines, research databases, drafts, bug feedback loops).
*   **Audit Evaluation Reporting**: Integrates an independent **Evaluator Agent** that scores correctness, alignment, quality, and workflow efficiency at the end of every run.

---

## 🤖 Integrated Workflows

### 1. Creative Content Team
*   **Planner Agent (📋 Strategy)**: Outlines topics and determines research specifications.
*   **Research Agent (🔍 Facts)**: Fetches historical facts and metrics.
*   **Writer Agent (✍️ Composition)**: Blends guidelines and raw data into a draft.
*   **Editor Agent (🔎 Quality Control)**: Proofreads and sends feedback/refinements back to the Writer.
*   **Evaluator Agent (📊 Audit)**: Rates alignment, readability, completeness, and latency metrics.

### 2. Software Development Pipeline
*   **Product Manager Agent (🎯 Specs)**: Breaks features into detailed requirements.
*   **Developer Agent (💻 Engineering)**: Writes executable mock JavaScript snippets.
*   **QA Tester Agent (🐞 Testing)**: Evaluates edge cases and reports bug feedback loops.
*   **Evaluator Agent (📊 Audit)**: Verifies specs coverage, efficiency, and code hygiene.

---

## 🛠 Getting Started

This application requires no backend servers, database pipelines, or API credentials.

1.  Clone this repository:
    ```bash
    git clone https://github.com/jigslakhani-vibe/multi-agent-sandbox.git
    cd multi-agent-sandbox
    ```
2.  Open `index.html` in your favorite web browser (double-click the file or open it via file selector).
3.  Select a workflow, write a topic, and press **Run Flow**.
