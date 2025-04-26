document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const studyGroupsContainer = document.querySelector('.group-featured');
    const searchInput = document.querySelector('input[type="search"]');
    const groupSizeFilter = document.querySelectorAll('.form-select')[0];
    const sortFilter = document.querySelectorAll('.form-select')[1];
    const createGroupForm = document.querySelector('.create-form');
    const loadingIndicator = document.createElement('div');
    
    // Global variables
    let allStudyGroups = [];
    let filteredStudyGroups = [];
    let currentPage = 1;
    const groupsPerPage = 6;

    // Initialize the app
    init();

    function init() {
        setupLoadingIndicator();
        fetchStudyGroups();
        setupEventListeners();
    }

    function setupLoadingIndicator() {
        loadingIndicator.className = 'text-center py-4';
        loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading study groups...</p>
        `;
    }

    function setupEventListeners() {
        // Search and filter events
        searchInput.addEventListener('input', handleSearch);
        groupSizeFilter.addEventListener('change', handleFilter);
        sortFilter.addEventListener('change', handleSort);
        
        // Form submission
        createGroupForm.addEventListener('submit', handleFormSubmit);
        
        // Form validation
        const formInputs = createGroupForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', validateInput);
        });
    }

    // Fetch study groups from API
    async function fetchStudyGroups() {
        try {
            studyGroupsContainer.innerHTML = '';
            studyGroupsContainer.appendChild(loadingIndicator);
            
            // Using a mock API
            const response = await fetch('https://680d3797c47cb8074d8fea56.mockapi.io/study-groups');
            
            if (!response.ok) {
                throw new Error('Failed to fetch study groups');
            }
            
            allStudyGroups = await response.json();
            filteredStudyGroups = [...allStudyGroups];
            
            renderStudyGroups();
            renderPagination();
        } catch (error) {
            console.error('Error fetching study groups:', error);
            studyGroupsContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load study groups. Please try again later.
                </div>
            `;
        }
    }

    // Render study groups
    function renderStudyGroups() {
        if (filteredStudyGroups.length === 0) {
            studyGroupsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">No study groups found matching your criteria.</div>
                </div>
            `;
            return;
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * groupsPerPage;
        const endIndex = startIndex + groupsPerPage;
        const paginatedGroups = filteredStudyGroups.slice(startIndex, endIndex);
        
        studyGroupsContainer.innerHTML = paginatedGroups.map(group => `
            <div class="col">
                <article class="group-card">
                    <div class="p-3 h-100">
                        <h3 class="card-title">${group.name}</h3>
                        <p><strong>Course:</strong> ${group.course}</p>
                        <p><strong>Members:</strong> ${group.members}</p>
                        <p><strong>Meets:</strong> ${group.meetingTime}</p>
                        <p><strong>Location:</strong> ${group.location}</p>
                        <button class="btn btn-primary btn-sm mt-2 view-details" data-id="${group.id}">View Details</button>
                        <button class="btn btn-outline-primary btn-sm mt-2 join-group" data-id="${group.id}">Join Group</button>
                    </div>
                </article>
            </div>
        `).join('');
        
        // Add event listeners to the new buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', showGroupDetails);
        });
        
        document.querySelectorAll('.join-group').forEach(button => {
            button.addEventListener('click', joinStudyGroup);
        });
    }

    // Render pagination controls
    function renderPagination() {
        const totalPages = Math.ceil(filteredStudyGroups.length / groupsPerPage);
        
        if (totalPages <= 1) return;
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'd-flex justify-content-center mt-4';
        
        let paginationHTML = `
            <nav aria-label="Study groups pagination">
                <ul class="pagination">
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" aria-label="Previous" id="prev-page">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link page-number" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        paginationHTML += `
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" aria-label="Next" id="next-page">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Remove existing pagination if it exists
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        paginationContainer.classList.add('pagination-container');
        studyGroupsContainer.after(paginationContainer);
        
        // Add event listeners to pagination controls
        document.getElementById('prev-page')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderStudyGroups();
                window.scrollTo({ top: studyGroupsContainer.offsetTop - 20, behavior: 'smooth' });
            }
        });
        
        document.getElementById('next-page')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderStudyGroups();
                window.scrollTo({ top: studyGroupsContainer.offsetTop - 20, behavior: 'smooth' });
            }
        });
        
        document.querySelectorAll('.page-number').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = parseInt(e.target.dataset.page);
                renderStudyGroups();
                window.scrollTo({ top: studyGroupsContainer.offsetTop - 20, behavior: 'smooth' });
            });
        });
    }

    // Search functionality
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredStudyGroups = allStudyGroups.filter(group => 
            group.name.toLowerCase().includes(searchTerm) || 
            group.course.toLowerCase().includes(searchTerm)
        );
        
        currentPage = 1;
        renderStudyGroups();
        renderPagination();
    }

    // Filter by group size
    function handleFilter() {
        const sizeFilter = groupSizeFilter.value;
        
        if (sizeFilter === 'Filter by group size') {
            filteredStudyGroups = [...allStudyGroups];
        } else {
            filteredStudyGroups = allStudyGroups.filter(group => {
                if (sizeFilter === 'Small (2-5)') return group.members >= 2 && group.members <= 5;
                if (sizeFilter === 'Medium (6-10)') return group.members >= 6 && group.members <= 10;
                if (sizeFilter === 'Large (10+)') return group.members > 10;
                return true;
            });
        }
        
        currentPage = 1;
        renderStudyGroups();
        renderPagination();
    }

    // Sort functionality
    function handleSort() {
        const sortOption = sortFilter.value;
        
        filteredStudyGroups.sort((a, b) => {
            switch (sortOption) {
                case 'Newest first':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'Oldest first':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'Most members':
                    return b.members - a.members;
                case 'Fewest members':
                    return a.members - b.members;
                default:
                    return 0;
            }
        });
        
        renderStudyGroups();
    }

    // Show group details
    function showGroupDetails(e) {
        const groupId = e.target.dataset.id;
        const group = allStudyGroups.find(g => g.id === groupId);
        
        if (!group) return;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="groupDetailsModal" tabindex="-1" aria-labelledby="groupDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="groupDetailsModalLabel">${group.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Course:</strong> ${group.course}</p>
                                    <p><strong>Members:</strong> ${group.members}</p>
                                    <p><strong>Meeting Time:</strong> ${group.meetingTime}</p>
                                    <p><strong>Location:</strong> ${group.location}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Description:</h6>
                                    <p>${group.description || 'No description provided.'}</p>
                                    
                                    <h6 class="mt-3">Group Admin:</h6>
                                    <p>${group.admin || 'Not specified'}</p>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <h6>Upcoming Sessions:</h6>
                                <ul class="list-group">
                                    ${group.upcomingSessions ? group.upcomingSessions.map(session => `
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            ${session.date} - ${session.topic || 'General Study Session'}
                                            <span class="badge bg-primary rounded-pill">${session.location}</span>
                                        </li>
                                    `).join('') : '<li class="list-group-item">No upcoming sessions scheduled</li>'}
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary join-group" data-id="${group.id}">Join Group</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Initialize and show modal
        const modal = new bootstrap.Modal(document.getElementById('groupDetailsModal'));
        modal.show();
        
        // Clean up modal after it's closed
        document.getElementById('groupDetailsModal').addEventListener('hidden.bs.modal', () => {
            modalContainer.remove();
        });
        
        // Add event listener to join button in modal
        document.querySelector('#groupDetailsModal .join-group').addEventListener('click', joinStudyGroup);
    }

    // Join study group
    function joinStudyGroup(e) {
        const groupId = e.target.dataset.id;
        const group = allStudyGroups.find(g => g.id === groupId);
        
        if (!group) return;
        
        // In a real app, this would be an API call to join the group
        alert(`You have joined the ${group.name} for ${group.course}!`);
        
        // Update the UI to reflect the join action
        e.target.textContent = 'Joined!';
        e.target.classList.remove('btn-outline-primary');
        e.target.classList.add('btn-success');
        e.target.disabled = true;
        
        // Also update any join button in the modal if it's open
        const modalJoinBtn = document.querySelector(`#groupDetailsModal .join-group[data-id="${groupId}"]`);
        if (modalJoinBtn) {
            modalJoinBtn.textContent = 'Joined!';
            modalJoinBtn.classList.remove('btn-primary');
            modalJoinBtn.classList.add('btn-success');
            modalJoinBtn.disabled = true;
        }
    }

    // Form validation
    function validateInput(e) {
        const input = e.target;
        const errorElement = input.nextElementSibling;
        
        // Check if there's already an error message element
        let errorMsg = errorElement?.classList.contains('invalid-feedback') ? errorElement : null;
        
        // Validate based on input type
        if (input.id === 'group-name' && input.value.trim().length < 3) {
            showError(input, 'Group name must be at least 3 characters long', errorMsg);
        } else if (input.id === 'course-name' && input.value.trim().length < 2) {
            showError(input, 'Please enter a valid course name', errorMsg);
        } else if (input.id === 'description' && input.value.trim().length > 0 && input.value.trim().length < 10) {
            showError(input, 'Description should be at least 10 characters long', errorMsg);
        } else {
            clearError(input, errorMsg);
        }
    }

    function showError(input, message, errorElement = null) {
        input.classList.add('is-invalid');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = message;
    }

    function clearError(input, errorElement = null) {
        input.classList.remove('is-invalid');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // Form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate all fields before submission
        let isValid = true;
        const formInputs = createGroupForm.querySelectorAll('input[required], textarea[required]');
        
        formInputs.forEach(input => {
            if (!input.value.trim()) {
                showError(input, 'This field is required');
                isValid = false;
            }
        });
        
        if (!isValid) return;
        
        // Create new group object
        const newGroup = {
            name: document.getElementById('group-name').value.trim(),
            course: document.getElementById('course-name').value.trim(),
            description: document.getElementById('description').value.trim(),
            meetingTime: document.getElementById('meeting-time').value.trim(),
            location: document.getElementById('location').value.trim(),
            members: 1, // Starting with the creator
            createdAt: new Date().toISOString(),
            admin: "You (the creator)"
        };
        
        try {
            // Show loading state
            const submitBtn = createGroupForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creating...
            `;
            
            // In a real app, this would be an API call to create the group
            // For now, we'll simulate it with a timeout and add to our local data
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Add the new group to our data
            newGroup.id = `group-${Date.now()}`;
            allStudyGroups.unshift(newGroup);
            filteredStudyGroups.unshift(newGroup);
            
            // Reset form
            createGroupForm.reset();
            
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success mt-3';
            successAlert.textContent = `Study group "${newGroup.name}" created successfully!`;
            createGroupForm.appendChild(successAlert);
            
            // Refresh the study groups list
            currentPage = 1;
            renderStudyGroups();
            renderPagination();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successAlert.remove();
            }, 5000);
            
        } catch (error) {
            console.error('Error creating study group:', error);
            alert('Failed to create study group. Please try again.');
        } finally {
            // Reset button state
            const submitBtn = createGroupForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
});