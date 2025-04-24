let notes = [];
let customNotes = [];
let currentPage = 1;
const notesPerPage = 3;

const searchInput = document.getElementById('search');
const sortSelect = document.querySelector('.sort');
const notesContainer = document.querySelector('.section');
const form = document.querySelector('form');
const addButton = document.querySelector('.buttonAdd');

// Get static HTML notes and preserve them
document.querySelectorAll('.note').forEach(noteEl => {
  notes.push({
    title: noteEl.querySelector('strong')?.innerText || 'Untitled',
    course: (noteEl.innerHTML.match(/Course: (.*?)<br>/) || [])[1] || 'Unknown',
    content: noteEl.innerHTML.split('Content: ')[1]?.split('<')[0] || 'No content',
    html: noteEl.outerHTML
  });
});

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

  const note = {
    title,
    course,
    content,
    file: file ? {
      name: file.name,
      url: URL.createObjectURL(file)
    } : null
  };

  customNotes.unshift(note);
  form.reset();
  currentPage = 1;
  renderNotes();
}

function renderNotes() {
  const combined = [...notes, ...customNotes.map(n => ({
    ...n,
    html: `
      <div class="note">
        <strong>${n.title}</strong><br><br>
        Course: ${n.course}<br>
        Content: ${n.content}<br>
        ${n.file ? `<a href="${n.file.url}" download="${n.file.name}">📎 ${n.file.name}</a>` : ''}
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
  let filtered = list.filter(note =>
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
    buttons += `<button onclick="changePage(${i})" style="margin:5px; padding:6px 12px; border-radius:12px;" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
  }
  return `<div style="margin-top: 20px;">${buttons}</div>`;
}

window.changePage = function (page) {
  currentPage = page;
  renderNotes();
};
