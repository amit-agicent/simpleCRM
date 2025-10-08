// =====================================================================
// !! IMPORTANT: REPLACE THE URL BELOW WITH YOUR DEPLOYED WEB APP URL !!
// =====================================================================
const APP_SCRIPT_URL = 'https://script.google.com/a/macros/agicent.com/s/AKfycby6pi7txrYUwdBIRg5HexjPj3L0MvLbgNFde25DjA2Z/dev'; 
// =====================================================================

const form = document.getElementById('prospectForm');
const messageElement = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const locationSelect = document.getElementById('location');

// Define USA States for the dropdown (Robust/UX)
const usaStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// Function to populate the USA States dropdown
function populateStates() {
    const optgroup = locationSelect.querySelector('optgroup[label="USA States"]');
    if (optgroup) {
        usaStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            optgroup.appendChild(option);
        });
    }
}

// Function to display the status message
function displayMessage(msg, isError = false) {
    messageElement.textContent = msg;
    messageElement.className = 'message ' + (isError ? 'error' : 'success');
    messageElement.style.display = 'block';
    // Hide the message after 5 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Function to reset the form after successful submission
function resetForm() {
    form.reset();
    // Re-set the date fields to blank explicitly
    document.getElementById('dateConnected').value = '';
    document.getElementById('followUpDate').value = '';
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    messageElement.style.display = 'none';

    // 1. Get form data
    const formData = new FormData(form);
    const data = {};
    // Convert FormData to a simple JSON object
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // 2. Perform validation (DateConnected and ProspectName are marked 'required' in HTML, but check again)
    if (!data.DateConnected || !data.ProspectName) {
        displayMessage('Date of Connection and Prospect Name are required.', true);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Prospect';
        return;
    }

    // 3. Send data to Google Apps Script (Backend API)
    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors', // Essential for cross-origin requests
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Check if the network request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // 4. Handle response
        if (result.status === 'success') {
            displayMessage(result.message, false);
            resetForm(); // Clear the form on success
        } else {
            // Handle script-side errors (e.g., sheet name mismatch)
            displayMessage('Submission failed: ' + result.message, true);
        }

    } catch (error) {
        // Handle network/CORS/JSON parsing errors
        console.error('Submission Error:', error);
        displayMessage('A critical error occurred. Check console for details.', true);
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Prospect';
    }
});

// Initial setup
document.addEventListener('DOMContentLoaded', populateStates);
