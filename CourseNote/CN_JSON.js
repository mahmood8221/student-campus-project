let notes = [];
let customNotes = [];
let currentPage = 1;
const notesPerPage = 3;

const searchInput = document.getElementById('search');
const sortSelect = document.querySelector('.sort');
const notesContainer = document.querySelector('.section');
const form = document.querySelector('form');
const addButton = document.querySelector('.buttonAdd');

// Fetch notes from the server
async function fetchNotes() {
    try {
        const response = await fetch('https://9f6055a6-4f37-410e-bdd0-9ed4b8e4a48f-00-uw6bqvrayvp5.sisko.replit.dev/a/CN0.php');
        const data = await response.json();

       
        notes = data.map(n => ({
            ...n,
            html: `
                <div class="note">
                    <strong>${n.title}</strong><br><br>
                    Course: ${n.course}<br>
                    Content: ${n.content}<br>
                     ${n.file ? `<a href="${n.file.url}" download="${n.file.name}">📎 ${n.file.name}</a>` : ''}
                </div>
            `
        }));
        console.log(notes);

        renderNotes();
    } catch (error) {
        console.error("Failed to fetch notes:", error);
    }
}


// Handle add note
async function handleAddNote(e) {
    e.preventDefault();

    const title = document.getElementById('note-title').value.trim();
    const course = document.getElementById('note-course').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const fileInput = document.getElementById('noteFile');
    const file = fileInput.files[0];

    if (!title || !course || !content) {
        alert("Please fill in all fields.");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('course', course);
    formData.append('content', content);
    if (file) {
        formData.append('file', file);
    }

    try {
        const response = await fetch('https://9f6055a6-4f37-410e-bdd0-9ed4b8e4a48f-00-uw6bqvrayvp5.sisko.replit.dev/a/CN0.php', {
            method: 'POST',
            body: formData,
        });

        
        const result = await response.json();

        console.log("Server Response:", result);


        if (result.status === 'success') {
            alert(result.message);
            fetchNotes(); // Refresh notes after adding
            form.reset();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        alert("Failed to add note.");
        console.error("Error:", error);
    }
}

// Render notes on the page
function renderNotes() {
    const combined = [...notes, ...customNotes.map(n => ({
        ...n,
       html: `
  <div class="note">
    <strong>${n.title}</strong><br><br>
    Course: ${n.course}<br>
    Content: ${n.content}<br>
    ${n.file_path ? `<a href="${n.file_path}" download>📎 Download File</a>` : ''}
  </div>
        `
    }))];

    const filtered = filterAndSort(combined);
    const paginated = paginate(filtered, currentPage, notesPerPage);

    notesContainer.innerHTML = '<h2>Notes Section</h2><br>' +
        paginated.map(n => n.html).join('') +
        renderPagination(filtered.length);
}

function filterAndSort(list) {
    // Filter by search input
    let filtered = list.filter(note =>
        note.title.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    // Apply sorting
    const sortBy = sortSelect.value;
    if (sortBy === 'A-Z') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Z-A') {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'old-new') {
        filtered.sort((a, b) => a.id - b.id); 
    } else if (sortBy === 'new-old') {
        filtered.sort((a, b) => b.id - a.id); 
    }

    return filtered;
}


function paginate(array, page, perPage) {
    const start = (page - 1) * perPage;
    return array.slice(start, start + perPage);
}

function renderPagination(total) {
    const pageCount = Math.ceil(total / notesPerPage);
    let buttons = '';
    for (let i = 1; i <= pageCount; i++) {
        buttons += `<button onclick="changePage(${i})" style="margin:5px; padding:6px 12px; border-radius:12px;" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
    }
    return `<div style="margin-top: 20px;">${buttons}</div>`;
}

window.changePage = function (page) {
    currentPage = page;
    renderNotes();
};

// Initial fetch on page load
fetchNotes();
searchInput.addEventListener('input', renderNotes);
sortSelect.addEventListener('change', renderNotes);
addButton.addEventListener('click', handleAddNote);
