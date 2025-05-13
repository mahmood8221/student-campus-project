// ==============================
// Today's Campus News Module
// ==============================
const API_URL = 'https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news ';
const CARDS_PER_SLIDE = 4; // Display 10 news items per slide
const SLIDE_INTERVAL = 5000; // Auto-slide every 5 seconds

// State management
const appState = {
  currentPage: 1,
  articles: [],
  filteredArticles: [],
  categories: [],
  totalSlides: 0,
  autoSlideInterval: null,
};

// DOM Elements
const elements = {
  carouselTrack: document.querySelector('.carousel-track'),
  prevBtn: document.querySelector('.prev-btn'),
  nextBtn: document.querySelector('.next-btn'),
  searchInput: document.getElementById('searchInput'),
  filterCategory: document.getElementById('filterCategory'),
  errorMessage: document.getElementById('errorMessage'),
  pagination: document.getElementById('pagination')
};

// Fallback data in case API fails
const fallbackData = [
  // ... (same as before)
];

// ==============================
// Core Functionality
// ==============================

async function fetchArticles() {
  showErrorMessage('');
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch news articles');
    
    const data = await response.json();
    appState.articles = data;
    extractCategories(data);
    filterArticles();
    renderPagination();
    setupCarousel();
  } catch (error) {
    console.error('API Error:', error);
    showErrorMessage('Using fallback data due to API issues');
    appState.articles = fallbackData;
    extractCategories(fallbackData);
    filterArticles();
    renderPagination();
    setupCarousel();
  }
}

function extractCategories(articles) {
  const categories = new Set(articles.map(article => article.category));
  appState.categories = ['all', ...Array.from(categories)];
  renderCategories();
}

function renderCategories() {
  if (!elements.filterCategory) return;
  
  elements.filterCategory.innerHTML = appState.categories
    .map(category => 
      `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`
    ).join('');
}

function filterArticles() {
  const searchTerm = (elements.searchInput?.value || '').toLowerCase();
  const selectedCategory = elements.filterCategory?.value || 'all';

  appState.filteredArticles = appState.articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm) ||
                         article.content?.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  appState.totalSlides = Math.ceil(appState.filteredArticles.length / CARDS_PER_SLIDE);
  appState.currentPage = Math.min(appState.currentPage, appState.totalSlides || 1);

  renderPagination();
  updateCarouselPosition();
}

function setupCarousel() {
  elements.carouselTrack.innerHTML = '';
  
  appState.filteredArticles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'news-card animate';
    
    card.innerHTML = `
      <img src="${article.image || 'https://placehold.co/600x400?text=News '}" 
           alt="${article.title}" 
           class="card-image" />
      <div class="card-content">
        <h3>${article.title}</h3>
        <div class="meta-info">
          <span>By: ${article.author || 'Unknown'}</span>
          <span>Date: ${formatDate(article.date)}</span>
          <span>Category: ${article.category}</span>
          <span>Views: ${article.views || 0}</span>
        </div>
        <p>${truncateText(article.content, 120)}</p>
        <a href="NewsRead/Read.html?id=${article.id}" class="read-more">Read More →</a>
      </div>
    `;
    
    elements.carouselTrack.appendChild(card);
  });
  
  updateCarouselPosition();
  startAutoSlide();
}

function updateCarouselPosition() {
  const cardWidth = elements.carouselTrack.querySelector('.news-card')?.offsetWidth || 250;
  const currentOffset = (appState.currentPage - 1) * CARDS_PER_SLIDE * cardWidth;
  
  elements.carouselTrack.style.transform = `translateX(-${currentOffset}px)`;

  // Update button states
  elements.prevBtn.disabled = appState.currentPage === 1;
  elements.nextBtn.disabled = appState.currentPage === appState.totalSlides;
}

function startAutoSlide() {
  clearInterval(appState.autoSlideInterval);
  
  appState.autoSlideInterval = setInterval(() => {
    if (appState.currentPage < appState.totalSlides) {
      appState.currentPage++;
    } else {
      appState.currentPage = 1;
    }
    
    updateCarouselPosition();
    updatePaginationButtons();
  }, SLIDE_INTERVAL);
}

function stopAutoSlide() {
  clearInterval(appState.autoSlideInterval);
}

function changePage(direction) {
  stopAutoSlide();
  
  if (direction === 'prev' && appState.currentPage > 1) {
    appState.currentPage--;
  } else if (direction === 'next' && appState.currentPage < appState.totalSlides) {
    appState.currentPage++;
  }
  
  updateCarouselPosition();
  updatePaginationButtons();
  startAutoSlide();
}

function goToPage(pageNumber) {
  stopAutoSlide();
  appState.currentPage = pageNumber;
  updateCarouselPosition();
  updatePaginationButtons();
  startAutoSlide();
}

function renderPagination() {
  if (!elements.pagination) return;

  elements.pagination.innerHTML = '';

  const totalPages = appState.totalSlides;
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.innerHTML = `<button class="page-link ${i === appState.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    elements.pagination.appendChild(li);
  }
}

function updatePaginationButtons() {
  const buttons = document.querySelectorAll('.page-link');
  buttons.forEach((btn, index) => {
    btn.classList.toggle('active', index + 1 === appState.currentPage);
  });
}

function formatDate(timestamp) {
  try {
    const date = new Date(timestamp);
    return isNaN(date) ? 'Unknown Date' : 
      date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown Date';
  }
}

function truncateText(text, length) {
  return text?.length > length ? text.substring(0, length) + '...' : text || '';
}

function showErrorMessage(message) {
  if (!elements.errorMessage) return;
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.remove('d-none');
  setTimeout(() => elements.errorMessage.classList.add('d-none'), 4000);
}

// Event Listeners
elements.prevBtn?.addEventListener('click', () => changePage('prev'));
elements.nextBtn?.addEventListener('click', () => changePage('next'));

// Real-time search filtering
elements.searchInput?.addEventListener('input', () => {
  appState.currentPage = 1; // Reset page to 1 when searching
  filterArticles();
  setupCarousel(); // Re-render the carousel
});

elements.filterCategory?.addEventListener('change', () => {
  appState.currentPage = 1; // Reset page to 1 when changing category
  filterArticles();
  setupCarousel(); // Re-render the carousel
});

// Initialization
document.addEventListener('DOMContentLoaded', fetchArticles);