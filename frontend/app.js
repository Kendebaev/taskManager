const API_URL = '/api/habits';

// DOM Elements
const habitList = document.getElementById('habit-list');
const addHabitForm = document.getElementById('add-habit-form');
const habitNameInput = document.getElementById('habit-name');
const template = document.getElementById('habit-template');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const statsEl = document.getElementById('stats');

// State
let habits = [];

// Initialize
document.addEventListener('DOMContentLoaded', fetchHabits);

// --- SRE Chaos Panel Logic ---
const CHAOS_API = '/api/chaos';
const btnLatency = document.getElementById('btn-latency');
const btnErrors = document.getElementById('btn-errors');

btnLatency.addEventListener('click', () => toggleChaos('latency', btnLatency));
btnErrors.addEventListener('click', () => toggleChaos('errors', btnErrors));

async function toggleChaos(type, btnElement) {
    try {
        const response = await fetch(`${CHAOS_API}/${type}`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to toggle chaos mode');
        const data = await response.json();
        
        const isActive = type === 'latency' ? data.isLatencyActive : data.isErrorsActive;
        
        if (isActive) {
            btnElement.classList.add('active');
        } else {
            btnElement.classList.remove('active');
        }
    } catch (error) {
        console.error('Error toggling chaos mode:', error);
    }
}
// -----------------------------

// Event Listeners
addHabitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    if (!name) return;
    
    await addHabit(name);
    habitNameInput.value = '';
});

// API Calls
async function fetchHabits() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch habits');
        
        habits = await response.json();
        renderHabits();
    } catch (error) {
        console.error('Error fetching habits:', error);
        // Show silent error in UI for robust UX
        habitList.innerHTML = `<li style="color:var(--danger);text-align:center;padding:1rem;">Could not load habits. Please ensure backend is running.</li>`;
        loadingEl.classList.add('hidden');
        habitList.classList.remove('hidden');
    }
}

async function addHabit(name) {
    try {
        // Optimistic UI - could be implemented here
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });
        
        if (!response.ok) throw new Error('Failed to add habit');
        
        const newHabit = await response.json();
        habits.unshift(newHabit); // Add to beginning
        renderHabits();
    } catch (error) {
        console.error('Error adding habit:', error);
        alert('Failed to add habit. Please try again.');
    }
}

async function toggleHabit(id) {
    try {
        // Optimistic UI update
        const index = habits.findIndex(h => h._id === id);
        if (index !== -1) {
            habits[index].status = !habits[index].status;
            renderHabits(); // Re-render to show immediate feedback
        }

        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH',
        });
        
        if (!response.ok) {
            // Revert on failure
            habits[index].status = !habits[index].status;
            renderHabits();
            throw new Error('Failed to toggle habit');
        }
    } catch (error) {
        console.error('Error toggling habit:', error);
    }
}

async function deleteHabit(id) {
    try {
        // Optimistic UI Update
        habits = habits.filter(h => h._id !== id);
        renderHabits();

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            // Re-fetch to sync if delete failed
            fetchHabits();
            throw new Error('Failed to delete habit');
        }
    } catch (error) {
        console.error('Error deleting habit:', error);
    }
}

// UI Rendering
function renderHabits() {
    // Hide loading
    loadingEl.classList.add('hidden');
    
    // Manage empty state
    if (habits.length === 0) {
        emptyStateEl.classList.remove('hidden');
        habitList.classList.add('hidden');
        updateStats();
        return;
    }
    
    emptyStateEl.classList.add('hidden');
    habitList.classList.remove('hidden');
    
    // Clear list
    habitList.innerHTML = '';
    
    // Render items
    habits.forEach(habit => {
        const clone = template.content.cloneNode(true);
        const li = clone.querySelector('li');
        const checkbox = clone.querySelector('.habit-checkbox');
        const text = clone.querySelector('.habit-text');
        const deleteBtn = clone.querySelector('.delete-btn');
        
        // Set values
        text.textContent = habit.name;
        checkbox.checked = habit.status;
        
        if (habit.status) {
            li.classList.add('completed');
        }
        
        // Attach listeners
        checkbox.addEventListener('change', () => toggleHabit(habit._id));
        deleteBtn.addEventListener('click', () => {
            // Add disappearing animation
            li.style.transform = 'scale(0.9) translateX(20px)';
            li.style.opacity = '0';
            setTimeout(() => deleteHabit(habit._id), 200);
        });
        
        habitList.appendChild(clone);
    });
    
    updateStats();
}

function updateStats() {
    const total = habits.length;
    const completed = habits.filter(h => h.status).length;
    
    const badge = statsEl.querySelector('.badge');
    badge.textContent = `${completed} / ${total} Completed`;
    
    if (total > 0 && completed === total) {
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
    } else {
        badge.style.background = 'rgba(59, 130, 246, 0.2)';
        badge.style.color = '#60a5fa';
    }
}
