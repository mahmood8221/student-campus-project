// Global Variables
let currentPage = 1;
const activitiesPerPage = 6;
let allActivities = [];


document.addEventListener("DOMContentLoaded", () => {
  fetchActivities();

  // Set up event listeners
  document.getElementById("searchButton").addEventListener("click", handleSearch);
  document.getElementById("filterButton").addEventListener("click", handleFilter);
  document.getElementById("clearFilters").addEventListener("click", clearFilters);
  document.getElementById("prevPage").addEventListener("click", goToPreviousPage);
  document.getElementById("nextPage").addEventListener("click", goToNextPage);
  document.getElementById("sortOptions").addEventListener("change", handleSort);
  document.getElementById("createActivityForm").addEventListener("submit", createActivity);
  document.getElementById("editActivityForm").addEventListener("submit", submitEditActivity);

  // Navbar link navigation
  document.querySelector(".nav-link[href='#']").addEventListener("click", (e) => {
    e.preventDefault();
    showSection('home-section');
  });

  document.querySelector(".nav-link[href='#club-activities']").addEventListener("click", (e) => {
    e.preventDefault();
    showSection('main-listing');
  });

  document.querySelector(".nav-link[href='#about']").addEventListener("click", (e) => {
    e.preventDefault();
    showSection('about-section');
  });
});

// Show selected section and hide others
function showSection(sectionId) {
  document.getElementById("home-section").style.display = "none";
  document.getElementById("main-listing").style.display = "none";
  document.getElementById("about-section").style.display = "none";

  document.getElementById(sectionId).style.display = "block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fetch Activities from MockAPI
function fetchActivities() {
  document.getElementById("loading").style.display = "block";
  fetch("https://680cd55e2ea307e081d52bcc.mockapi.io/api/v1/club-activities")
    .then(response => response.json())
    .then(data => {
      allActivities = data;
      document.getElementById("loading").style.display = "none";
      renderPaginatedActivities(allActivities);
    })
    .catch(error => {
      console.error("Error fetching activities:", error);
      document.getElementById("loading").style.display = "none";
      alert("Failed to fetch activities.");
    });
}

// Render paginated activities
function renderPaginatedActivities(activities) {
  const list = document.getElementById("activity-list");
  list.innerHTML = "";

  const start = (currentPage - 1) * activitiesPerPage;
  const paginatedActivities = activities.slice(start, start + activitiesPerPage);

  if (paginatedActivities.length === 0) {
    list.innerHTML = `<div class="col-12 text-center text-muted">No activities found.</div>`;
    return;
  }

  paginatedActivities.forEach(activity => {
    const card = `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${activity.image || 'https://placehold.co/300x200'}" class="card-img-top" alt="${activity.title}">
          <div class="card-body">
            <h5 class="card-title">${activity.title}</h5>
            <p class="card-text">${activity.description}</p>
            <p class="card-text"><small class="text-muted">Date: ${activity.date}</small></p>
            <p class="card-text"><small class="text-muted">Location: ${activity.location}</small></p>
            <button class="btn btn-primary mb-2" onclick='openDetailModal(${JSON.stringify(activity).replace(/"/g, '&quot;')})'>View Details</button>
            <button class="btn btn-warning mb-2" onclick='openEditModal(${JSON.stringify(activity).replace(/"/g, '&quot;')})'>Edit</button>
            <button class="btn btn-danger mb-2" onclick='deleteActivity(${activity.id})'>Delete</button>
          </div>
        </div>
      </div>
    `;
    list.insertAdjacentHTML("beforeend", card);
  });

  updatePagination(activities.length);
}

// Update pagination buttons
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / activitiesPerPage);
  document.getElementById("prevPage").classList.toggle("disabled", currentPage === 1);
  document.getElementById("nextPage").classList.toggle("disabled", currentPage === totalPages);
}

// Pagination Navigation
function goToPreviousPage(event) {
  event.preventDefault();
  if (currentPage > 1) {
    currentPage--;
    renderPaginatedActivities(allActivities);
  }
}

function goToNextPage(event) {
  event.preventDefault();
  const totalPages = Math.ceil(allActivities.length / activitiesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPaginatedActivities(allActivities);
  }
}

// Search by Title
function handleSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const filtered = allActivities.filter(activity => activity.title.toLowerCase().includes(query));
  currentPage = 1;
  renderPaginatedActivities(filtered);
}

// Filter by Date
function handleFilter() {
  const selectedDate = document.getElementById("dateFilter").value;
  const filtered = allActivities.filter(activity => activity.date === selectedDate);
  currentPage = 1;
  renderPaginatedActivities(filtered);
}

// Clear Search and Filters
function clearFilters(event) {
  event.preventDefault();
  document.getElementById("searchInput").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("sortOptions").value = "";
  currentPage = 1;
  renderPaginatedActivities(allActivities);
}

// Sorting
function handleSort() {
  const sortOption = document.getElementById("sortOptions").value;
  let sortedActivities = [...allActivities];

  if (sortOption === "titleAsc") {
    sortedActivities.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "titleDesc") {
    sortedActivities.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortOption === "dateAsc") {
    sortedActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortOption === "dateDesc") {
    sortedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  currentPage = 1;
  renderPaginatedActivities(sortedActivities);
}

// View Details Modal
function openDetailModal(activity) {
  const modalHtml = `
    <div class="modal fade" id="activityDetailModal" tabindex="-1" aria-labelledby="activityDetailModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="activityDetailModalLabel">${activity.title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <img src="${activity.image || 'https://placehold.co/300x200'}" class="img-fluid mb-3" alt="Activity Image">
            <p>${activity.description}</p>
            <p><strong>Date:</strong> ${activity.date}</p>
            <p><strong>Location:</strong> ${activity.location}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("detail-modal").innerHTML = modalHtml;
  const modal = new bootstrap.Modal(document.getElementById('activityDetailModal'));
  modal.show();
}

// Create New Activity
function createActivity(event) {
  event.preventDefault();

  const title = document.getElementById("activityTitle").value.trim();
  const description = document.getElementById("activityDescription").value.trim();
  const date = document.getElementById("activityDate").value;
  const location = document.getElementById("activityLocation").value.trim();

  if (!title || !description || !date || !location) {
    alert("All fields are required.");
    return;
  }

  const newActivity = {
    title,
    description,
    date,
    location,
    image: "https://placehold.co/300x200"
  };

  fetch("https://680cd55e2ea307e081d52bcc.mockapi.io/api/v1/club-activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newActivity)
  })
    .then(response => response.json())
    .then(() => {
      alert("Activity created successfully!");
      document.getElementById("createActivityForm").reset();
      fetchActivities();
    })
    .catch(error => {
      console.error("Error creating activity:", error);
      alert("Failed to create activity.");
    });
}

// Delete Activity
function deleteActivity(id) {
  if (confirm("Are you sure you want to delete this activity?")) {
    fetch(`https://680cd55e2ea307e081d52bcc.mockapi.io/api/v1/club-activities/${id}`, {
      method: "DELETE"
    })
      .then(response => response.json())
      .then(() => {
        alert("Activity deleted successfully!");
        fetchActivities();
      })
      .catch(error => {
        console.error("Error deleting activity:", error);
        alert("Failed to delete activity.");
      });
  }
}

// Open Edit Modal
function openEditModal(activity) {
  document.getElementById("editActivityId").value = activity.id;
  document.getElementById("editActivityTitle").value = activity.title;
  document.getElementById("editActivityDescription").value = activity.description;
  document.getElementById("editActivityDate").value = activity.date;
  document.getElementById("editActivityLocation").value = activity.location;

  const modal = new bootstrap.Modal(document.getElementById('editActivityModal'));
  modal.show();
}

// Submit Edited Activity
function submitEditActivity(event) {
  event.preventDefault();

  const id = document.getElementById("editActivityId").value;
  const updatedActivity = {
    title: document.getElementById("editActivityTitle").value.trim(),
    description: document.getElementById("editActivityDescription").value.trim(),
    date: document.getElementById("editActivityDate").value,
    location: document.getElementById("editActivityLocation").value
  };

  fetch(`https://680cd55e2ea307e081d52bcc.mockapi.io/api/v1/club-activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedActivity)
  })
    .then(response => response.json())
    .then(() => {
      alert("Activity updated successfully!");
      fetchActivities();
    })
    .catch(error => {
      console.error("Error updating activity:", error);
      alert("Failed to update activity.");
    });
}
