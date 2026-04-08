document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvasContainer');
    const nodesContainer = document.getElementById('nodesContainer');
    const linesCanvas = document.getElementById('linesCanvas');
    const addNodeBtn = document.getElementById('addNodeBtn');
    
    // Modal
    const editModal = document.getElementById('editModal');
    const editTextInput = document.getElementById('editTextInput');
    const saveEditBtn = document.getElementById('saveEdit');
    const cancelEditBtn = document.getElementById('cancelEdit');
    let currentlyEditingNodeId = null;

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    let activeTab = 'auditor';

    let auditorData = {
        nodes: [
            { id: "n1", x: 800, y: 100, text: "<div class='node-content'><span class='step-label'>Step 1</span><strong class='primary-action'>Navigate to #rdr-team-all</strong><span class='instruction-text'>Click the green 'Query' button at the bottom to open the submission form.</span></div>" },
            { id: "n2", x: 800, y: 280, text: "<div class='node-content'><span class='step-label'>Step 2</span><strong class='primary-action'>Select Use Case</strong><span class='instruction-text'>From the dropdown, choose the appropriate use case your query relates to.</span></div>" },
            { id: "n3", x: 800, y: 460, text: "<div class='node-content'><span class='step-label'>Step 3</span><strong class='primary-action'>Choose Nature of Query</strong><span class='instruction-text'>Select the category that best fits your doubt:</span></div>" },
            { id: "n4", x: 300, y: 640, text: "<div class='node-content'><strong class='primary-action'>SOP Related</strong><span class='instruction-text'>For doubts and discussion about our Standard Operating Procedure.</span></div>" },
            { id: "n5", x: 800, y: 640, text: "<div class='node-content'><strong class='primary-action'>General Query</strong><span class='instruction-text'>For doubts related to Operations processes, tools, etc.</span></div>" },
            { id: "n6", x: 1300, y: 640, text: "<div class='node-content'><strong class='primary-action'>Ideas / Suggestion</strong><span class='instruction-text'>For suggesting and discussing any new idea.</span></div>" },
            { id: "n7", x: 800, y: 820, text: "<div class='node-content'><span class='step-label'>Step 4</span><strong class='primary-action'>Describe your Query</strong><span class='instruction-text'>Be specific in the Query text field. Submissions are fully anonymous.</span></div>" },
            { id: "n8", x: 800, y: 1000, text: "<div class='node-content'><span class='step-label'>Step 5</span><strong class='primary-action'>Submit Query</strong><span class='instruction-text'>A Unique Ticket ID is auto-generated and posted simultaneously in your group and to the leaders.</span></div>" },
            { id: "n9", x: 800, y: 1180, text: "<div class='node-content'><span class='step-label'>Step 6</span><strong class='primary-action'>Wait for Reply</strong><span class='instruction-text'>Receive the resolution, original doubt, and ticket ID directly in your Slack DM and rdr-team-all channel.</span></div>" },
            { id: "n10", x: 800, y: 1360, text: "<div class='node-content'><span class='step-label'>Step 7</span><strong class='primary-action'>Review Resolution</strong><span class='instruction-text'>Does the resolution fully address your doubt?</span></div>" },
            { id: "n11", x: 500, y: 1540, text: "<div class='node-content'><strong class='primary-action'>YES</strong><span class='instruction-text'>Ticket is successfully marked as Resolved.</span></div>" },
            { id: "n12", x: 1100, y: 1540, text: "<div class='node-content'><strong class='primary-action'>NO</strong><span class='instruction-text'>Click the red 'Review' button in DM. Submit a clarification statement.</span></div>" },
            { id: "n13", x: 1100, y: 1720, text: "<div class='node-content'><span class='step-label'>Final Detail</span><strong class='primary-action'>Receive Clarification</strong><span class='instruction-text'>Sent for leadership review. You get final clarification in your personal DM.</span></div>" }
        ],
        connections: [
            { from: "n1", to: "n2", id: "c1" }, { from: "n2", to: "n3", id: "c2" },
            { from: "n3", to: "n4", id: "c3" }, { from: "n3", to: "n5", id: "c4" },
            { from: "n3", to: "n6", id: "c5" }, { from: "n4", to: "n7", id: "c6" },
            { from: "n5", to: "n7", id: "c7" }, { from: "n6", to: "n7", id: "c8" },
            { from: "n7", to: "n8", id: "c9" }, { from: "n8", to: "n9", id: "c10" },
            { from: "n9", to: "n10", id: "c11" }, { from: "n10", to: "n11", id: "c12" },
            { from: "n10", to: "n12", id: "c13" }, { from: "n12", to: "n13", id: "c14" }
        ]
    };

    let managerData = {
        nodes: [
            { id: "m1", x: 800, y: 100, text: "<div class='node-content'><span class='step-label'>Step 1</span><strong class='primary-action'>Query Appears</strong><span class='instruction-text'>Appears in Managers channel with Ticket ID, Pipeline, sub-type, and Doubt.</span></div>" },
            { id: "m2", x: 800, y: 280, text: "<div class='node-content'><strong class='primary-action'>Manager Action Required</strong><span class='instruction-text'>Choose from 3 primary action buttons:</span></div>" },
            
            { id: "m3", x: 100, y: 460, text: "<div class='node-content'><span class='step-label'>Step 1C</span><strong class='primary-action'>Check Status</strong><span class='instruction-text'>Click to view the current progress (In-progress or Answered).</span></div>" },
            
            { id: "m4", x: 1500, y: 460, text: "<div class='node-content'><span class='step-label'>Step 1B</span><strong class='primary-action'>Assign</strong><span class='instruction-text'>Select the best-suited manager. Forwarded to their Slack DM via bot.</span></div>" },
            { id: "m8", x: 1500, y: 640, text: "<div class='node-content'><span class='step-label'>Step 2</span><strong class='primary-action'>Assigned Manager Notified</strong><span class='instruction-text'>Manager receives DM. They can 'Answer' or click 'Re-Assign' to forward.</span></div>" },
            { id: "m9", x: 1500, y: 820, text: "<div class='node-content'><span class='step-label'>Step 3</span><strong class='primary-action'>Limit 1 Re-Assignment</strong><span class='instruction-text'>Final manager receives ONLY an 'Answer' button and MUST resolve directly.</span></div>" },

            { id: "m5", x: 800, y: 460, text: "<div class='node-content'><span class='step-label'>Step 1A</span><strong class='primary-action'>Answer</strong><span class='instruction-text'>Provide your exact resolution statement.</span></div>" },
            { id: "m6", x: 800, y: 640, text: "<div class='node-content'><span class='step-label'>Result</span><strong class='primary-action'>Deliver Resolution</strong><span class='instruction-text'>Delivered directly to Auditor's DM. Confirmation posted in rdr-team-all channel.</span></div>" },
            { id: "m7", x: 800, y: 820, text: "<div class='node-content'><strong class='primary-action'>Auditor Review Loop</strong><span class='instruction-text'>If Auditor requests review, the answering leadership gets a DM via bot.</span></div>" },
            { id: "m10", x: 800, y: 1000, text: "<div class='node-content'><strong class='primary-action'>Clarify</strong><span class='instruction-text'>Leader clicks 'Clarify', provides extra explanation, and submits to Auditor's DM and Managers Channel.</span></div>" }
        ],
        connections: [
            { from: "m1", to: "m2", id: "cm1" }, 
            
            { from: "m2", to: "m3", id: "cm2" }, 
            
            { from: "m2", to: "m5", id: "cm3" }, 
            { from: "m5", to: "m6", id: "cm4" },
            { from: "m6", to: "m7", id: "cm5" },
            { from: "m7", to: "m10", id: "cm6" },

            { from: "m2", to: "m4", id: "cm7" },
            { from: "m4", to: "m8", id: "cm8" },
            { from: "m8", to: "m9", id: "cm9" },
            { from: "m9", to: "m5", id: "cm10" }
        ]
    };

    let tribunalData = {
        nodes: [
            // --- Entry ---
            { id: "t1",  x: 800,  y: 80,   text: "<div class='node-content'><span class='step-label'>Step 1</span><strong class='primary-action'>User Opens App</strong><span class='instruction-text'>Navigates to the site. If not logged in, redirected to /login automatically.</span></div>" },
            { id: "t2",  x: 800,  y: 260,  text: "<div class='node-content'><span class='step-label'>Step 2</span><strong class='primary-action'>Select Role & Login</strong><span class='instruction-text'>User selects their account (Auditor, QC, Auditor_POC, QC_POC, Appellate, Ops, Training) from the login page.</span></div>" },
            { id: "t3",  x: 800,  y: 440,  text: "<div class='node-content'><span class='step-label'>Step 3</span><strong class='primary-action'>Dashboard Loaded</strong><span class='instruction-text'>All existing Disputes are displayed. User can view open cases or create a new dispute.</span></div>" },

            // --- Dispute Creation Branch ---
            { id: "t4",  x: 300,  y: 640,  text: "<div class='node-content'><span class='step-label'>Branch A</span><strong class='primary-action'>Create New Dispute</strong><span class='instruction-text'>User fills in logic & reference evidence, then submits the form via POST /create_dispute.</span></div>" },
            { id: "t5",  x: 300,  y: 820,  text: "<div class='node-content'><span class='step-label'>Result</span><strong class='primary-action'>Dispute Created</strong><span class='instruction-text'>System auto-links to the active AuditCase. Status: <em>Pending Auditor Revert</em>. ⏱️ Auditor is notified — 24-hr SLA clock starts now.</span></div>" },

            // --- Open Dispute Branch ---
            { id: "t6",  x: 1300, y: 640,  text: "<div class='node-content'><span class='step-label'>Branch B</span><strong class='primary-action'>Open Existing Dispute</strong><span class='instruction-text'>User clicks a dispute from the dashboard to navigate to /dispute/{id}. Arguments & Geode entries loaded.</span></div>" },

            // --- Auditor's Argument ---
            { id: "t7",  x: 800,  y: 1020, text: "<div class='node-content'><span class='step-label'>Step 4 — Auditor</span><strong class='primary-action'>Auditor Submits Argument</strong><span class='instruction-text'>Auditor responds to QC fault within the 24-hr SLA window. Writes logic statement and optional quoted reference.</span></div>" },

            // ══════════════════════════════════════════
            // --- MANAGER APPROVAL GATE ---
            // ══════════════════════════════════════════
            { id: "t17", x: 800,  y: 1220, text: "<div class='node-content'><span class='step-label'>Step 5 — Gate</span><strong class='primary-action'>🔒 Manager Approval Required</strong><span class='instruction-text'>Argument is held pending. ⏱️ Manager is notified — 24-hr SLA to approve or disapprove. Decision must include a written reason.</span></div>" },
            { id: "t18", x: 400,  y: 1440, text: "<div class='node-content'><span class='step-label'>Decision: Approve</span><strong class='primary-action'>✅ Manager Approves</strong><span class='instruction-text'>Manager provides mandatory written reason for approval. Argument forwarded to QC. ⏱️ QC's 24-hr SLA starts now.</span></div>" },
            { id: "t19", x: 1200, y: 1440, text: "<div class='node-content'><span class='step-label'>Decision: Disapprove</span><strong class='primary-action'>🚫 Manager Disapproves</strong><span class='instruction-text'>Manager provides mandatory written reason for disapproval. Argument returned to Auditor. ⏱️ Auditor's 24-hr SLA restarts for revision.</span></div>" },

            // --- Role-Based Status Changes (post-gate) ---
            { id: "t8",  x: 200,  y: 1660, text: "<div class='node-content'><span class='step-label'>If: QC Role</span><strong class='primary-action'>Status → Pending Auditor Revert</strong><span class='instruction-text'>QC flags a fault. ⏱️ Auditor is notified — 24-hr SLA starts to challenge or revert.</span></div>" },
            { id: "t9",  x: 800,  y: 1660, text: "<div class='node-content'><span class='step-label'>If: Approved</span><strong class='primary-action'>Argument Forwarded to QC</strong><span class='instruction-text'>Manager-approved argument reaches QC. ⏱️ QC has 24hrs to accept, reject, or escalate.</span></div>" },
            { id: "t10", x: 1400, y: 1660, text: "<div class='node-content'><span class='step-label'>If: QC_POC Role</span><strong class='primary-action'>Status → Escalated to Appellate Court</strong><span class='instruction-text'>Dispute escalated. ⏱️ Appellate authority is notified — 24-hr SLA to issue a final ruling.</span></div>" },

            // --- Senior Review ---
            { id: "t11", x: 800,  y: 1880, text: "<div class='node-content'><span class='step-label'>Step 6</span><strong class='primary-action'>Senior Reviews Argument</strong><span class='instruction-text'>Higher-role user (QC / Appellate / Ops) reviews within their 24-hr SLA window and selects an action.</span></div>" },

            // --- SLA Policy Banner (floating reference) ---
            { id: "tSLA", x: 1900, y: 600, text: "<div class='node-content'><span class='step-label'>📋 SLA Policy</span><strong class='primary-action'>Universal 24-Hr SLA Rule</strong><span class='instruction-text'>Every party — Auditor, Manager, QC, QC_POC, Appellate — has a strict <strong>24-hour window</strong> to respond upon receiving any notification, argument, counter-argument, approval, appeal, or escalation. This ensures the entire dispute is resolved on its true merit in a time-bound fashion.</span></div>" },

            // --- Outcomes ---
            { id: "t12", x: 300,  y: 2080, text: "<div class='node-content'><span class='step-label'>Outcome A</span><strong class='primary-action'>✅ Accepted</strong><span class='instruction-text'>Argument status → Accepted. Dispute status → Resolved. Case is closed.</span></div>" },
            { id: "t13", x: 800,  y: 2080, text: "<div class='node-content'><span class='step-label'>Outcome B</span><strong class='primary-action'>❌ Rejected</strong><span class='instruction-text'>Argument status → Rejected. Dispute remains open. Auditor may revise and resubmit.</span></div>" },
            { id: "t14", x: 1300, y: 2080, text: "<div class='node-content'><span class='step-label'>Outcome C</span><strong class='primary-action'>🚨 Escalated</strong><span class='instruction-text'>Argument status → Escalated. Dispute status → Escalated to Higher Authority.</span></div>" },

            // --- Terminal States ---
            { id: "t15", x: 300,  y: 2280, text: "<div class='node-content'><span class='step-label'>End State</span><strong class='primary-action'>Dispute: RESOLVED</strong><span class='instruction-text'>Final verdict reached. No further actions required on this dispute.</span></div>" },
            { id: "t16", x: 1300, y: 2280, text: "<div class='node-content'><span class='step-label'>End State</span><strong class='primary-action'>Dispute: HIGHER AUTHORITY</strong><span class='instruction-text'>Case passed to executive-level for final binding decision outside the Tribunal system.</span></div>" }
        ],
        connections: [
            // Entry chain
            { from: "t1",  to: "t2",  id: "tc1"  },
            { from: "t2",  to: "t3",  id: "tc2"  },
            // Dashboard branches
            { from: "t3",  to: "t4",  id: "tc3"  },
            { from: "t3",  to: "t6",  id: "tc4"  },
            // Create dispute branch
            { from: "t4",  to: "t5",  id: "tc5"  },
            { from: "t5",  to: "t7",  id: "tc6"  },
            // Open dispute branch flows into Auditor argument
            { from: "t6",  to: "t7",  id: "tc7"  },
            // Auditor argument → Manager Gate
            { from: "t7",  to: "t17", id: "tc20" },
            // QC & QC_POC bypass the Manager gate
            { from: "t7",  to: "t8",  id: "tc8"  },
            { from: "t7",  to: "t10", id: "tc10" },
            // Manager gate branches
            { from: "t17", to: "t18", id: "tc21" },
            { from: "t17", to: "t19", id: "tc22" },
            // Approve → argument forwarded to QC
            { from: "t18", to: "t9",  id: "tc23" },
            // Disapprove → back to Auditor for revision
            { from: "t19", to: "t7",  id: "tc24" },
            // All approved paths converge on Senior Review
            { from: "t8",  to: "t11", id: "tc11" },
            { from: "t9",  to: "t11", id: "tc12" },
            { from: "t10", to: "t11", id: "tc13" },
            // Senior Review outcomes
            { from: "t11", to: "t12", id: "tc14" },
            { from: "t11", to: "t13", id: "tc15" },
            { from: "t11", to: "t14", id: "tc16" },
            // Terminal transitions
            { from: "t12", to: "t15", id: "tc17" },
            { from: "t13", to: "t7",  id: "tc18" },
            { from: "t14", to: "t16", id: "tc19" }
        ]
    };

    const savedAuditor = localStorage.getItem('flowForge_auditor');
    if (savedAuditor) auditorData = JSON.parse(savedAuditor);

    const savedManager = localStorage.getItem('flowForge_manager');
    if (savedManager) managerData = JSON.parse(savedManager);

    // Version-based auto-reset — clears stale cached layout whenever the data schema changes
    const TRIBUNAL_VERSION = 'v3_sla';
    if (localStorage.getItem('flowForge_tribunal_version') !== TRIBUNAL_VERSION) {
        localStorage.removeItem('flowForge_tribunal');
        localStorage.setItem('flowForge_tribunal_version', TRIBUNAL_VERSION);
    }
    const savedTribunal = localStorage.getItem('flowForge_tribunal');
    if (savedTribunal) tribunalData = JSON.parse(savedTribunal);

    function saveData() {
        if (activeTab === 'auditor') {
            auditorData.nodes = structuredClone(nodes);
            auditorData.connections = structuredClone(connections);
            localStorage.setItem('flowForge_auditor', JSON.stringify(auditorData));
        } else if (activeTab === 'manager') {
            managerData.nodes = structuredClone(nodes);
            managerData.connections = structuredClone(connections);
            localStorage.setItem('flowForge_manager', JSON.stringify(managerData));
        } else if (activeTab === 'tribunal') {
            tribunalData.nodes = structuredClone(nodes);
            tribunalData.connections = structuredClone(connections);
            localStorage.setItem('flowForge_tribunal', JSON.stringify(tribunalData));
        }
    }

    let nodes = [];
    let connections = [];

    let isDraggingNode = false;
    let draggedNodeId = null;
    let dragOffsetX = 0, dragOffsetY = 0;
    let isConnecting = false;
    let connectionStartNodeId = null;
    let tempLine = null;

    function renderTab() {
        nodesContainer.innerHTML = '';
        const data = activeTab === 'auditor' ? auditorData : (activeTab === 'manager' ? managerData : tribunalData);
        nodes = structuredClone(data.nodes);
        connections = structuredClone(data.connections);
        
        nodes.forEach(n => {
            renderNodeToDOM(n.id, n.x, n.y, n.text);
        });
        
        // Scroll to center topish
        const wrapper = document.getElementById('exportWrapper');
        if (wrapper) {
            wrapper.scrollTop = 0;
            wrapper.scrollLeft = 600;
        }
        
        // Use timeout to let DOM render so measurements work for lines
        setTimeout(renderLines, 50);
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeTab = e.target.dataset.tab;
            renderTab();
        });
    });

    function renderNodeToDOM(id, x, y, text) {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.id = id;
        nodeEl.style.left = x + 'px';
        nodeEl.style.top = y + 'px';
        
        nodeEl.innerHTML = `
            <div class="node-header">
                <button class="node-btn edit" title="Edit">✏️</button>
                <button class="node-btn del" title="Delete">✖</button>
            </div>
            <div class="port port-top"></div>
            <div class="port port-right"></div>
            <div class="port port-bottom"></div>
            <div class="port port-left"></div>
            <div class="node-text">${text}</div>
        `;
        
        nodesContainer.appendChild(nodeEl);
        
        // Dragging Event
        nodeEl.addEventListener('pointerdown', handleNodePointerDown);
        
        // Editing Event
        nodeEl.querySelector('.node-btn.edit').addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            openEditModal(id);
        });

        // Deleting Event
        nodeEl.querySelector('.node-btn.del').addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if(confirm("Delete this step?")) deleteNode(id);
        });

        // Resize observer to update lines instantly when box is resized
        new ResizeObserver(() => renderLines()).observe(nodeEl);
    }

    function createNode(x, y, text) {
        const id = 'node_' + Math.random().toString(36).substr(2, 9);
        nodes.push({ id, x, y, text });
        renderNodeToDOM(id, x, y, text);
        saveData();
    }

    function deleteNode(id) {
        document.getElementById(id).remove();
        nodes = nodes.filter(n => n.id !== id);
        connections = connections.filter(c => c.from !== id && c.to !== id);
        renderLines();
        saveData();
    }

    // Modal logic
    function openEditModal(id) {
        currentlyEditingNodeId = id;
        const node = nodes.find(n => n.id === id);
        if(node) {
            editTextInput.value = node.text;
            editModal.classList.add('show');
            editTextInput.focus();
        }
    }

    cancelEditBtn.addEventListener('click', () => { editModal.classList.remove('show'); });
    
    saveEditBtn.addEventListener('click', () => {
        if(currentlyEditingNodeId) {
            const node = nodes.find(n => n.id === currentlyEditingNodeId);
            if(node) {
                node.text = editTextInput.value;
                document.querySelector(`#${currentlyEditingNodeId} .node-text`).innerText = node.text;
            }
        }
        editModal.classList.remove('show');
        renderLines(); // resize text might push container sizes
        saveData();
    });

    // Toolbar logic
    document.getElementById('clearBtn').addEventListener('click', () => {
        if(confirm("Clear everything?")) {
            nodesContainer.innerHTML = '';
            nodes = []; connections = []; renderLines();
            saveData();
        }
    });

    addNodeBtn.addEventListener('click', () => {
        const wrapper = document.getElementById('exportWrapper');
        const startX = wrapper.scrollLeft + (wrapper.clientWidth / 2) - 130; 
        const startY = wrapper.scrollTop + (wrapper.clientHeight / 2) - 50; 
        const htmlText = "<div class='node-content'><span class='step-label'>New Step</span><strong class='primary-action'>Custom Action</strong><span class='instruction-text'>Describe instruction here.</span></div>";
        createNode(startX, startY, htmlText);
    });

    // Pointer logic
    function handleNodePointerDown(e) {
        if (e.button !== 0 || e.target.classList.contains('node-btn')) return;
        
        // Prevent drag on CSS resize handle (bottom right corner)
        const rect = e.currentTarget.getBoundingClientRect();
        const isInResizeCorner = (e.clientX > rect.right - 20) && (e.clientY > rect.bottom - 20);
        if(isInResizeCorner) return;

        const id = e.currentTarget.id;
        
        // Check if user clicked on a port
        if (e.target.classList.contains('port')) {
            isConnecting = true; connectionStartNodeId = id;
            tempLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
            tempLine.setAttribute("class", "connection");
            tempLine.setAttribute("marker-end", "url(#arrow)");
            tempLine.style.pointerEvents = 'none'; // prevent blocking elementFromPoint
            linesCanvas.appendChild(tempLine);
            e.preventDefault();
        } else if (e.shiftKey) {
            // Keep shift key fallback just in case
            isConnecting = true; connectionStartNodeId = id;
            tempLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
            tempLine.setAttribute("class", "connection");
            tempLine.setAttribute("marker-end", "url(#arrow)");
            tempLine.style.pointerEvents = 'none';
            linesCanvas.appendChild(tempLine);
            e.preventDefault();
        } else {
            isDraggingNode = true; draggedNodeId = id;
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            nodesContainer.appendChild(e.currentTarget); // bring to front
            e.currentTarget.setPointerCapture(e.pointerId);
            e.preventDefault();
        }
    }

    document.addEventListener('pointermove', (e) => {
        if (isDraggingNode && draggedNodeId) {
            const nodeEl = document.getElementById(draggedNodeId);
            const containerRect = canvasContainer.getBoundingClientRect();
            
            let newX = e.clientX - containerRect.left + canvasContainer.scrollLeft - dragOffsetX;
            let newY = e.clientY - containerRect.top + canvasContainer.scrollTop - dragOffsetY;
            
            nodeEl.style.left = newX + 'px'; nodeEl.style.top = newY + 'px';
            
            const nodeObj = nodes.find(n => n.id === draggedNodeId);
            if(nodeObj) { nodeObj.x = newX; nodeObj.y = newY; }
            renderLines();
        }
        
        if (isConnecting && tempLine) {
            const containerRect = canvasContainer.getBoundingClientRect();
            const startNode = document.getElementById(connectionStartNodeId);
            const endX = e.clientX - containerRect.left + canvasContainer.scrollLeft;
            const endY = e.clientY - containerRect.top + canvasContainer.scrollTop;
            // start arrow from edge of source box, pointing toward cursor
            const sp = getEdgeIntersection(startNode, endX, endY);
            tempLine.setAttribute("d", `M ${sp.x} ${sp.y} C ${sp.x} ${sp.y + (endY - sp.y) / 2}, ${endX} ${endY - (endY - sp.y) / 2}, ${endX} ${endY}`);
        }
    });

    document.addEventListener('pointerup', (e) => {
        let changed = false;
        if (isDraggingNode && draggedNodeId) {
            document.getElementById(draggedNodeId).releasePointerCapture(e.pointerId);
            isDraggingNode = false; draggedNodeId = null;
            changed = true;
        }
        
        if (isConnecting) {
            const targetEl = document.elementFromPoint(e.clientX, e.clientY);
            const targetNode = targetEl ? targetEl.closest('.node') : null;
            
            if (targetNode && targetNode.id !== connectionStartNodeId) {
                connections.push({ from: connectionStartNodeId, to: targetNode.id, id: 'conn_' + Date.now() });
                changed = true;
            }
            if (tempLine) tempLine.remove();
            isConnecting = false; connectionStartNodeId = null; tempLine = null;
            renderLines();
        }
        
        if(changed) saveData();
    });

    /**
     * Computes the point on the border of nodeEl's bounding rectangle
     * that lies on the line from nodeEl's center toward (targetCX, targetCY).
     */
    function getEdgeIntersection(nodeEl, targetCX, targetCY) {
        const nx  = parseFloat(nodeEl.style.left);
        const ny  = parseFloat(nodeEl.style.top);
        const nw  = nodeEl.offsetWidth;
        const nh  = nodeEl.offsetHeight;
        const cx  = nx + nw / 2;
        const cy  = ny + nh / 2;
        const dx  = targetCX - cx;
        const dy  = targetCY - cy;

        // If target is the same point, return center (degenerate case)
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return { x: cx, y: cy };

        const hw = nw / 2;  // half-width
        const hh = nh / 2;  // half-height

        // Scale factor t: how far we travel along (dx,dy) before hitting an edge
        const tx = Math.abs(dx) > 0.01 ? hw / Math.abs(dx) : Infinity;
        const ty = Math.abs(dy) > 0.01 ? hh / Math.abs(dy) : Infinity;
        const t  = Math.min(tx, ty);

        return { x: cx + t * dx, y: cy + t * dy };
    }

    function renderLines() {
        // refX=8 places the arrowhead tip cleanly at the computed edge point
        let linesHtml = '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" class="arrowhead" /></marker><marker id="arrow-hover" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#ef4444" class="arrowhead" /></marker></defs>';
        
        connections.forEach(conn => {
            const startNode = document.getElementById(conn.from);
            const endNode   = document.getElementById(conn.to);
            if (!startNode || !endNode) return;

            // Centers of each box
            const sCx = parseFloat(startNode.style.left) + startNode.offsetWidth  / 2;
            const sCy = parseFloat(startNode.style.top)  + startNode.offsetHeight / 2;
            const eCx = parseFloat(endNode.style.left)   + endNode.offsetWidth    / 2;
            const eCy = parseFloat(endNode.style.top)    + endNode.offsetHeight   / 2;

            // Edge intersection points: arrow exits source box and enters target box
            const sp = getEdgeIntersection(startNode, eCx, eCy);
            const ep = getEdgeIntersection(endNode,   sCx, sCy);

            // Direction-aligned Bezier: control points follow the center-to-center
            // direction vector so the curve departs/arrives tangentially at each edge.
            // This makes orient="auto" correctly align the arrowhead with the line angle.
            const dx   = eCx - sCx;
            const dy   = eCy - sCy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux   = dx / dist;           // unit vector x
            const uy   = dy / dist;           // unit vector y
            const pull = Math.max(dist / 3, 60); // control-point arm length

            const cp1x = sp.x + ux * pull;
            const cp1y = sp.y + uy * pull;
            const cp2x = ep.x - ux * pull;
            const cp2y = ep.y - uy * pull;

            const d = `M ${sp.x} ${sp.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ep.x} ${ep.y}`;
            linesHtml += `<path class="connection" id="${conn.id}" d="${d}" marker-end="url(#arrow)"></path>`;
        });
        
        linesCanvas.innerHTML = linesHtml;
        
        document.querySelectorAll('.connection').forEach(path => {
            path.addEventListener('dblclick', (e) => {
                connections = connections.filter(c => c.id !== e.target.id);
                renderLines();
                saveData();
            });
            path.addEventListener('mouseenter', (e) => { e.target.setAttribute("marker-end", "url(#arrow-hover)"); });
            path.addEventListener('mouseleave', (e) => { e.target.setAttribute("marker-end", "url(#arrow)"); });
        });
    }

    // Export Logic
    function getCanvasBounds() {
        if(nodes.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        document.querySelectorAll('.node').forEach(node => {
            const rect = node.getBoundingClientRect();
            const pRect = canvasContainer.getBoundingClientRect();
            const left = rect.left - pRect.left + canvasContainer.scrollLeft;
            const top = rect.top - pRect.top + canvasContainer.scrollTop;
            if(left < minX) minX = left; if(top < minY) minY = top;
            if(left + rect.width > maxX) maxX = left + rect.width; if(top + rect.height > maxY) maxY = top + rect.height;
        });
        return { x: minX - 50, y: minY - 50, width: (maxX - minX) + 100, height: (maxY - minY) + 100 };
    }

    const exportNode = (format) => {
        const bounds = getCanvasBounds();
        if(!bounds) return alert("Nothing to export!");
        
        const wrapper = document.getElementById('exportWrapper');
        const oldOver = wrapper.style.overflow;
        wrapper.style.overflow = 'visible';
        
        // Hide UI buttons prior to capture
        const headers = document.querySelectorAll('.node-header');
        headers.forEach(h => h.style.display = 'none');
        
        window.html2canvas(canvasContainer, {
            x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
            backgroundColor: null, scale: 2
        }).then(canvas => {
            // Restore UI buttons immediately
            headers.forEach(h => h.style.display = '');
            wrapper.style.overflow = oldOver;
            
            if(format === 'png') {
                const link = document.createElement('a'); link.download = 'flowchart.png';
                link.href = canvas.toDataURL('image/png', 1.0); link.click();
            } else if (format === 'pdf') {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new window.jspdf.jsPDF({
                    orientation: bounds.width > bounds.height ? 'l' : 'p',
                    unit: 'px', format: [bounds.width, bounds.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, bounds.width, bounds.height);
                pdf.save('flowchart.pdf');
            }
        });
    };

    document.getElementById('exportPng').addEventListener('click', (e) => { e.preventDefault(); exportNode('png'); });
    document.getElementById('exportPdf').addEventListener('click', (e) => { e.preventDefault(); exportNode('pdf'); });

    // Init
    renderTab();
});
