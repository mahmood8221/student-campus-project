let notes = [];
let currentPage = 1;
const notesPerPage = 3;

// DOM Elements
const searchInput = document.getElementById('search');
const sortSelect = document.querySelector('.sort');
const notesContainer = document.querySelector('.section');
const form = document.querySelector('form');
const addButton = document.querySelector('.buttonAdd');

// Event Listeners
searchInput.addEventListener('input', renderNotes);
sortSelect.addEventListener('change', renderNotes);
addButton.addEventListener('click', handleAddNote);

function handleAddNote(e) {
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

  const newNote = {
    title,
    course,
    content,
    file: file ? {
      name: file.name,
      url: URL.createObjectURL(file)
    } : null
  };

  notes.unshift(newNote);
  currentPage = 1;
  form.reset();
  renderNotes();
}

function renderNotes() {
  const filtered = filterAndSortNotes();
  const paginated = paginate(filtered, currentPage, notesPerPage);
  
  notesContainer.innerHTML = '<h2>Notes Section</h2><br>' +
    paginated.map(note => `
      <div class="note">
        <strong>${note.title}</strong><br><br>
        Course: ${note.course}<br>
        Content: ${note.content}<br>
        ${note.file ? `<a href="${note.file.url}" download="${note.file.name}">📎 ${note.file.name}</a>` : ''}
      </div>
    `).join('') +
    renderPagination(filtered.length);
}

function filterAndSortNotes() {
  let filtered = notes.filter(note =>
    note.title.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  const sortBy = sortSelect.value;
  if (sortBy === 'A-Z') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'Z-A') filtered.sort((a, b) => b.title.localeCompare(a.title));

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
    buttons += `<button onclick="changePage(${i})" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
  }
  return `<div style="margin-top: 20px;">${buttons}</div>`;
}

window.changePage = function(page) {
  currentPage = page;
  renderNotes();
}
