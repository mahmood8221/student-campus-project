// NewsPage/News.js

// ========================
// Constants & State Setup
// ========================
const API_URL = 'https://6624a86b04457d4aaf9c4e2a.mockapi.io/news';
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
// Core Functions
// ========================

// Fetch articles from API
async function fetchArticles() {
  try {
    toggleLoading(true);
    
    const response = await fetch(`${API_URL}?page=${state.currentPage}&limit=${ITEMS_PER_PAGE}`);
    if(!response.ok) throw new Error('Failed to fetch articles');
    
    const data = await response.json();
    state.articles = data.items;
    state.totalPages = Math.ceil(data.count / ITEMS_PER_PAGE);
    
    renderArticles();
    updatePagination();
  } catch(error) {
    showError(`Failed to load news: ${error.message}`);
  } finally {
    toggleLoading(false);
  }
}

// Render articles to DOM
function renderArticles() {
  const filtered = filterArticles(state.articles);
  const sorted = sortArticles(filtered);
  
  dom.newsContainer.innerHTML = sorted.length > 0 
    ? sorted.map(article => createArticleCard(article)).join('')
    : `<div class="col-12" data-empty>No articles found matching your criteria</div>`;
}

// Create article card HTML
function createArticleCard(article) {
  return `
    <div class="col">
      <article class="news-card animate">
        <div class="card-header">${article.category}</div>
        <img src="${article.image}" alt="${article.title}">
        <div class="card-content">
          <div class="news-meta d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary">${article.category}</span>
            <div class="author d-flex align-items-center">
              <img src="../assets/author.jpg" alt="${article.author}" class="author-img me-2">
              <span class="author-name">${article.author}</span>
            </div>
          </div>
          <h3>${article.title}</h3>
          <p class="news-date">${new Date(article.date).toLocaleDateString()}</p>
          <p class="news-excerpt">${article.excerpt}</p>
          <a href="NewsRead/Read.html?id=${article.id}" class="read-more">Read More →</a>
        </div>
      </article>
    </div>
  `;
}

// ========================
// Filter & Sort Functions
// ========================
function filterArticles(articles) {
  return articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                          article.content.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesCategory = state.selectedCategory === 'all' || 
                            article.category.toLowerCase() === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });
}

function sortArticles(articles) {
  return articles.sort((a, b) => {
    switch(state.sortBy) {
      case 'newest': return new Date(b.date) - new Date(a.date);
      case 'oldest': return new Date(a.date) - new Date(b.date);
      case 'popular': return b.views - a.views;
      default: return 0;
    }
  });
}

// ========================
// Pagination Functions
// ========================
function updatePagination() {
  const pages = Array.from({length: state.totalPages}, (_, i) => i + 1);
  
  dom.pagination.innerHTML = `
    <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" data-page="prev">Previous</button>
    </li>
    ${pages.map(page => `
      <li class="page-item ${page === state.currentPage ? 'active' : ''}">
        <button class="page-link" data-page="${page}">${page}</button>
      </li>
    `).join('')}
    <li class="page-item ${state.currentPage === state.totalPages ? 'disabled' : ''}">
      <button class="page-link" data-page="next">Next</button>
    </li>
  `;
}

// ========================
// UI State Functions
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
// Event Handlers
// ========================
function handleSearch() {
  state.searchTerm = dom.searchInput.value;
  state.currentPage = 1;
  fetchArticles();
}

function handleFilterChange() {
  state.selectedCategory = dom.filterCategory.value;
  state.currentPage = 1;
  fetchArticles();
}

function handleSortChange() {
  state.sortBy = dom.sortBy.value;
  renderArticles();
}

function handlePagination(e) {
  if(!e.target.closest('.page-link')) return;
  
  const action = e.target.dataset.page;
  if(action === 'prev') state.currentPage--;
  if(action === 'next') state.currentPage++;
  if(!isNaN(action)) state.currentPage = parseInt(action);
  
  fetchArticles();
}

// ========================
// Event Listeners
// ========================
dom.searchInput.addEventListener('input', debounce(handleSearch, 300));
dom.filterCategory.addEventListener('change', handleFilterChange);
dom.sortBy.addEventListener('change', handleSortChange);
dom.pagination.addEventListener('click', handlePagination);

// ========================
// Utility Functions
// ========================
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ========================
// Initialization
// ========================
document.addEventListener('DOMContentLoaded', fetchArticles);