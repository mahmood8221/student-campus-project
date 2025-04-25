// NewsPage/News.js

// ========================
// Constants & State Setup
// ========================
const API_URL = 'https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news';
const ITEMS_PER_PAGE = 6;

const state = {
  currentPage: 1,
  totalPages: 1,
  articles: [],
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'newest',
  isLoading: false
};

// ========================
// DOM Elements
// ========================
const dom = {
  searchInput: document.getElementById('searchInput'),
  filterCategory: document.getElementById('filterCategory'),
  sortBy: document.getElementById('sortBy'),
  newsContainer: document.getElementById('newsContainer'),
  pagination: document.getElementById('pagination'),
  loading: document.getElementById('loading'),
  errorMessage: document.getElementById('errorMessage')
};

// ========================
// Core Functions (Updated)
// ========================

async function fetchArticles() {
  try {
    toggleLoading(true);
    
    const response = await fetch(
      `${API_URL}?_page=${state.currentPage}&_limit=${ITEMS_PER_PAGE}`
    );
    
    if(!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    // Get total count from headers for pagination
    const totalCount = response.headers.get('x-total-count');
    state.totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    
    const data = await response.json();
    state.articles = data.map(article => ({
      ...article,
      // Convert timestamp to Date object
      date: new Date(article.date),
      // Generate proper image URL
      image: article.image.startsWith('image ') 
        ? `https://picsum.photos/400/200?random=${article.id}`
        : article.image
    }));
    
    renderArticles();
    updatePagination();
    
  } catch(error) {
    console.error('Fetch Error:', error);
    showError(`News feed unavailable: ${error.message}`);
  } finally {
    toggleLoading(false);
  }
}

function renderArticles() {
  const filtered = filterArticles(state.articles);
  const sorted = sortArticles(filtered);
  
  dom.newsContainer.innerHTML = sorted.length > 0 
    ? sorted.map(article => createArticleCard(article)).join('')
    : `<div class="col-12" data-empty>No matching articles found</div>`;
}

function createArticleCard(article) {
  return `
    <div class="col">
      <article class="news-card animate">
        <div class="card-header">${article.category}</div>
        <img src="${article.image}" alt="${article.title}" loading="lazy">
        <div class="card-content">
          <div class="news-meta d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary">${article.category}</span>
            <div class="author d-flex align-items-center">
              <span class="author-name">${article.author}</span>
            </div>
          </div>
          <h3>${article.title}</h3>
          <p class="news-date">
            ${article.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p class="news-excerpt">${article.content.substring(0, 100)}...</p>
          <a href="NewsRead/Read.html?id=${article.id}" class="read-more">
            Read More →
          </a>
        </div>
      </article>
    </div>
  `;
}

// ========================
// Filter & Sort (Improved)
// ========================
function filterArticles(articles) {
  const searchLower = state.searchTerm.toLowerCase();
  
  return articles.filter(article => {
    const titleMatch = article.title.toLowerCase().includes(searchLower);
    const contentMatch = article.content.toLowerCase().includes(searchLower);
    const categoryMatch = state.selectedCategory === 'all' || 
      article.category.toLowerCase() === state.selectedCategory.toLowerCase();
      
    return (titleMatch || contentMatch) && categoryMatch;
  });
}

function sortArticles(articles) {
  return [...articles].sort((a, b) => {
    switch(state.sortBy) {
      case 'newest': return b.date - a.date;
      case 'oldest': return a.date - b.date;
      case 'popular': return b.views - a.views;
      default: return 0;
    }
  });
}

// ========================
// Pagination (Updated)
// ========================
function updatePagination() {
  const pages = Array.from({length: state.totalPages}, (_, i) => i + 1);
  
  dom.pagination.innerHTML = `
    <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" data-page="prev" aria-label="Previous">
        &laquo; Previous
      </button>
    </li>
    
    ${pages.map(page => `
      <li class="page-item ${page === state.currentPage ? 'active' : ''}">
        <button class="page-link" data-page="${page}">
          ${page}
        </button>
      </li>
    `).join('')}
    
    <li class="page-item ${state.currentPage === state.totalPages ? 'disabled' : ''}">
      <button class="page-link" data-page="next" aria-label="Next">
        Next &raquo;
      </button>
    </li>
  `;
}

// ========================
// UI Functions (Same)
// ========================
function toggleLoading(show) {
  state.isLoading = show;
  dom.loading.classList.toggle('d-none', !show);
}

function showError(message) {
  dom.errorMessage.textContent = message;
  dom.errorMessage.classList.remove('d-none');
  setTimeout(() => dom.errorMessage.classList.add('d-none'), 5000);
}

// ========================
// Event Handlers (Same)
// ========================
// ... (keep existing event handler functions)

// ========================
// Initialization (Updated)
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  fetchArticles();
  
  // Set up category filter options
  const categories = ['all', 'Events', 'Academics', 'Announcements', 'Clubs'];
  dom.filterCategory.innerHTML = categories.map(cat => 
    `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
  ).join('');
});