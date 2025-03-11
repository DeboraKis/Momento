document.addEventListener('DOMContentLoaded', () => {
    // Initialize views and navigation
    const views = {
        create: document.getElementById('create-view'),
        capsules: document.getElementById('capsules-view'),
        about: document.getElementById('about-view')
    };

    // Navigation handling
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = e.target.closest('a').dataset.view;
            showView(viewId, views);
            updateActiveLink(e.target.closest('a'));
        });
    });

    // Form submission
    document.getElementById('capsuleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const title = document.getElementById('title').value.trim();
            const message = document.getElementById('message').value.trim();
            const lockDate = document.getElementById('lockDate').value;

            if (!title || !message || !lockDate) {
                throw new Error('Please fill in all fields');
            }

            const capsuleData = {
                title,
                message,
                lockDate: new Date(lockDate).toISOString()
            };

            const response = await fetch('http://localhost:3000/capsules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(capsuleData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create capsule');
            }

            const result = await response.json();
            
            // Clear form and show success message
            document.getElementById('capsuleForm').reset();
            alert('Time capsule created successfully!');
            
            // Reload capsules
            loadCapsules();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error creating time capsule');
        }
    });

    // Initial setup
    showView('create', views);
    loadCapsules();
});

function showView(viewId, views) {
    // Hide all views
    Object.values(views).forEach(view => {
        if (view) view.classList.add('hidden');
    });
    // Show selected view
    const selectedView = views[viewId];
    if (selectedView) selectedView.classList.remove('hidden');
}

function updateActiveLink(clickedLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

async function loadCapsules() {
    try {
        const response = await fetch('http://localhost:3000/capsules');
        if (!response.ok) {
            throw new Error('Failed to fetch capsules');
        }
        
        const capsules = await response.json();
        const capsulesListDiv = document.getElementById('capsulesList');
        if (!capsulesListDiv) return;
        
        capsulesListDiv.innerHTML = '';

        // Update stats
        let lockedCount = 0;
        let unlockedCount = 0;

        capsules.forEach(capsule => {
            const isLocked = new Date(capsule.lockDate) > new Date();
            if (isLocked) lockedCount++; else unlockedCount++;
            
            const capsuleElement = document.createElement('div');
            capsuleElement.className = `capsule-card ${isLocked ? 'locked' : ''}`;
            
           // Update the capsule rendering in loadCapsules()
capsuleElement.innerHTML = `
<div class="status-badge ${isLocked ? 'status-locked' : 'status-unlocked'}">
    ${isLocked ? '🔒 Locked' : '🔓 Unlocked'}
</div>
<h3>${capsule.title}</h3>
<p>${isLocked ? 
    `Locked until: ${new Date(capsule.lockDate).toLocaleDateString()}` : 
    capsule.message}
</p>
${!isLocked ? 
    `<button class="delete-btn" onclick="deleteCapsule('${capsule._id}')">
        <i class="fas fa-trash"></i> Delete
    </button>` : 
    ''}
`;
            
            capsulesListDiv.appendChild(capsuleElement);
        });

        // Update stats display
        const lockedCountElement = document.getElementById('locked-count');
        const unlockedCountElement = document.getElementById('unlocked-count');
        if (lockedCountElement) lockedCountElement.textContent = lockedCount;
        if (unlockedCountElement) unlockedCountElement.textContent = unlockedCount;

    } catch (error) {
        console.error('Error loading capsules:', error);
        alert('Error loading capsules: ' + error.message);
    }
}

// Make deleteCapsule function global for onclick handler
window.deleteCapsule = async function(id) {
    if (confirm('Are you sure you want to delete this time capsule?')) {
        try {
            const response = await fetch(`http://localhost:3000/capsules/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete capsule');
            }

            await loadCapsules();
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting capsule: ' + error.message);
        }
    }
}
window.deleteCapsule = deleteCapsule;
