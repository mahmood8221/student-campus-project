const API_URL = 'https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news';
const ITEMS_PER_PAGE = 6;

const state = {
  currentPage: 1,
  totalPages: 1,
};

async function fetchArticles(page = 1, limit = ITEMS_PER_PAGE) {
  try {
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
    const data = await response.json();

    // Since MockAPI doesn't return total count headers, we hardcode the total manually for now
    const totalItems = 28; // Adjust this if your data size changes
    state.totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

function renderArticles(articles) {
  const container = document.getElementById('news-container');
  container.innerHTML = '';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'news-card';

    card.innerHTML = `
      <img src="${article.image}" alt="${article.title}" class="news-image" />
      <div class="news-info">
        <h3>${article.title}</h3>
        <p><strong>By:</strong> ${article.author}</p>
        <p><strong>Date:</strong> ${new Date(article.date * 1000).toLocaleDateString()}</p>
        <p><strong>Category:</strong> ${article.category}</p>
        <p><strong>Views:</strong> ${article.views}</p>
        <p>${article.content}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= state.totalPages; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = i === state.currentPage ? 'active' : '';
    btn.onclick = () => changePage(i);
    pagination.appendChild(btn);
  }
}

async function changePage(pageNumber) {
  state.currentPage = pageNumber;
  const articles = await fetchArticles(pageNumber);
  renderArticles(articles);
  renderPagination();
}

async function init() {
  const articles = await fetchArticles(state.currentPage);
  renderArticles(articles);
  renderPagination();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
