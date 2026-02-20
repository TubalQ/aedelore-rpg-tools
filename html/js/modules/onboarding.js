// ============================================
// Onboarding Module
// Handles the getting started guide
// ============================================

function isAedeloreSystem() {
    const currentSystem = localStorage.getItem('aedelore_selected_system') || 'aedelore';
    return currentSystem === 'aedelore';
}

function initOnboarding() {
    const dismissed = localStorage.getItem('onboarding_dismissed');
    if (dismissed === 'true') return;

    const isLoggedIn = !!window.authToken;
    if (isLoggedIn) return;

    adjustOnboardingForSystem();

    if (!dismissed) {
        showOnboarding();
    }

    window._onboardingInterval = setInterval(updateOnboardingProgress, 1000);
    cloneOnboardingForMobile();
}

function adjustOnboardingForSystem() {
    const isAedelore = isAedeloreSystem();
    const aedeloreOnlyStepIds = ['onboard-step-4', 'onboard-step-5', 'onboard-step-6', 'onboard-step-7'];
    const renumberMap = { 'onboard-step-8': '4', 'onboard-step-9': '5', 'onboard-step-10': '6' };

    if (!isAedelore) {
        aedeloreOnlyStepIds.forEach(stepId => {
            const step = document.getElementById(stepId);
            if (step) step.remove();
        });

        const note = document.querySelector('#onboarding-sidebar .onboarding-note');
        if (note) note.remove();
    }

    if (!isAedelore) {
        Object.entries(renumberMap).forEach(([stepId, newNumber]) => {
            const step = document.getElementById(stepId);
            if (step) {
                const numberEl = step.querySelector('.step-number');
                if (numberEl) numberEl.textContent = newNumber;
            }
        });
    }

    const subtitle = document.querySelector('.onboarding-subtitle');
    if (subtitle) {
        subtitle.textContent = isAedelore
            ? 'Follow these steps to get started and to enable campaign mode:'
            : 'Follow these steps to get started:';
    }
}

function cloneOnboardingForMobile() {
    const mobileContent = document.getElementById('onboarding-mobile-content');
    const sidebar = document.getElementById('onboarding-sidebar');

    if (mobileContent && sidebar) {
        const steps = sidebar.querySelector('.onboarding-steps');
        const tip = sidebar.querySelector('.onboarding-tip');
        const note = sidebar.querySelector('.onboarding-note');
        const footer = sidebar.querySelector('.onboarding-footer');

        let html = '';
        if (steps) html += `<div class="onboarding-steps">${steps.innerHTML}</div>`;
        if (tip) html += tip.outerHTML;
        if (note) html += note.outerHTML;
        if (footer) html += `<div class="onboarding-footer">${footer.innerHTML}</div>`;

        mobileContent.innerHTML = html;
        adjustOnboardingForSystemInContainer(mobileContent);
    }
}

function adjustOnboardingForSystemInContainer(container) {
    const isAedelore = isAedeloreSystem();
    const aedeloreOnlySteps = [4, 5, 6, 7];
    const renumberMap = { 8: '4', 9: '5', 10: '6' };

    if (!isAedelore) {
        aedeloreOnlySteps.forEach(num => {
            const step = container.querySelector(`[data-step="${getStepDataAttr(num)}"]`);
            if (step) step.remove();
        });

        const note = container.querySelector('.onboarding-note');
        if (note) note.remove();

        Object.entries(renumberMap).forEach(([origNum, newNum]) => {
            const step = container.querySelector(`[data-step="${getStepDataAttr(origNum)}"]`);
            if (step) {
                const numberEl = step.querySelector('.step-number');
                if (numberEl) numberEl.textContent = newNum;
            }
        });
    }
}

function getStepDataAttr(stepNum) {
    const map = {
        1: 'register', 2: 'name', 3: 'save', 4: 'race-class',
        5: 'lock-rc', 6: 'attributes', 7: 'lock-attr',
        8: 'campaign', 9: 'dm-session', 10: 'overview'
    };
    return map[stepNum];
}

function showOnboarding() {
    const sidebar = document.getElementById('onboarding-sidebar');
    const mobile = document.getElementById('onboarding-mobile');

    if (window.innerWidth > 768) {
        sidebar?.classList.add('visible');
        document.body.classList.add('onboarding-active');
    } else {
        mobile?.classList.add('visible');
    }

    updateOnboardingProgress();
}

function hideOnboarding() {
    const sidebar = document.getElementById('onboarding-sidebar');
    const mobile = document.getElementById('onboarding-mobile');

    sidebar?.classList.remove('visible');
    mobile?.classList.remove('visible', 'expanded');
    document.body.classList.remove('onboarding-active');
}

function hideOnboardingPermanent() {
    localStorage.setItem('onboarding_dismissed', 'true');
    hideOnboarding();
    if (window._onboardingInterval) {
        clearInterval(window._onboardingInterval);
        window._onboardingInterval = null;
    }
}

function toggleOnboardingMobile() {
    const mobile = document.getElementById('onboarding-mobile');
    mobile?.classList.toggle('expanded');
}

function updateOnboardingProgress() {
    const isAedelore = isAedeloreSystem();
    const aedeloreOnlySteps = ['race-class', 'lock-rc', 'attributes', 'lock-attr'];

    if (!isAedelore) {
        const stepsToRemove = ['onboard-step-4', 'onboard-step-5', 'onboard-step-6', 'onboard-step-7'];
        stepsToRemove.forEach(stepId => {
            const step = document.getElementById(stepId);
            if (step) step.remove();
            const mobileStep = document.querySelector(`#onboarding-mobile-content [data-step="${getStepDataAttr(parseInt(stepId.replace('onboard-step-', '')))}"]`);
            if (mobileStep) mobileStep.remove();
        });
        document.querySelectorAll('.onboarding-note').forEach(note => note.remove());
        const renumberMap = { 'onboard-step-8': '4', 'onboard-step-9': '5', 'onboard-step-10': '6' };
        Object.entries(renumberMap).forEach(([stepId, newNum]) => {
            const step = document.getElementById(stepId);
            if (step) {
                const numEl = step.querySelector('.step-number');
                if (numEl && numEl.textContent !== newNum) numEl.textContent = newNum;
            }
        });
    }

    const steps = {
        'register': checkStepRegister(),
        'name': checkStepName(),
        'save': checkStepSave(),
        'race-class': isAedelore ? checkStepRaceClass() : true,
        'lock-rc': isAedelore ? checkStepLockRaceClass() : true,
        'attributes': isAedelore ? checkStepAttributes() : true,
        'lock-attr': isAedelore ? checkStepLockAttributes() : true,
        'campaign': checkStepCampaign(),
        'overview': checkStepOverview()
    };

    let firstIncomplete = null;

    Object.keys(steps).forEach((stepId, index) => {
        const isHiddenStep = !isAedelore && aedeloreOnlySteps.includes(stepId);

        const stepEl = document.querySelector(`[data-step="${stepId}"]`);
        const mobileStepEl = document.querySelector(`#onboarding-mobile-content [data-step="${stepId}"]`);

        if (stepEl) {
            stepEl.classList.toggle('completed', steps[stepId]);
            stepEl.classList.remove('current');
        }
        if (mobileStepEl) {
            mobileStepEl.classList.toggle('completed', steps[stepId]);
            mobileStepEl.classList.remove('current');
        }

        if (!steps[stepId] && !firstIncomplete && !isHiddenStep) {
            firstIncomplete = stepId;
            stepEl?.classList.add('current');
            mobileStepEl?.classList.add('current');
        }
    });

    const allComplete = Object.entries(steps).every(([stepId, completed]) => {
        if (!isAedelore && aedeloreOnlySteps.includes(stepId)) return true;
        return completed;
    });

    if (allComplete) {
        setTimeout(() => {
            hideOnboardingPermanent();
        }, 2000);
    }
}

function checkStepRegister() {
    return !!window.authToken;
}

function checkStepName() {
    const nameField = document.getElementById('character_name');
    return nameField && nameField.value.trim().length > 0;
}

function checkStepSave() {
    return !!window.currentCharacterId;
}

function checkStepRaceClass() {
    const race = document.getElementById('race')?.value;
    const charClass = document.getElementById('class')?.value;
    const religion = document.getElementById('religion')?.value;
    return race && charClass && religion;
}

function checkStepLockRaceClass() {
    return window.raceClassLocked === true;
}

function checkStepAttributes() {
    if (!window.raceClassLocked) return false;
    const pointsUsed = window.getFreePointsUsed ? window.getFreePointsUsed() : 0;
    return pointsUsed >= (window.FREE_POINTS_TOTAL || 10);
}

function checkStepLockAttributes() {
    return window.attributesLocked === true;
}

function checkStepCampaign() {
    const campaignInfo = document.getElementById('campaign-info');
    if (campaignInfo) {
        const noCampaign = campaignInfo.querySelector('.no-campaign');
        return !noCampaign || noCampaign.style.display === 'none';
    }
    return false;
}

function checkStepOverview() {
    const overviewTab = document.querySelector('[data-tab="overview"]');
    return overviewTab && overviewTab.classList.contains('active');
}

// Initialize onboarding when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initOnboarding, 500);
});

// Handle window resize for responsive switching
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('onboarding-sidebar');
    const mobile = document.getElementById('onboarding-mobile');

    if (document.body.classList.contains('onboarding-active') ||
        mobile?.classList.contains('visible')) {
        if (window.innerWidth > 768) {
            sidebar?.classList.add('visible');
            mobile?.classList.remove('visible', 'expanded');
            document.body.classList.add('onboarding-active');
        } else {
            sidebar?.classList.remove('visible');
            mobile?.classList.add('visible');
            document.body.classList.remove('onboarding-active');
        }
    }
});

// Quest & Notes Page - Sync between desktop and mobile
document.addEventListener('DOMContentLoaded', function() {
    const syncPairs = [
        ['inventory_freetext', 'inventory_freetext_mobile'],
        ['notes_freetext', 'notes_freetext_mobile']
    ];

    syncPairs.forEach(([desktopId, mobileId]) => {
        const desktop = document.getElementById(desktopId);
        const mobile = document.getElementById(mobileId);

        if (desktop && mobile) {
            desktop.addEventListener('input', () => { mobile.value = desktop.value; });
            mobile.addEventListener('input', () => { desktop.value = mobile.value; });
            mobile.value = desktop.value;
        }
    });
});

// Export to global scope
window.isAedeloreSystem = isAedeloreSystem;
window.initOnboarding = initOnboarding;
window.showOnboarding = showOnboarding;
window.hideOnboarding = hideOnboarding;
window.hideOnboardingPermanent = hideOnboardingPermanent;
window.toggleOnboardingMobile = toggleOnboardingMobile;
window.updateOnboardingProgress = updateOnboardingProgress;
