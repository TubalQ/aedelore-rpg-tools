// Tab switching functionality

function switchTab(tabId) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Find and activate the clicked tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('onclick')?.includes(tabId)) {
            tab.classList.add('active');
        }
    });

    // Show the corresponding content
    const content = document.getElementById(tabId);
    if (content) {
        content.classList.add('active');
    }

    // Toggle status bar visibility (hide on dashboard, show on other pages)
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.classList.toggle('status-bar-hidden', tabId === 'page-dashboard');
    }

    // Update dashboard when returning to it
    if (tabId === 'page-dashboard' && typeof updateDashboard === 'function') {
        updateDashboard();
        updateStatusBar();
    }
}
