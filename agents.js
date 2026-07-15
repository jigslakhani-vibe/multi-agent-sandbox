// Multi-Agent Sandbox Simulation Core

const WORKFLOWS = {
  creative: {
    name: "Creative Content Team",
    description: "Generates high-quality articles using sequential planning, research, writing, and editing loops.",
    initialAgent: "planner",
    agents: {
      planner: {
        id: "planner",
        name: "Planner Agent",
        role: "Content Strategist & Architect",
        systemPrompt: "You outline topics, structure articles into readable headers, and specify exact research requirements for the Research Agent.",
        temperature: 0.7,
        icon: "📋"
      },
      researcher: {
        id: "researcher",
        name: "Research Agent",
        role: "Fact Finder & Information Gatherer",
        systemPrompt: "You conduct deep information gathering, list verified facts, statistics, and historical context for the outlined sections.",
        temperature: 0.2,
        icon: "🔍"
      },
      writer: {
        id: "writer",
        name: "Writer Agent",
        role: "Creative Wordsmith",
        systemPrompt: "You transform the structured outline and researched facts into an engaging, clear narrative with a professional tone.",
        temperature: 0.8,
        icon: "✍️"
      },
      editor: {
        id: "editor",
        name: "Editor Agent",
        role: "Quality Assurance & Proofreader",
        systemPrompt: "You review the written draft for flow, clarity, tone, and grammar. You provide constructive feedback or approve the piece.",
        temperature: 0.3,
        icon: "🔎"
      },
      evaluator: {
        id: "evaluator",
        name: "Evaluator Agent",
        role: "Independent Performance Auditor",
        systemPrompt: "You inspect the full execution trace, measure metric scores (alignment, readability, completeness), and output a structured report.",
        temperature: 0.1,
        icon: "📊"
      }
    }
  },
  software: {
    name: "Software Development Pipeline",
    description: "Builds mock feature code through specifications, code writing, and iterative QA bug-testing loops.",
    initialAgent: "pm",
    agents: {
      pm: {
        id: "pm",
        name: "Product Manager Agent",
        role: "Requirements Engineer",
        systemPrompt: "You convert user feature requests into clear technical specifications, user stories, and acceptance criteria.",
        temperature: 0.5,
        icon: "🎯"
      },
      developer: {
        id: "developer",
        name: "Developer Agent",
        role: "Software Engineer",
        systemPrompt: "You write clean, documented mock code (JS/Python syntax) that fulfills the Product Manager's technical specification.",
        temperature: 0.6,
        icon: "💻"
      },
      qa: {
        id: "qa",
        name: "QA Tester Agent",
        role: "Test Automation & Bug Finder",
        systemPrompt: "You test code logic against PM criteria, identifying potential edge-case errors, and sending back bugs or approving release.",
        temperature: 0.3,
        icon: "🐞"
      },
      evaluator: {
        id: "evaluator",
        name: "Evaluator Agent",
        role: "Independent Performance Auditor",
        systemPrompt: "You inspect the code execution trace, verify criteria satisfaction, trace efficiency, and output a structured quality report.",
        temperature: 0.1,
        icon: "📊"
      }
    }
  }
};

// Simulated delays (ms) to make tracing pleasant to watch
const STEP_DELAY = 1200;

class MultiAgentSimulation {
  constructor(workflowId, userRequest, callbacks = {}) {
    this.workflowId = workflowId;
    this.workflow = WORKFLOWS[workflowId];
    this.userRequest = userRequest;
    this.callbacks = callbacks; // onStep, onFinish, onEval
    this.history = [];
    this.stepIndex = 0;
    this.isPaused = false;
    this.currentStepPromise = null;
    this.resolveStep = null;
    this.editorLoops = 0;
    this.qaLoops = 0;
  }

  logStep(agentId, actionType, message, payload = {}, targetAgentId = null) {
    const step = {
      index: this.stepIndex++,
      timestamp: new Date().toLocaleTimeString(),
      agent: this.workflow.agents[agentId],
      action: actionType, // 'call', 'response', 'feedback', 'eval'
      message: message,
      payload: JSON.parse(JSON.stringify(payload)),
      targetAgent: targetAgentId ? this.workflow.agents[targetAgentId] : null
    };
    this.history.push(step);
    if (this.callbacks.onStep) {
      this.callbacks.onStep(step);
    }
  }

  async delay() {
    if (this.isPaused) {
      this.currentStepPromise = new Promise((resolve) => {
        this.resolveStep = resolve;
      });
      await this.currentStepPromise;
    } else {
      await new Promise(resolve => setTimeout(resolve, STEP_DELAY));
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.resolveStep) {
        this.resolveStep();
        this.resolveStep = null;
      }
    }
  }

  async run() {
    if (this.workflowId === "creative") {
      await this.runCreativeWorkflow();
    } else if (this.workflowId === "software") {
      await this.runSoftwareWorkflow();
    }
  }

  async runCreativeWorkflow() {
    // 1. Planner Agent
    this.logStep("planner", "call", `Analyzing topic request: "${this.userRequest}"`, { request: this.userRequest });
    await this.delay();

    const outline = {
      title: `The Comprehensive Guide to ${this.userRequest}`,
      sections: [
        "1. Introduction and Historical Context",
        "2. Key Pillars and Core Mechanisms",
        "3. Challenges and Future Outlook",
        "4. Conclusion & Recommendations"
      ],
      researchRequirements: [
        "Verify statistics and recent growth numbers",
        "Identify 2-3 prominent case studies or projects"
      ]
    };
    this.logStep("planner", "response", "Generated outline and outline requirements.", outline, "researcher");
    await this.delay();

    // 2. Researcher Agent
    this.logStep("researcher", "call", "Gathering facts and metrics based on planner requirements...", { requirements: outline.researchRequirements });
    await this.delay();

    const facts = {
      historicalBackground: `Initial breakthroughs in '${this.userRequest}' began emerging in the last decade, scaling to a market value of $12.4B recently.`,
      keyStatistics: [
        "Year-over-year adoption rate increased by 42%.",
        "Over 65% of surveyed professionals identify it as a high-impact trend."
      ],
      caseStudies: [
        "Case Alpha: Implemented at scale, resulting in a 30% latency reduction.",
        "Case Beta: Adopted in enterprise operations, optimizing resource utilization by 25%."
      ]
    };
    this.logStep("researcher", "response", "Research data gathered successfully.", facts, "writer");
    await this.delay();

    // 3. Writer Agent
    this.logStep("writer", "call", "Writing initial draft combining outline and research data...", { outline, facts });
    await this.delay();

    let writerOutput = {
      title: outline.title,
      content: `
# ${outline.title}

## Introduction
${facts.historicalBackground} It stands as a pivotal development shaping our current industry landscapes.

## Pillars & Implementation
Looking at the statistics, ${facts.keyStatistics[0]} This represents an extraordinary jump. Furthermore, ${facts.keyStatistics[1]}

## Industry Impacts (Case Studies)
- **Case Alpha**: Highlighted by a 30% performance boost.
- **Case Beta**: Proved massive efficiency improvements, slashing overhead by 25%.

## Challenges & Conclusion
While integration requires strict quality gates, the benefits are undeniable. It represents a paradigm shift.
      `.trim(),
      wordCount: 154,
      tone: "Informative & Academic"
    };
    this.logStep("writer", "response", "Draft 1 completed.", writerOutput, "editor");
    await this.delay();

    // 4. Editor Agent & Loop
    let approved = false;
    let draft = writerOutput;

    while (!approved && this.editorLoops < 2) {
      this.logStep("editor", "call", `Reviewing Draft (Attempt ${this.editorLoops + 1})...`, { draft });
      await this.delay();

      if (this.editorLoops === 0) {
        // Mock feedback loop
        const feedback = {
          approved: false,
          critique: "Excellent details, but the introduction could be more punchy and the layout needs a clear disclaimer about system limits.",
          requestedChanges: [
            "Add a Call-To-Action or forward-looking concluding sentence.",
            "Make the tone slightly more conversational."
          ]
        };
        this.logStep("editor", "feedback", "Feedback provided. Requesting revisions.", feedback, "writer");
        await this.delay();

        this.editorLoops++;

        // Writer revises
        this.logStep("writer", "call", "Revising draft based on editor feedback...", { feedback });
        await this.delay();

        draft = {
          title: draft.title,
          content: draft.content + "\n\n*Disclaimer: Multi-agent systems simulated live. Future projections are subject to changes.*",
          wordCount: 172,
          tone: "Conversational & Informative"
        };
        this.logStep("writer", "response", "Revised Draft completed.", draft, "editor");
        await this.delay();
      } else {
        approved = true;
        const approval = {
          approved: true,
          verdict: "Perfect! The tone is warm, formatting is readable, and key statistics are clearly structured."
        };
        this.logStep("editor", "response", "Draft approved for publication!", approval);
        await this.delay();
      }
    }

    // 5. Evaluator Agent (Runs Evals)
    this.logStep("evaluator", "call", "Running independent workflow evaluation...", { historyLength: this.history.length });
    await this.delay();

    const evalReport = {
      finalOutput: draft,
      metrics: {
        alignment: 95, // %
        completeness: 90,
        efficiency: Math.round(100 - (this.editorLoops * 15)), // Less loops is more efficient
        readability: 88
      },
      evaluation: {
        summary: "The multi-agent workflow executed smoothly. The Planner correctly mapped out sections, the Researcher provided statistics, and the Writer structured them nicely. The iteration between Writer and Editor addressed the tone alignment issues successfully.",
        violations: [],
        suggestions: [
          "To optimize latency, the Writer could run in parallel with researcher outline queries.",
          "Add a validation layer directly on the Writer to reduce editor loop cycles."
        ],
        agentPerformance: [
          { name: "Planner", score: 98, feedback: "Excellent outlining, well-structured sections." },
          { name: "Researcher", score: 92, feedback: "Gathered solid facts, but could include more citations." },
          { name: "Writer", score: 85, feedback: "Initial draft was too formal; required editor rework." },
          { name: "Editor", score: 95, feedback: "Caught the tone issue effectively and guided the writer." }
        ]
      }
    };
    this.logStep("evaluator", "eval", "Evaluation completed.", evalReport);
    if (this.callbacks.onEval) {
      this.callbacks.onEval(evalReport);
    }
    if (this.callbacks.onFinish) {
      this.callbacks.onFinish(this.history);
    }
  }

  async runSoftwareWorkflow() {
    // 1. PM Agent
    this.logStep("pm", "call", `Analyzing product feature request: "${this.userRequest}"`, { request: this.userRequest });
    await this.delay();

    const spec = {
      featureName: this.userRequest,
      requirements: [
        "Must validate inputs correctly.",
        "Must handle exceptions gracefully and return error codes.",
        "Include unit test scaffolding."
      ],
      userStories: [
        "As a user, I want the operation to fail explicitly if invalid inputs are entered."
      ]
    };
    this.logStep("pm", "response", "Created feature specifications.", spec, "developer");
    await this.delay();

    // 2. Developer Agent
    this.logStep("developer", "call", "Writing code implementations based on requirements spec...", { spec });
    await this.delay();

    let devOutput = {
      language: "javascript",
      code: `
function handleFeature(input) {
  // Spec implementation
  if (!input) {
    return { success: false, error: "Input is required" };
  }
  
  try {
    const data = JSON.parse(input);
    return { success: true, payload: data };
  } catch (err) {
    // Missing handling for empty strings or invalid objects
    return { success: true, payload: null }; 
  }
}
      `.trim(),
      testScaffold: `console.log(handleFeature("{}"));`
    };
    this.logStep("developer", "response", "Coding phase completed. Forwarding to QA.", devOutput, "qa");
    await this.delay();

    // 3. QA Agent & loop
    let passedQA = false;
    let codeResult = devOutput;

    while (!passedQA && this.qaLoops < 2) {
      this.logStep("qa", "call", `Running test cases on developer code (Iteration ${this.qaLoops + 1})...`, { code: codeResult.code });
      await this.delay();

      if (this.qaLoops === 0) {
        const qaFeedback = {
          passed: false,
          failedTests: [
            "Test 2: Invalid JSON returns success: true, payload: null instead of an error message."
          ],
          suggestions: "Update catch block to return success: false with error details."
        };
        this.logStep("qa", "feedback", "QA test failed. Bugs identified.", qaFeedback, "developer");
        await this.delay();

        this.qaLoops++;

        // Dev resolves
        this.logStep("developer", "call", "Fixing reported bug in error-catch block...", { feedback: qaFeedback });
        await this.delay();

        codeResult = {
          language: "javascript",
          code: `
function handleFeature(input) {
  if (!input) {
    return { success: false, error: "Input is required" };
  }
  
  try {
    const data = JSON.parse(input);
    return { success: true, payload: data };
  } catch (err) {
    // Fixed: now returns correct error payload
    return { success: false, error: "Invalid JSON format: " + err.message };
  }
}
          `.trim(),
          testScaffold: codeResult.testScaffold
        };
        this.logStep("developer", "response", "Fixed code submitted.", codeResult, "qa");
        await this.delay();
      } else {
        passedQA = true;
        const qaPass = {
          passed: true,
          details: "All test cases passed. Code is robust against invalid inputs."
        };
        this.logStep("qa", "response", "Code approved for production deployment!", qaPass);
        await this.delay();
      }
    }

    // 4. Evaluator Agent (Runs Evals)
    this.logStep("evaluator", "call", "Running independent workflow evaluation...", { historyLength: this.history.length });
    await this.delay();

    const evalReport = {
      finalOutput: codeResult,
      metrics: {
        alignment: 100, // %
        completeness: 95,
        efficiency: Math.round(100 - (this.qaLoops * 20)),
        readability: 92
      },
      evaluation: {
        summary: "The software engineering pipeline completed successfully. The PM Agent drafted clear rules. The Developer wrote an initial implementation with a bug in catch-exception handling. The QA Agent correctly caught the failure, and the Developer quickly corrected it.",
        violations: [],
        suggestions: [
          "Implement lint checks before sending to QA to capture styling anomalies.",
          "Add static type verification configurations."
        ],
        agentPerformance: [
          { name: "Product Manager", score: 96, feedback: "Clear spec with good test scenarios." },
          { name: "Developer", score: 82, feedback: "Introduced a bug in error handling; fixed promptly after QA." },
          { name: "QA Tester", score: 98, feedback: "Identified the exact edge-case failure effectively." }
        ]
      }
    };
    this.logStep("evaluator", "eval", "Evaluation completed.", evalReport);
    if (this.callbacks.onEval) {
      this.callbacks.onEval(evalReport);
    }
    if (this.callbacks.onFinish) {
      this.callbacks.onFinish(this.history);
    }
  }
}
