// ==============================
// Campus Hub News Module
// ==============================
const API_URL = 'https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news ';
const CARDS_PER_SLIDE = 3; // Number of cards per slide
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
  skeletonLoader: document.getElementById('skeletonLoader')
};

// Fallback data in case API fails
const fallbackData = [
  // ... (same as before)
];

// ==============================
// Core Functionality
// ==============================

async function fetchArticles() {
  showLoader();
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch news articles');
    
    const data = await response.json();
    appState.articles = data;
    extractCategories(data);
    filterArticles();
    setupCarousel();
  } catch (error) {
    console.error('API Error:', error);
    showErrorMessage('Using fallback data due to API issues');
    appState.articles = fallbackData;
    extractCategories(fallbackData);
    filterArticles();
    setupCarousel();
  } finally {
    hideLoader();
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
}

function setupCarousel() {
  // Clear existing content
  elements.carouselTrack.innerHTML = '';
  
  // Create card elements
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
  
  // Calculate initial position
  updateCarouselPosition();
  
  // Start auto-sliding
  startAutoSlide();
}

function updateCarouselPosition() {
  const cardWidth = elements.carouselTrack.querySelector('.news-card')?.offsetWidth || 300;
  const totalCards = appState.filteredArticles.length;
  const maxScroll = (totalCards - CARDS_PER_SLIDE) * cardWidth;
  const currentScroll = (appState.currentPage - 1) * CARDS_PER_SLIDE * cardWidth;
  
  elements.carouselTrack.style.transform = `translateX(-${currentScroll}px)`;
  
  // Disable buttons when at edges
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
  startAutoSlide();
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

function showLoader() {
  if (elements.skeletonLoader) elements.skeletonLoader.style.display = 'flex';
  if (elements.carouselTrack) elements.carouselTrack.style.display = 'none';
}

function hideLoader() {
  if (elements.skeletonLoader) elements.skeletonLoader.style.display = 'none';
  if (elements.carouselTrack) elements.carouselTrack.style.display = 'flex';
}

// Event Listeners
elements.prevBtn?.addEventListener('click', () => changePage('prev'));
elements.nextBtn?.addEventListener('click', () => changePage('next'));

elements.searchInput?.addEventListener('input', () => {
  appState.currentPage = 1;
  filterArticles();
  setupCarousel();
});

elements.filterCategory?.addEventListener('change', () => {
  appState.currentPage = 1;
  filterArticles();
  setupCarousel();
});

// Initialization
document.addEventListener('DOMContentLoaded', fetchArticles);