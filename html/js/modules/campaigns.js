// ============================================
// Campaigns Module
// Handles campaign linking and party member display
// ============================================

function updateCampaignDisplay() {
    const campaignSection = document.getElementById('campaign-section');
    const campaignInfo = document.getElementById('campaign-info');
    const linkBtn = document.getElementById('campaign-link-btn');
    const unlinkBtn = document.getElementById('campaign-unlink-btn');
    const partySection = document.getElementById('party-section');

    if (!campaignSection) return;

    if (!window.authToken) {
        campaignSection.style.display = 'none';
        return;
    }

    campaignSection.style.display = 'block';

    if (!window.currentCharacterId) {
        campaignInfo.innerHTML = '<span class="no-campaign">Save your character to cloud first to link to a campaign</span>';
        linkBtn.style.display = 'none';
        unlinkBtn.style.display = 'none';
        if (partySection) partySection.style.display = 'none';
        return;
    }

    if (partySection) partySection.style.display = 'block';

    if (window.currentCampaign) {
        campaignInfo.innerHTML = `
            <div class="campaign-details">
                <span class="campaign-name">${window.escapeHtml(window.currentCampaign.name)}</span>
                <span class="campaign-dm">DM: ${window.escapeHtml(window.currentCampaign.dm_name)}</span>
            </div>
            <a href="dm-session.html?campaign=${window.currentCampaign.id}" class="campaign-link-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                View Campaign Sessions
            </a>
        `;
        linkBtn.style.display = 'none';
        unlinkBtn.style.display = 'inline-flex';
    } else {
        campaignInfo.innerHTML = '<span class="no-campaign">Not linked to any campaign</span>';
        linkBtn.style.display = 'inline-flex';
        unlinkBtn.style.display = 'none';
    }
}

function showLinkCampaignModal() {
    const modal = document.getElementById('link-campaign-modal');
    document.getElementById('campaign-share-code').value = '';
    modal.style.display = 'flex';
}

function hideLinkCampaignModal() {
    document.getElementById('link-campaign-modal').style.display = 'none';
}

async function linkCharacterToCampaign() {
    if (!window.currentCharacterId || !window.authToken) {
        alert('You must save your character to the server first.');
        return;
    }

    const shareCode = document.getElementById('campaign-share-code').value.trim();
    if (!shareCode) {
        alert('Please enter a campaign code.');
        return;
    }

    try {
        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}/link-campaign`, {
            method: 'POST',
            body: JSON.stringify({ share_code: shareCode })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`❌ ${data.error || 'Failed to link campaign'}`);
            return;
        }

        hideLinkCampaignModal();
        location.reload();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function unlinkCharacterFromCampaign() {
    if (!window.currentCharacterId || !window.authToken) return;

    if (!confirm('Are you sure you want to unlink this character from the campaign?')) {
        return;
    }

    try {
        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}/link-campaign`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Failed to unlink campaign'}`);
            return;
        }

        location.reload();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function loadPartyMembers() {
    if (!window.currentCharacterId || !window.authToken || !window.currentCampaign) {
        updatePartyDisplay([]);
        return;
    }

    try {
        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}/party`);

        if (!res.ok) {
            updatePartyDisplay([]);
            return;
        }

        const data = await res.json();
        updatePartyDisplay(data.party || []);
    } catch (error) {
        updatePartyDisplay([]);
    }
}

function updatePartyDisplay(party) {
    const partyList = document.getElementById('party-list');

    if (!partyList) return;

    if (party.length === 0) {
        partyList.innerHTML = '<p class="no-party">No other characters in this campaign yet.</p>';
        return;
    }

    partyList.innerHTML = party.map(member => `
        <div class="party-member">
            <span class="party-member-name">${window.escapeHtml(member.name)}</span>
            <span class="party-member-player">(${window.escapeHtml(member.player_name)})</span>
        </div>
    `).join('');
}

// Export to global scope
window.updateCampaignDisplay = updateCampaignDisplay;
window.showLinkCampaignModal = showLinkCampaignModal;
window.hideLinkCampaignModal = hideLinkCampaignModal;
window.linkCharacterToCampaign = linkCharacterToCampaign;
window.unlinkCharacterFromCampaign = unlinkCharacterFromCampaign;
window.loadPartyMembers = loadPartyMembers;
window.updatePartyDisplay = updatePartyDisplay;
