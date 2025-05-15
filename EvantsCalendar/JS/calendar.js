document.addEventListener("DOMContentLoaded", () => {
    const errorDiv = document.getElementById("error");
    const container = document.getElementById("events-container");
    const searchInput = document.getElementById("search");
    const categoryFilter = document.getElementById("category-filter");
    const sortSelect = document.getElementById("sort");
    const pagination = document.getElementById("pagination");

    let allEvents = [];
    let currentPage = 1;
    const eventsPerPage = 6;

    async function loadEvents() {
        try {
            const response = await fetch("event_handler.php");
            allEvents = await response.json();
            renderEvents();
        } catch (error) {
            errorDiv.textContent = "Error loading events";
        }
    }

    function paginate(events, page, perPage) {
        const start = (page - 1) * perPage;
        return events.slice(start, start + perPage);
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = "";

        if (currentPage > 1) {
            pagination.innerHTML += `<a href="#" onclick="changePage(${currentPage - 1})">&laquo; Previous</a>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `<a href="#" class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</a>`;
        }

        if (currentPage < totalPages) {
            pagination.innerHTML += `<a href="#" onclick="changePage(${currentPage + 1})">Next &raquo;</a>`;
        }
    }

    window.changePage = function(page) {
        currentPage = page;
        renderEvents();
    }

    function renderEvents() {
        container.innerHTML = "";
        let filtered = [...allEvents];

        const query = searchInput.value.toLowerCase();
        if (query) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(query) ||
                (event.description && event.description.toLowerCase().includes(query))
            );
        }

        const category = categoryFilter.value;
        if (category !== "All Categories") {
            filtered = filtered.filter(event => event.category === category);
        }

        const sortOption = sortSelect.value;
        if (sortOption === "Date: Ascending") {
            filtered.sort((a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time));
        } else if (sortOption === "Date: Descending") {
            filtered.sort((a, b) => new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time));
        }

        if (filtered.length === 0) {
            container.innerHTML = "<p>No events found</p>";
            pagination.innerHTML = "";
            return;
        }

        const paginatedEvents = paginate(filtered, currentPage, eventsPerPage);
        const totalPages = Math.ceil(filtered.length / eventsPerPage);

        paginatedEvents.forEach(event => {
            container.innerHTML += `
                <div class="event-card">
                    ${event.image_data || event.image_url ? `<img src="${event.image_data ? 'data:image/jpeg;base64,' + event.image_data : event.image_url}" alt="${event.title}">` : ''}
                    <div class="event-card-content">
                        <h3>${event.title}</h3>
                        <p>${event.description || 'No description available'}</p>
                        <div class="event-meta">
                            <span><i class="fas fa-calendar"></i> ${event.date}</span>
                            <span><i class="fas fa-clock"></i> ${event.time}</span>
                        </div>
                        <div class="event-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                            <span><i class="fas fa-user"></i> ${event.organizer}</span>
                        </div>
                        <div class="event-category">
                            <span><i class="fas fa-tag"></i> ${event.category}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        renderPagination(totalPages);
    }

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderEvents();
    });
    categoryFilter.addEventListener("change", () => {
        currentPage = 1;
        renderEvents();
    });
    sortSelect.addEventListener("change", () => {
        currentPage = 1;
        renderEvents();
    });

    loadEvents();
});
