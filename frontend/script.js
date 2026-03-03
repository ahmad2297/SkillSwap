// --- REGISTRATION & VALIDATION (CREATE) ---
document.getElementById('registerForm')?.addEventListener('submit', async function(event) {
    event.preventDefault(); // Stop page reload

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const skill = document.getElementById('skill').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    // Reset error message styling
    errorMsg.style.color = "red";

    // Client-Side Validation 
    if (!name || !email || !skill) {
        errorMsg.textContent = "Error: All fields are required!";
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        errorMsg.textContent = "Error: Please enter a valid email address.";
        return;
    }

    // Send data to Backend (Create Operation) 
    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, skill })
        });

        const data = await response.json();

        if (response.ok) {
            errorMsg.style.color = "green";
            errorMsg.textContent = "Registration Successful! Data saved to MySQL.";
            document.getElementById('registerForm').reset(); 
        } else {
            errorMsg.textContent = "Database Error: " + data.error;
        }
    } catch (error) {
        errorMsg.textContent = "Server Error: Make sure your backend is running.";
    }
});

// --- DASHBOARD FUNCTIONS (READ, UPDATE, DELETE) ---

// READ: Fetch and display data 
async function loadSkills() {
    const skillsList = document.getElementById('skillsList');
    if (!skillsList) return; // Only runs on dashboard.html

    try {
        const response = await fetch('http://localhost:3000/skills');
        const data = await response.json();

        skillsList.innerHTML = ''; // Clear existing table rows
        
        data.forEach(user => {
            skillsList.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${user.name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${user.email}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${user.skill_name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                        <button onclick="editSkill(${user.id}, '${user.skill_name}')" style="background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Edit</button>
                        <button onclick="deleteUser(${user.id})" style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// UPDATE: Modify an existing skill 
async function editSkill(id, currentSkill) {
    const newSkill = prompt("Enter the new skill name:", currentSkill);
    if (!newSkill || newSkill === currentSkill) return;

    try {
        const response = await fetch('http://localhost:3000/update-skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, newSkill })
        });

        if (response.ok) {
            loadSkills(); // Refresh table
        } else {
            alert("Error updating skill.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// DELETE: Remove a user and their data 
async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch('http://localhost:3000/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            loadSkills(); // Refresh table
        } else {
            alert("Error deleting user.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize dashboard data on page load
document.addEventListener('DOMContentLoaded', loadSkills);