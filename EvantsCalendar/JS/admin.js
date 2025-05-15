document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("eventForm");
    const previewContainer = document.getElementById("previewContent");
    const globalError = document.getElementById("globalError");
    const imageInput = document.getElementById("eventImage");
    const imageLinkInput = document.getElementById("eventImageLink");
    const imagePreview = document.getElementById("imagePreview");

    // Live Preview
    form.addEventListener("input", updatePreview);
    imageInput.addEventListener("change", updatePreview);
    imageLinkInput.addEventListener("input", updatePreview);

    function updatePreview() {
        const title = document.getElementById("eventTitle").value;
        const date = document.getElementById("eventDate").value;
        const time = document.getElementById("eventTime").value;
        const location = document.getElementById("eventLocation").value;
        const organizer = document.getElementById("eventOrganizer").value;
        const description = document.getElementById("eventDescription").value;
        const category = document.getElementById("eventCategory").value;

        let imageUrl = "";
        if (imagePreview.src) imageUrl = imagePreview.src;
        if (imageLinkInput.value) imageUrl = imageLinkInput.value;

        previewContainer.innerHTML = `
            <div class="event-card">
                ${imageUrl ? `<img src="${imageUrl}" alt="Preview Image" style="max-height: 200px;">` : ''}
                <div class="event-card-content">
                    <h3>${title || "Untitled"}</h3>
                    <p>${description || 'No description available'}</p>
                    <div class="event-meta">
                        <span><i class="fas fa-calendar"></i> ${date || "N/A"}</span>
                        <span><i class="fas fa-clock"></i> ${time || "N/A"}</span>
                    </div>
                    <div class="event-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${location || "N/A"}</span>
                        <span><i class="fas fa-user"></i> ${organizer || "N/A"}</span>
                    </div>
                    <div class="event-category">
                        <span><i class="fas fa-tag"></i> ${category || "Uncategorized"}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Image Upload Preview
    imageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = "none";
        }
    });

    // Form Submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        globalError.textContent = "";

        const formData = new FormData();
        formData.append("title", document.getElementById("eventTitle").value.trim());
        formData.append("date", document.getElementById("eventDate").value.trim());
        formData.append("time", document.getElementById("eventTime").value.trim());
        formData.append("location", document.getElementById("eventLocation").value.trim());
        formData.append("organizer", document.getElementById("eventOrganizer").value.trim());
        formData.append("description", document.getElementById("eventDescription").value.trim());
        formData.append("category", document.getElementById("eventCategory").value.trim());
        formData.append("image_url", imageLinkInput.value.trim());

        const file = imageInput.files[0];
        if (file) {
            formData.append("image", file);
        }

        try {
            const response = await fetch('event_handler.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                alert('Event created successfully!');
                form.reset();
                previewContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-alt"></i>
                        <p>No event details to display yet</p>
                    </div>
                `;
            } else {
                globalError.textContent = result.error || 'Failed to create event';
            }
        } catch (error) {
            globalError.textContent = 'Error submitting form';
        }
    });
});