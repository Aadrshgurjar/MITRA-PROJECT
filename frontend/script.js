 // Simulated database using localStorage
 let donors = JSON.parse(localStorage.getItem('donors')) || [];
 let requests = JSON.parse(localStorage.getItem('requests')) || [];

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
         name: document.getElementById('donor-name').value,
         age: document.getElementById('donor-age').value,
         gender: document.getElementById('donor-gender').value,
         bloodGroup: document.getElementById('donor-blood-group').value,
         contact: document.getElementById('donor-contact').value,
         location: document.getElementById('donor-location').value,
         availability: document.getElementById('donor-availability').value,
         lat: 0, // Placeholder for geolocation
         lng: 0
     };

     // Simulate geocoding
     donor.lat = 51.505 + Math.random() * 0.01;
     donor.lng = -0.09 + Math.random() * 0.01;

     donors.push(donor);
     localStorage.setItem('donors', JSON.stringify(donors));
     alert('Donor registered successfully!');
     this.reset();
 });

 // Request Form Submission
 document.getElementById('request-form').addEventListener('submit', function(e) {
     e.preventDefault();
     const request = {
         id: Date.now(),
         patientName: document.getElementById('patient-name').value,
         bloodType: document.getElementById('blood-type').value,
         urgency: document.getElementById('urgency').value,
         location: document.getElementById('request-location').value,
         contact: document.getElementById('request-contact').value
     };

     requests.push(request);
     localStorage.setItem('requests', JSON.stringify(requests));
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
 });

 // Search Donors
 document.getElementById('search-form').addEventListener('submit', function(e) {
     e.preventDefault();
     const bloodType = document.getElementById('search-blood-type').value;
     const location = document.getElementById('search-location').value.toLowerCase();

     const results = donors.filter(donor => {
         return (
             (bloodType === '' || donor.bloodGroup === bloodType) &&
             (location === '' || donor.location.toLowerCase().includes(location)) &&
             donor.availability === 'Available'
         );
     });

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
                 <p>Location: ${donor.location}</p>
                 <p>Contact: ${donor.contact}</p>
             `;
             resultsDiv.appendChild(card);
         });
     }

     // Update map
     initMap(results);
 });

 // Login Form Submission
 document.getElementById('login-form').addEventListener('submit', function(e) {
     e.preventDefault();
     const email = document.getElementById('login-email').value;
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
         if (!input.value) {
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