// Slider update functions

function initializeSliders() {
    console.log('initializeSliders() called');

    // Arcana slider
    const arcanaSlider = document.getElementById('arcana_slider');
    const arcanaDisplay = document.getElementById('arcana-value-display');

    if (arcanaSlider && arcanaDisplay) {
        console.log('✓ Arcana slider found');
        arcanaSlider.addEventListener('input', function() {
            const value = this.value;
            const max = this.max;
            arcanaDisplay.textContent = `${value} / ${max}`;

            // Update gradient to show filled portion
            const percentage = (value / max) * 100;
            this.style.background = `linear-gradient(to right, var(--primary-purple) ${percentage}%, rgba(139, 92, 246, 0.3) ${percentage}%)`;
        });

        // Initialize on load
        arcanaSlider.dispatchEvent(new Event('input'));
    } else {
        console.error('✗ Arcana slider or display not found');
    }

    // Generic slider update function
    function updateSliderDisplay(sliderId, displayId, prefix = '') {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);

        if (slider && display) {
            slider.addEventListener('input', function() {
                display.textContent = `${prefix}${this.value}`;
            });

            // Initialize
            display.textContent = `${prefix}${slider.value}`;
        }
    }

    // Willpower slider (with max value display)
    const willpowerSlider = document.getElementById('willpower_slider');
    const willpowerDisplay = document.getElementById('willpower-value-display');

    if (willpowerSlider && willpowerDisplay) {
        willpowerSlider.addEventListener('input', function() {
            const value = this.value;
            const max = this.max;
            willpowerDisplay.textContent = `${value} / ${max}`;
        });

        // Initialize on load
        willpowerDisplay.textContent = `${willpowerSlider.value} / ${willpowerSlider.max}`;
    }

    // HP slider (with max value display and color gradient)
    const hpSlider = document.getElementById('hp_slider');
    const hpDisplay = document.getElementById('hp-value-display');

    if (hpSlider && hpDisplay) {
        hpSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            const max = parseInt(this.max);
            hpDisplay.textContent = `${value} / ${max}`;

            // Calculate color based on HP percentage
            const percentage = (value / max) * 100;
            let color;

            if (percentage >= 60) {
                // High HP: Green
                color = '#10b981';
            } else if (percentage >= 30) {
                // Medium HP: Orange
                color = '#f59e0b';
            } else {
                // Low HP: Red
                color = '#ef4444';
            }

            // Update gradient to show filled portion with color
            const fillPercentage = (value / max) * 100;
            this.style.background = `linear-gradient(to right, ${color} ${fillPercentage}%, rgba(100, 116, 139, 0.3) ${fillPercentage}%)`;

            // Update display color
            hpDisplay.style.color = color;
        });

        // Initialize on load
        hpDisplay.textContent = `${hpSlider.value} / ${hpSlider.max}`;
        hpSlider.dispatchEvent(new Event('input'));
    }

    // Worthiness slider (with max value display and color gradient)
    const worthinessSlider = document.getElementById('worthiness_slider');
    const worthinessDisplay = document.getElementById('worthiness-value-display');
    const worthinessDescription = document.getElementById('worthiness-description');

    // Function to get description based on worthiness value
    function getWorthinessDescription(value) {
        if (value === 10) return "You are highly esteemed and treated with great respect everywhere";
        if (value >= 9) return "You seem trustworthy and are welcomed in most cities";
        if (value >= 7) return "People respect you and listen to what you have to say";
        if (value >= 5) return "Nobody has anything against you, you are an ordinary citizen";
        if (value >= 3) return "People accept you but keep an eye on you";
        if (value >= 1) return "You are unknown and people are cautious around you";
        if (value === 0) return "People don't care about you, you are a nobody";
        if (value >= -2) return "Distrust follows you, people keep their distance";
        if (value >= -5) return "Bad reputation, guards are keeping tabs on you";
        if (value >= -8) return "You are notorious, many cities don't want you here";
        if (value === -10) return "You are a public enemy, actively hunted with a bounty on your head";
        return "You are hunted from cities and have wanted posters up";
    }

    if (worthinessSlider && worthinessDisplay) {
        console.log('✓ Worthiness slider found');
        worthinessSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            const max = parseInt(this.max);
            const min = parseInt(this.min);
            worthinessDisplay.textContent = `${value} / ${max}`;

            // Calculate color based on value (-10 to +10)
            // Red around 0 and below, Green at +10
            let color;
            if (value <= 0) {
                // 0 and below: Red (darker red as it goes more negative)
                const darkness = Math.max(0, value + 10) / 10; // 0 to 1 (1 at 0, 0 at -10)
                const red = Math.floor(150 + darkness * 105); // 150 to 255
                const green = 0;
                color = `rgb(${red}, ${green}, 0)`;
            } else {
                // 0 to +10: Red to Yellow to Green
                const ratio = value / max; // 0 to 1
                const red = Math.floor(255 * (1 - ratio)); // 255 to 0
                const green = Math.floor(100 + ratio * 155); // 100 to 255
                color = `rgb(${red}, ${green}, 0)`;
            }

            // Update the display color
            worthinessDisplay.style.color = color;

            // Update description text
            if (worthinessDescription) {
                worthinessDescription.textContent = getWorthinessDescription(value);
            }

            console.log(`Worthiness changed to: ${value} / ${max} (color: ${color})`);
        });

        // Initialize on load
        const initValue = parseInt(worthinessSlider.value);
        const initMax = parseInt(worthinessSlider.max);
        worthinessDisplay.textContent = `${initValue} / ${initMax}`;
        worthinessSlider.dispatchEvent(new Event('input'));
    } else {
        console.error('✗ Worthiness slider or display not found');
    }

    // Bleed slider with warning at 6 and color gradient
    const bleedSlider = document.getElementById('bleed_slider');
    const bleedValue = document.getElementById('bleed-value');
    const bleedWarning = document.getElementById('bleed-warning');

    if (bleedSlider && bleedValue) {
        bleedSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            const max = parseInt(this.max);
            bleedValue.textContent = value;

            // Show warning when value reaches 6
            if (bleedWarning) {
                bleedWarning.style.display = value === 6 ? 'block' : 'none';
            }

            // Calculate color: Green (0-2) -> Orange (3-4) -> Red (5-6)
            let color;
            if (value <= 2) {
                // Green range
                color = '#10b981'; // Green
            } else if (value <= 4) {
                // Orange range
                color = '#f59e0b'; // Orange
            } else {
                // Red range
                color = '#ef4444'; // Red
            }

            // Update gradient to show filled portion with color
            const percentage = (value / max) * 100;
            this.style.background = `linear-gradient(to right, ${color} ${percentage}%, rgba(100, 116, 139, 0.3) ${percentage}%)`;
        });

        // Initialize on load
        bleedValue.textContent = bleedSlider.value;
        bleedSlider.dispatchEvent(new Event('input'));
    }

    // Weakened slider with warning at 6 and color gradient
    const weakenedSlider = document.getElementById('weakened_slider');
    const weakenedValue = document.getElementById('weakened-value');
    const weakenedWarning = document.getElementById('weakened-warning');

    if (weakenedSlider && weakenedValue) {
        weakenedSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            const max = parseInt(this.max);
            weakenedValue.textContent = value;

            // Show warning when value reaches 6
            if (weakenedWarning) {
                weakenedWarning.style.display = value === 6 ? 'block' : 'none';
            }

            // Calculate color: Green (0-2) -> Orange (3-4) -> Red (5-6)
            let color;
            if (value <= 2) {
                // Green range
                color = '#10b981'; // Green
            } else if (value <= 4) {
                // Orange range
                color = '#f59e0b'; // Orange
            } else {
                // Red range
                color = '#ef4444'; // Red
            }

            // Update gradient to show filled portion with color
            const percentage = (value / max) * 100;
            this.style.background = `linear-gradient(to right, ${color} ${percentage}%, rgba(100, 116, 139, 0.3) ${percentage}%)`;
        });

        // Initialize on load
        weakenedValue.textContent = weakenedSlider.value;
        weakenedSlider.dispatchEvent(new Event('input'));
    }

    // Initialize other sliders
    updateSliderDisplay('pot_adrenaline_slider', 'pot-adrenaline-value');
    updateSliderDisplay('pot_antidote_slider', 'pot-antidote-value');
    updateSliderDisplay('pot_poison_slider', 'pot-poison-value');
    updateSliderDisplay('pot_arcane_slider', 'pot-arcane-value');
    updateSliderDisplay('poison_arrow_slider', 'poison-arrow-value');
}

// Note: Initialization is handled by init.js after all DOM elements are created
