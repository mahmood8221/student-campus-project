// ==============================
// Campus Hub - News Module (Improved)
// ==============================

// Constants
const API_URL = 'https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news ';
const ITEMS_PER_PAGE = 6;

// State Management
const state = {
  currentPage: 1,
  totalPages: 1,
  articles: [],
  filteredArticles: [],
};

// DOM Elements
const newsContainer = document.getElementById('news-container');
const skeletonLoader = document.getElementById('skeletonLoader');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterCategory'); // Fixed ID
const errorMessage = document.getElementById('errorMessage');

// Mock fallback data (in case API fails)
const fallbackData = [
  {
    id: '1',
    title: 'Campus Event: Tech Fair 2025',
    author: 'Admin',
    date: '2025-04-05T10:00:00Z',
    category: 'events',
    views: 150,
    content: 'Join us for the annual Tech Fair showcasing student innovations.',
    image: 'https://placehold.co/600x400?text=Tech+Fair+2025 ',
  },
  {
    id: '2',
    title: 'New Student Club Launched',
    author: 'Jane Doe',
    date: '2025-04-03T14:00:00Z',
    category: 'clubs',
    views: 98,
    content: 'The Entrepreneurship Club is now accepting new members.',
    image: 'https://placehold.co/600x400?text=New+Club ',
  },
];

// ==============================
// Fetch Data
// ==============================
async function fetchArticles() {
  showSkeletonLoader();
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch news articles.');

    const data = await response.json();
    state.articles = data;
    state.filteredArticles = data;
    state.totalPages = Math.ceil(state.filteredArticles.length / ITEMS_PER_PAGE);

    renderArticles();
    renderPagination();
  } catch (error) {
    console.error('API error:', error);
    showError('Using fallback data due to API issues.');
    state.articles = fallbackData;
    state.filteredArticles = fallbackData;
    state.totalPages = Math.ceil(fallbackData.length / ITEMS_PER_PAGE);
    renderArticles();
    renderPagination();
  } finally {
    hideSkeletonLoader();
  }
}

// ==============================
// Render Functions
// ==============================
function renderArticles() {
  newsContainer.innerHTML = '';
  const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const articlesToDisplay = state.filteredArticles.slice(start, end);

  if (articlesToDisplay.length === 0) {
    newsContainer.innerHTML = `<p class="text-center w-100">No news articles found.</p>`;
    return;
  }

  articlesToDisplay.forEach(article => {
    const card = document.createElement('div');
    card.className = 'news-card animate';

    card.innerHTML = `
      <img src="${article.image || 'https://placehold.co/600x400?text=Placeholder '}" alt="${article.title}" class="w-100" />
      <div class="card-content">
        <h3>${article.title}</h3>
        <p><strong>By:</strong> ${article.author || 'Unknown'}</p>
        <p><strong>Date:</strong> ${formatDate(article.date)}</p>
        <p><strong>Category:</strong> ${article.category}</p>
        <p><strong>Views:</strong> ${article.views || 0}</p>
        <p>${truncateContent(article.content, 120)}</p>
        <a href="NewsRead/Read.html?id=${article.id}" class="read-more">Read more →</a>
      </div>
    `;

    newsContainer.appendChild(card);
  });
}

function renderPagination() {
  pagination.innerHTML = '';

  for (let i = 1; i <= state.totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item';
    
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `page-link ${i === state.currentPage ? 'active' : ''}`;
    btn.onclick = () => changePage(i);
    
    li.appendChild(btn);
    pagination.appendChild(li);
  }
}

// ==============================
// Utility Functions
// ==============================
function formatDate(timestamp) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date)) throw new Error('Invalid date');
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown Date';
  }
}

function truncateContent(content, limit) {
  return content?.length > limit ? content.substring(0, limit) + '...' : content || '';
}

function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    setTimeout(() => errorMessage.classList.add('d-none'), 4000);
  }
}

// ==============================
// Pagination Control
// ==============================
function changePage(pageNumber) {
  state.currentPage = pageNumber;
  renderArticles();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==============================
// Search and Filter
// ==============================
function applyFilters() {
  const searchTerm = (searchInput?.value || '').toLowerCase();
  const selectedCategory = filterSelect?.value || 'all';

  state.filteredArticles = state.articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm) ||
                          article.content?.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  state.currentPage = 1;
  state.totalPages = Math.ceil(state.filteredArticles.length / ITEMS_PER_PAGE);

  renderArticles();
  renderPagination();
}

// Event Listeners
searchInput?.addEventListener('input', applyFilters);
filterSelect?.addEventListener('change', applyFilters);

// ==============================
// Loading Skeleton Control
// ==============================
function showSkeletonLoader() {
  if (skeletonLoader) skeletonLoader.style.display = 'block';
  if (newsContainer) newsContainer.style.display = 'none';
}

function hideSkeletonLoader() {
  if (skeletonLoader) skeletonLoader.style.display = 'none';
  if (newsContainer) newsContainer.style.display = 'flex';
}

// ==============================
// Initialization
// ==============================
document.addEventListener('DOMContentLoaded', fetchArticles);