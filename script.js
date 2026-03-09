const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
let masterIssueList = [];

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    fetchProjectIssues();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById("searchTrigger").addEventListener("click", executeSearch);
    document.getElementById("filterAll").addEventListener("click", (e) => filterContent(e.target, "all"));
    document.getElementById("filterOpen").addEventListener("click", (e) => filterContent(e.target, "open"));
    document.getElementById("filterClosed").addEventListener("click", (e) => filterContent(e.target, "closed"));
    document.getElementById("closeModal").addEventListener("click", hideModal);
}

async function fetchProjectIssues() {
    toggleLoader(true);
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        masterIssueList = result.data;
        renderIssues(masterIssueList);
    } catch (err) {
        console.error("Fetch Error:", err);
    } finally {
        toggleLoader(false);
    }
}

async function executeSearch() {
    const query = document.getElementById("searchInput").value;
    toggleLoader(true);
    try {
        const response = await fetch(`${API_URL}/search?q=${query}`);
        const result = await response.json();
        renderIssues(result.data);
    } catch (err) {
        console.error("Search Error:", err);
    } finally {
        toggleLoader(false);
    }
}

function filterContent(clickedBtn, type) {
    updateTabStyles(clickedBtn);
    if (type === "all") {
        renderIssues(masterIssueList);
    } else {
        const filtered = masterIssueList.filter(item => item.status === type);
        renderIssues(filtered);
    }
}

function updateTabStyles(activeBtn) {
    document.querySelectorAll(".tabBtn").forEach(btn => {
        btn.classList.replace("bg-pink-600", "bg-gray-700");
    });
    activeBtn.classList.replace("bg-gray-700", "bg-pink-600");
}

function renderIssues(dataList) {
    const viewContainer = document.getElementById("issuesContainer");
    viewContainer.innerHTML = "";
    document.getElementById("issueCount").innerText = dataList.length;

    dataList.forEach(ticket => {
        const ticketNode = document.createElement("div");
        const isTicketOpen = ticket.status === "open";
        const accentColor = isTicketOpen ? "border-green-500" : "border-purple-500";
        
        ticketNode.className = `bg-gray-800 p-5 rounded-xl border-t-4 ${accentColor} shadow-md cursor-pointer hover:scale-[1.02] transition`;
        
        const priorityClasses = ticket.priority === "HIGH" ? "bg-red-500/20 text-red-400" : 
                               ticket.priority === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" : 
                               "bg-gray-500/20 text-gray-300";

        ticketNode.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center ${isTicketOpen ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}">
                        ${isTicketOpen ? "●" : "✓"}
                    </div>
                </div>
                <span class="text-xs px-3 py-1 rounded-full ${priorityClasses}">${ticket.priority}</span>
            </div>
            <h3 class="font-semibold text-sm mb-2">${ticket.title}</h3>
            <p class="text-gray-400 text-xs mb-4">${ticket.description.substring(0, 70)}...</p>
            <div class="flex gap-2 mb-4">
                <span class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">🐞 BUG</span>
                <span class="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">⚠ HELP WANTED</span>
            </div>
            <div class="border-t border-gray-700 pt-3 text-xs text-gray-400">
                <p>#${ticket.id} by ${ticket.author}</p>
                <p>${new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        ticketNode.onclick = () => showTicketDetails(ticket);
        viewContainer.appendChild(ticketNode);
    });
}

function showTicketDetails(ticket) {
    const modal = document.getElementById("modalOverlay");
    modal.classList.replace("hidden", "flex");
    
    document.getElementById("modalTitle").innerText = ticket.title;
    document.getElementById("modalDesc").innerText = ticket.description;
    document.getElementById("modalStatus").innerText = ticket.status;
    document.getElementById("modalAuthor").innerText = ticket.author;
    document.getElementById("modalLabel").innerText = ticket.label || "N/A";
    document.getElementById("modalDate").innerText = ticket.createdAt;
    
    const priorityBadge = document.getElementById("modalPriority");
    priorityBadge.innerText = ticket.priority;
    priorityBadge.className = `ml-2 px-3 py-1 rounded-full text-xs text-white ${ticket.priority === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'}`;
}

function hideModal() {
    document.getElementById("modalOverlay").classList.replace("flex", "hidden");
}

function toggleLoader(isVisible) {
    document.getElementById("loading").classList.toggle("hidden", !isVisible);
}