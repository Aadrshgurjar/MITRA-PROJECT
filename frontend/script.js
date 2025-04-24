 // Local Storage Management for Donors and Requests
 function loadFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
}

// Initialize donors and requests from localStorage
let donors = loadFromLocalStorage('donors');
let requests = loadFromLocalStorage('requests');

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Update active nav link
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });
}

// Donor Form Submission
document.getElementById('donor-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const donor = {
        id: Date.now(),
        name: document.getElementById('donor-name').value.trim(),
        age: parseInt(document.getElementById('donor-age').value),
        gender: document.getElementById('donor-gender').value,
        bloodGroup: document.getElementById('donor-blood-group').value,
        contact: document.getElementById('donor-contact').value.trim(),
        location: document.getElementById('donor-location').value.trim(),
        availability: document.getElementById('donor-availability').value,
        lat: 0, // Placeholder for geolocation
        lng: 0,
        registeredAt: new Date().toISOString()
    };

    // Simulate geocoding
    donor.lat = 51.505 + Math.random() * 0.01;
    donor.lng = -0.09 + Math.random() * 0.01;

    // Validate donor data
    if (donor.name && donor.age >= 18 && donor.age <= 65 && donor.bloodGroup && donor.contact && donor.location && donor.availability) {
        donors.push(donor);
        saveToLocalStorage('donors', donors);
        alert('Donor registered successfully!');
        this.reset();
    } else {
        alert('Please fill in all required fields correctly.');
    }
});

// Request Form Submission
document.getElementById('request-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const request = {
        id: Date.now(),
        patientName: document.getElementById('patient-name').value.trim(),
        bloodType: document.getElementById('blood-type').value,
        urgency: document.getElementById('urgency').value,
        location: document.getElementById('request-location').value.trim(),
        contact: document.getElementById('request-contact').value.trim(),
        requestedAt: new Date().toISOString()
    };

    // Validate request data
    if (request.patientName && request.bloodType && request.urgency && request.location && request.contact) {
        requests.push(request);
        saveToLocalStorage('requests', requests);
        alert('Blood request submitted successfully!');
        this.reset();

        // Check for matching donors
        const matches = donors.filter(d => 
            d.bloodGroup === request.bloodType && 
            d.location.toLowerCase() === request.location.toLowerCase() &&
            d.availability === 'Available'
        );
        if (matches.length > 0) {
            alert(`Found ${matches.length} matching donor(s)! Check the Search Donors page.`);
        }
    } else {
        alert('Please fill in all required fields correctly.');
    }
});

// Search Donors
document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const bloodType = document.getElementById('search-blood-type').value;
    const location = document.getElementById('search-location').value.trim().toLowerCase();
    const availability = document.getElementById('search-availability').value;
    const minAge = parseInt(document.getElementById('search-age-min').value) || 18;
    const maxAge = parseInt(document.getElementById('search-age-max').value) || 65;

    // Validate age range
    if (minAge > maxAge) {
        alert('Minimum age cannot be greater than maximum age.');
        return;
    }

    // Filter donors from localStorage
    const results = donors.filter(donor => {
        return (
            (bloodType === '' || donor.bloodGroup === bloodType) &&
            (location === '' || donor.location.toLowerCase().includes(location)) &&
            (availability === '' || donor.availability === availability) &&
            (donor.age >= minAge && donor.age <= maxAge)
        );
    });

    // Display results
    const resultsDiv = document.getElementById('donor-results');
    resultsDiv.innerHTML = '';
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No matching donors found.</p>';
    } else {
        results.forEach(donor => {
            const card = document.createElement('div');
            card.className = 'donor-card';
            card.innerHTML = `
                <h3>${donor.name}</h3>
                <p>Blood Group: ${donor.bloodGroup}</p>
                <p>Age: ${donor.age}</p>
                <p>Location: ${donor.location}</p>
                <p>Contact: ${donor.contact}</p>
                <p>Availability: ${donor.availability}</p>
                <p>Registered: ${new Date(donor.registeredAt).toLocaleDateString()}</p>
            `;
            resultsDiv.appendChild(card);
        });
    }

    // Update map
    initMap(results);

    // Save search parameters to localStorage
    const searchParams = {
        bloodType,
        location,
        availability,
        minAge,
        maxAge,
        searchedAt: new Date().toISOString()
    };
    saveToLocalStorage('lastDonorSearch', searchParams);
});

// Load last search parameters on page load
function loadLastSearch() {
    const lastSearch = loadFromLocalStorage('lastDonorSearch', {});
    if (lastSearch) {
        document.getElementById('search-blood-type').value = lastSearch.bloodType || '';
        document.getElementById('search-location').value = lastSearch.location || '';
        document.getElementById('search-availability').value = lastSearch.availability || '';
        document.getElementById('search-age-min').value = lastSearch.minAge || '';
        document.getElementById('search-age-max').value = lastSearch.maxAge || '';
    }
}

// Login Form Submission
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Simulate login
    alert(`Logged in successfully as ${email}`);
    this.reset();
    showSection('home');
});

// Google Maps Integration
let map;
function initMap(donors = []) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 13
    });

    donors.forEach(donor => {
        new google.maps.Marker({
            position: { lat: donor.lat, lng: donor.lng },
            map: map,
            title: donor.name
        });
    });
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required]');
    let valid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.style.borderColor = '#c62828';
            let error = input.nextElementSibling;
            if (!error || !error.classList.contains('error')) {
                error = document.createElement('span');
                error.className = 'error';
                error.textContent = 'This field is required';
                input.parentNode.appendChild(error);
            }
        } else {
            input.style.borderColor = '#ddd';
            let error = input.nextElementSibling;
            if (error && error.classList.contains('error')) {
                error.remove();
            }
        }
    });

    return valid;
}

// Attach validation to forms
['donor-form', 'request-form', 'login-form'].forEach(formId => {
    document.getElementById(formId).addEventListener('submit', function(e) {
        if (!validateForm(formId)) {
            e.preventDefault();
        }
    });
});

// Initialize last search on page load
window.addEventListener('load', loadLastSearch);
