// Fix for single-click focus in table cells
// This ensures input fields get focus on first click

document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to all table cells containing inputs
    document.querySelectorAll('td').forEach(cell => {
        cell.addEventListener('click', function(e) {
            // If the cell contains an input/textarea/select and the click wasn't directly on it
            const input = cell.querySelector('input, textarea, select');
            if (input && e.target !== input) {
                e.preventDefault();
                input.focus();
                // For text inputs, also select the content for easy editing
                if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                    input.select();
                }
            }
        });
    });

    console.log('✓ Focus fix initialized');
});
