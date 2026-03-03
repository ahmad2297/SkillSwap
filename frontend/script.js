// --- GLOBAL DATA STORAGE ---
// We store the mentors in this array so the Search feature can filter them 
// without having to ask the database every time you type a letter.
let allMentors = [];

// --- 1. REGISTRATION LOGIC (CREATE) ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const skill = document.getElementById('skill').value.trim();
        const errorMsg = document.getElementById('errorMsg');

        // Basic validation check
        if (!name || !email || !skill) {
            errorMsg.style.color = "red";
            errorMsg.textContent = "❌ Error: Please fill in all fields.";
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, skill })
            });

            if (response.ok) {
                errorMsg.style.color = "#18bc9c"; // Match your accent color
                errorMsg.textContent = "✅ Success! You have been registered.";
                registerForm.reset(); 
            } else {
                const data = await response.json();
                errorMsg.style.color = "red";
                errorMsg.textContent = "❌ Database Error: " + (data.error || "Could not save.");
            }
        } catch (error) {
            errorMsg.style.color = "red";
            errorMsg.textContent = "❌ Server Error: Is your backend running?";
        }
    });
}

// --- 2. DASHBOARD LOGIC (READ) ---
async function loadSkills() {
    const list = document.getElementById('skillsList');
    if (!list) return; // Only run if we are on the Dashboard page

    try {
        const response = await fetch('http://localhost:3000/skills');
        allMentors = await response.json(); // Save to our global array
        renderTable(allMentors);
    } catch (error) {
        console.error("Failed to load mentors:", error);
    }
}

// This function creates the actual HTML rows for the table
function renderTable(data) {
    const list = document.getElementById('skillsList');
    if (!list) return;

    if (data.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align:center;">No mentors found.</td></tr>';
        return;
    }

    list.innerHTML = data.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span style="background:#dbeafe; color:#2563eb; padding:5px 10px; border-radius:4px; font-weight:bold;">${user.skill_name}</span></td>
            <td>
                <button class="btn-edit" onclick="editSkill(${user.id}, '${user.skill_name}')">Edit</button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// --- 3. SEARCH FILTER LOGIC ---
function filterSkills() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const term = searchInput.value.toLowerCase();
    
    // Filters through the global 'allMentors' array
    const filtered = allMentors.filter(mentor => 
        mentor.skill_name.toLowerCase().includes(term) || 
        mentor.name.toLowerCase().includes(term)
    );
    
    renderTable(filtered); // Redraw the table with only matched results
}

// --- 4. UPDATE LOGIC (UPDATE) ---
async function editSkill(id, currentSkill) {
    const newSkill = prompt("Update skill for this user:", currentSkill);
    
    // Only proceed if the user typed something and it's different from the old skill
    if (!newSkill || newSkill.trim() === currentSkill) return;

    try {
        const response = await fetch('http://localhost:3000/update-skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, newSkill: newSkill.trim() })
        });

        if (response.ok) {
            loadSkills(); // Refresh the data without reloading the whole page
        } else {
            alert("Error updating skill.");
        }
    } catch (error) {
        console.error("Update error:", error);
    }
}

// --- 5. DELETE LOGIC (DELETE) ---
async function deleteUser(id) {
    if (!confirm("Are you sure you want to remove this mentor? This cannot be undone.")) return;

    try {
        const response = await fetch('http://localhost:3000/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        if (response.ok) {
            loadSkills(); // Refresh the data
        } else {
            alert("Error deleting user.");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

// --- INITIALIZE ---
// Run loadSkills as soon as the Dashboard page finishes loading
document.addEventListener('DOMContentLoaded', loadSkills);