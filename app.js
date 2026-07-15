// Multi-Agent Sandbox App logic

// State Management
let currentSim = null;
let activeWorkflow = "creative";
let runHistory = [];

// DOM References
const workflowSelector = document.getElementById("workflowSelector");
const userInput = document.getElementById("userInput");
const runBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const agentConfigList = document.getElementById("agentConfigList");
const visualizerCanvas = document.getElementById("visualizerCanvas");
const logsContainer = document.getElementById("logsContainer");
const evalReportContainer = document.getElementById("evalReportContainer");
const simulationStatus = document.getElementById("simulationStatus");
const payloadModal = document.getElementById("payloadModal");
const modalTitle = document.getElementById("modalTitle");
const modalJson = document.getElementById("modalJson");
const modalClose = document.getElementById("modalClose");

// Tab control setup
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Setup Agent configuration list dynamically
function renderAgentRegistry() {
  agentConfigList.innerHTML = "";
  const workflow = WORKFLOWS[activeWorkflow];
  
  Object.values(workflow.agents).forEach(agent => {
    const card = document.createElement("div");
    card.className = "agent-config-card";
    card.innerHTML = `
      <div class="agent-config-header" onclick="toggleCardBody('${agent.id}')">
        <h4>${agent.icon} ${agent.name}</h4>
        <span class="chevron" id="chevron-${agent.id}">▶</span>
      </div>
      <div class="agent-config-body" id="body-${agent.id}">
        <label>System Instructions</label>
        <textarea id="prompt-${agent.id}" onchange="updateAgentPrompt('${agent.id}', this.value)">${agent.systemPrompt}</textarea>
        <div class="temp-row">
          <label>Temperature</label>
          <span id="temp-val-${agent.id}">${agent.temperature}</span>
        </div>
        <input type="range" min="0" max="1" step="0.1" value="${agent.temperature}" 
               oninput="updateAgentTemp('${agent.id}', this.value)">
      </div>
    `;
    agentConfigList.appendChild(card);
  });
}

function toggleCardBody(id) {
  const body = document.getElementById(`body-${id}`);
  const chev = document.getElementById(`chevron-${id}`);
  if (body.style.display === "flex") {
    body.style.display = "none";
    chev.style.transform = "rotate(0deg)";
  } else {
    body.style.display = "flex";
    chev.style.transform = "rotate(90deg)";
  }
}

function updateAgentPrompt(id, value) {
  WORKFLOWS[activeWorkflow].agents[id].systemPrompt = value;
}

function updateAgentTemp(id, value) {
  WORKFLOWS[activeWorkflow].agents[id].temperature = parseFloat(value);
  document.getElementById(`temp-val-${id}`).innerText = value;
}

// Render visualizer canvas graph layout
function renderVisualizerNodes() {
  visualizerCanvas.innerHTML = "";
  const workflow = WORKFLOWS[activeWorkflow];
  const agents = Object.values(workflow.agents);
  
  // Create an SVG element for connecting paths
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "connection-overlay");
  svg.id = "visualizerSvg";
  visualizerCanvas.appendChild(svg);

  // Distribute nodes evenly
  const totalAgents = agents.length;
  agents.forEach((agent, index) => {
    const node = document.createElement("div");
    node.className = "agent-node";
    node.id = `node-${agent.id}`;
    node.innerHTML = `
      <div class="node-bubble">${agent.icon}</div>
      <div class="node-name">${agent.name}</div>
      <div class="node-role">${agent.role}</div>
    `;
    
    // Position percentage-based
    const percentLeft = Math.round((index / (totalAgents - 1)) * 75 + 12);
    node.style.left = `${percentLeft}%`;
    node.style.position = "absolute";
    
    visualizerCanvas.appendChild(node);
  });

  // Wait a split second to draw connections between coordinates
  setTimeout(() => drawConnectionPaths(agents), 50);
}

// Draw dynamic lines/arcs
function drawConnectionPaths(agents) {
  const svg = document.getElementById("visualizerSvg");
  if (!svg) return;
  svg.innerHTML = ""; // clear paths

  for (let i = 0; i < agents.length - 1; i++) {
    const sourceNode = document.getElementById(`node-${agents[i].id}`);
    const destNode = document.getElementById(`node-${agents[i + 1].id}`);
    
    if (sourceNode && destNode) {
      const sourceRect = sourceNode.getBoundingClientRect();
      const destRect = destNode.getBoundingClientRect();
      const canvasRect = visualizerCanvas.getBoundingClientRect();

      // Relative coordinates
      const x1 = sourceRect.left + sourceRect.width / 2 - canvasRect.left;
      const y1 = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
      const x2 = destRect.left + destRect.width / 2 - canvasRect.left;
      const y2 = destRect.top + destRect.height / 2 - canvasRect.top;

      // Primary connection paths
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M ${x1} ${y1} Q ${(x1+x2)/2} ${y1 - 30} ${x2} ${y2}`;
      path.setAttribute("d", d);
      path.setAttribute("class", "link-line");
      path.id = `link-${agents[i].id}-${agents[i+1].id}`;
      svg.appendChild(path);

      // Feedback return loops (e.g. from editor to writer, qa to developer)
      if (agents[i+1].id === "editor" && agents[i-1]?.id === "writer") {
        const writerNode = document.getElementById("node-writer");
        const editorNode = document.getElementById("node-editor");
        if (writerNode && editorNode) {
          const wrRect = writerNode.getBoundingClientRect();
          const edRect = editorNode.getBoundingClientRect();
          const wx1 = wrRect.left + wrRect.width / 2 - canvasRect.left;
          const wy1 = wrRect.top + wrRect.height / 2 - canvasRect.top;
          const ex2 = edRect.left + edRect.width / 2 - canvasRect.left;
          const ey2 = edRect.top + edRect.height / 2 - canvasRect.top;

          const fbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const fbd = `M ${ex2} ${ey2} Q ${(wx1+ex2)/2} ${wy1 + 45} ${wx1} ${wy1}`;
          fbPath.setAttribute("d", fbd);
          fbPath.setAttribute("class", "link-line");
          fbPath.id = `feedback-editor-writer`;
          svg.appendChild(fbPath);
        }
      }

      if (agents[i+1].id === "qa" && agents[i-1]?.id === "developer") {
        const devNode = document.getElementById("node-developer");
        const qaNode = document.getElementById("node-qa");
        if (devNode && qaNode) {
          const dvRect = devNode.getBoundingClientRect();
          const qaRect = qaNode.getBoundingClientRect();
          const dx1 = dvRect.left + dvRect.width / 2 - canvasRect.left;
          const dy1 = dvRect.top + dvRect.height / 2 - canvasRect.top;
          const qax2 = qaRect.left + qaRect.width / 2 - canvasRect.left;
          const qay2 = qaRect.top + qaRect.height / 2 - canvasRect.top;

          const fbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const fbd = `M ${qax2} ${qay2} Q ${(dx1+qax2)/2} ${dy1 + 45} ${dx1} ${dy1}`;
          fbPath.setAttribute("d", fbd);
          fbPath.setAttribute("class", "link-line");
          fbPath.id = `feedback-qa-developer`;
          svg.appendChild(fbPath);
        }
      }
    }
  }
}

// UI Status indicators
function setStatus(status) {
  simulationStatus.className = "status-indicator " + status;
  
  if (status === "running") {
    simulationStatus.querySelector(".status-text").innerText = "Running Simulation";
    runBtn.disabled = true;
    pauseBtn.disabled = false;
    stepBtn.disabled = true;
  } else if (status === "paused") {
    simulationStatus.querySelector(".status-text").innerText = "Simulation Paused";
    pauseBtn.innerText = "▶ Resume";
    stepBtn.disabled = false;
  } else {
    simulationStatus.querySelector(".status-text").innerText = "Idle";
    runBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    pauseBtn.innerText = "⏸ Pause";
  }
}

// Log formatting and render
function appendLogItem(step) {
  // Clear placeholder text first time
  if (logsContainer.querySelector(".placeholder-text")) {
    logsContainer.innerHTML = "";
  }

  const log = document.createElement("div");
  log.className = "log-item";
  log.innerHTML = `
    <div class="log-meta">
      <span class="log-agent">${step.agent.icon} ${step.agent.name} <span class="log-role">(${step.agent.role})</span></span>
      <div>
        <span class="log-action-badge action-${step.action}">${step.action}</span>
        <span class="log-time">${step.timestamp}</span>
      </div>
    </div>
    <div class="log-body">${step.message}</div>
    <div class="log-actions">
      <button class="inspect-btn" onclick="inspectPayload(${step.index})">🔎 View Payload JSON</button>
    </div>
  `;
  logsContainer.appendChild(log);
  logsContainer.scrollTop = logsContainer.scrollHeight;

  // Visual graph update nodes state
  document.querySelectorAll(".agent-node").forEach(node => {
    node.classList.remove("active");
  });
  
  const activeNode = document.getElementById(`node-${step.agent.id}`);
  if (activeNode) {
    activeNode.classList.add("active");
    activeNode.classList.add("completed");
  }

  // Visual flow paths update animations
  document.querySelectorAll(".link-line").forEach(line => line.classList.remove("active", "feedback"));

  if (step.targetAgent) {
    const linkId = `link-${step.agent.id}-${step.targetAgent.id}`;
    const link = document.getElementById(linkId);
    if (link) {
      link.classList.add("active");
    }
  }

  if (step.action === "feedback") {
    if (step.agent.id === "editor") {
      const fbLink = document.getElementById("feedback-editor-writer");
      if (fbLink) fbLink.classList.add("feedback");
      const writerNode = document.getElementById("node-writer");
      if (writerNode) writerNode.classList.add("feedback-waiting");
    } else if (step.agent.id === "qa") {
      const fbLink = document.getElementById("feedback-qa-developer");
      if (fbLink) fbLink.classList.add("feedback");
      const devNode = document.getElementById("node-developer");
      if (devNode) devNode.classList.add("feedback-waiting");
    }
  } else {
    // Clear feedback warning animations
    document.querySelectorAll(".agent-node").forEach(node => node.classList.remove("feedback-waiting"));
  }
}

// Modal Inspect payload JSON
window.inspectPayload = function(index) {
  const step = runHistory[index];
  if (!step) return;

  modalTitle.innerText = `Inspect Trace step: ${step.agent.name} (${step.action})`;
  modalJson.innerText = JSON.stringify(step.payload, null, 2);
  payloadModal.classList.add("open");
};

modalClose.addEventListener("click", () => payloadModal.classList.remove("open"));
payloadModal.addEventListener("click", (e) => {
  if (e.target === payloadModal) {
    payloadModal.classList.remove("open");
  }
});

// Render evaluations dashboard metrics
function renderEvaluations(report) {
  evalReportContainer.innerHTML = `
    <div class="eval-grid">
      ${Object.entries(report.metrics).map(([key, val]) => {
        const offset = 201 - (201 * val / 100);
        let color = "var(--accent-green)";
        if (val < 70) color = "var(--accent-orange)";
        if (val < 50) color = "var(--accent-red)";
        
        return `
          <div class="eval-metric-card">
            <div class="eval-metric-title">${key}</div>
            <div class="eval-metric-circle">
              <svg>
                <circle class="circle-bg" cx="35" cy="35" r="32"></circle>
                <circle class="circle-val" cx="35" cy="35" r="32" 
                        style="stroke-dashoffset: ${offset}; stroke: ${color}"></circle>
              </svg>
              <div class="metric-text">${val}%</div>
            </div>
          </div>
        `;
      }).join("")}
    </div>

    <div class="eval-summary-card">
      <h4>📋 Auditor Executive Summary</h4>
      <p>${report.evaluation.summary}</p>
    </div>

    <div class="eval-suggestions-card">
      <h4>💡 Optimization Recommendations</h4>
      <ul>
        ${report.evaluation.suggestions.map(s => `<li>${s}</li>`).join("")}
      </ul>
    </div>

    ${report.evaluation.agentPerformance ? `
    <div class="eval-agent-performance-card" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <h4 style="margin-bottom: 15px; margin-top: 0; color: var(--accent-blue);">🤖 Agent Performance Breakdown</h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${report.evaluation.agentPerformance.map(agent => `
          <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <strong style="font-size: 1.05em;">${agent.name} Agent</strong>
              <span style="color: ${agent.score >= 95 ? 'var(--accent-green)' : (agent.score >= 85 ? 'var(--accent-orange)' : 'var(--accent-red)')}; font-weight: bold;">Score: ${agent.score}/100</span>
            </div>
            <div style="font-size: 0.9em; color: var(--text-secondary); line-height: 1.4;">${agent.feedback}</div>
          </li>
        `).join("")}
      </ul>
    </div>
    ` : ''}
  `;
}

// Run simulation pipeline trigger
function startSimulation() {
  const userRequestVal = userInput.value.trim();
  if (!userRequestVal) {
    alert("Please provide a prompt/request to initiate execution.");
    return;
  }

  // Clear previous outputs
  logsContainer.innerHTML = '<div class="placeholder-text">Initializing pipeline...</div>';
  evalReportContainer.innerHTML = '<div class="placeholder-text">Awaiting evaluation report...</div>';
  const outputContainer = document.getElementById("outputContainer");
  if (outputContainer) outputContainer.innerHTML = '<div class="placeholder-text">Final output will appear here after execution.</div>';
  runHistory = [];
  
  // Clear completed node glows
  document.querySelectorAll(".agent-node").forEach(node => {
    node.className = "agent-node";
  });
  document.querySelectorAll(".link-line").forEach(line => {
    line.className.baseVal = "link-line";
  });

  currentSim = new MultiAgentSimulation(activeWorkflow, userRequestVal, {
    onStep: (step) => {
      runHistory.push(step);
      appendLogItem(step);
    },
    onEval: (evalReport) => {
      renderEvaluations(evalReport);
      if (typeof renderFinalOutput === 'function') renderFinalOutput(evalReport.finalOutput);
    },
    onFinish: () => {
      setStatus("idle");
      // Highlight evaluations tab
      setTimeout(() => {
        document.querySelector('[data-tab="evalsTab"]').click();
      }, 1000);
    }
  });

  setStatus("running");
  currentSim.run();
}

// Execution Controls Event Listeners
runBtn.addEventListener("click", startSimulation);

pauseBtn.addEventListener("click", () => {
  if (currentSim.isPaused) {
    currentSim.resume();
    setStatus("running");
    pauseBtn.innerText = "⏸ Pause";
  } else {
    currentSim.pause();
    setStatus("paused");
    pauseBtn.innerText = "▶ Resume";
  }
});

stepBtn.addEventListener("click", () => {
  if (currentSim && currentSim.isPaused) {
    if (currentSim.resolveStep) {
      currentSim.resolveStep();
      currentSim.resolveStep = null;
    }
  }
});

resetBtn.addEventListener("click", () => {
  if (currentSim) {
    currentSim.pause();
  }
  currentSim = null;
  logsContainer.innerHTML = '<div class="placeholder-text">Logs will update in real time as the simulation runs.</div>';
  evalReportContainer.innerHTML = '<div class="placeholder-text">Evaluator metrics will render here after the workflow completes.</div>';
  const outputContainer = document.getElementById("outputContainer");
  if (outputContainer) outputContainer.innerHTML = '<div class="placeholder-text">Final output will appear here after execution.</div>';
  setStatus("idle");
  renderVisualizerNodes();
});

workflowSelector.addEventListener("change", (e) => {
  activeWorkflow = e.target.value;
  
  // Auto update input placeholder to match workflow
  if (activeWorkflow === "creative") {
    userInput.value = "Space Tourism in 2030";
  } else {
    userInput.value = "Dynamic dark mode toggle feature";
  }

  if (currentSim) {
    currentSim.pause();
    currentSim = null;
  }
  
  setStatus("idle");
  renderAgentRegistry();
  renderVisualizerNodes();
});

// Window Resize triggers redraw paths
window.addEventListener("resize", () => {
  const workflow = WORKFLOWS[activeWorkflow];
  drawConnectionPaths(Object.values(workflow.agents));
});

// Render Final Output dynamically
function renderFinalOutput(finalOutput) {
  const outputContainer = document.getElementById("outputContainer");
  if (!outputContainer) return;
  if (!finalOutput) {
    outputContainer.innerHTML = '<div class="placeholder-text">No final output generated.</div>';
    return;
  }
  
  if (finalOutput.code) {
    outputContainer.innerHTML = `
      <div class="glass-card" style="padding: 20px;">
        <h3 style="margin-top: 0;">Final Code Implementation</h3>
        <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 14px;"><code class="language-${finalOutput.language || 'javascript'}">${finalOutput.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
      </div>
    `;
  } else if (finalOutput.content) {
    const formattedContent = finalOutput.content.replace(/\\n/g, "<br>").replace(/## /g, "<h3>").replace(/# /g, "<h2>").replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>");
    outputContainer.innerHTML = `
      <div class="glass-card" style="padding: 20px;">
        <h3 style="margin-top: 0; color: var(--accent-blue);">${finalOutput.title || 'Final Draft'}</h3>
        <div style="line-height: 1.6; margin-bottom: 15px; font-size: 15px;">${formattedContent}</div>
        <div style="display: flex; gap: 15px; font-size: 0.85em; color: var(--text-secondary); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
          <span><strong>Word Count:</strong> ${finalOutput.wordCount || 0}</span>
          <span><strong>Tone:</strong> ${finalOutput.tone || 'N/A'}</span>
        </div>
      </div>
    `;
  }
}

// Initialize on Load
renderAgentRegistry();
renderVisualizerNodes();
