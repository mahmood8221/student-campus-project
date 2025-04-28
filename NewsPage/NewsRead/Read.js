document.addEventListener('DOMContentLoaded', async () => {
    await loadArticle();
    setupActionButtons();
    loadComments();
  });
  
  /**
   * Load the article details dynamically from the API
   */
  async function loadArticle() {
    const articleId = getArticleIdFromURL();
    const apiURL = `https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news/${articleId}`;
  
    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error('Failed to fetch article.');
      }
      const articleData = await response.json();
      displayArticle(articleData);
    } catch (error) {
      console.error('Error loading article:', error);
      document.querySelector('.main-content').innerHTML = `
        <div class="alert alert-danger" role="alert">
          Failed to load the article. Please try again later.
        </div>
      `;
    }
  }
  
  /**
   * Display the article content
   */
  function displayArticle(data) {
    document.getElementById('article-title').textContent = data.title;
    document.getElementById('author-name').textContent = data.author;
    document.getElementById('publish-date').textContent = new Date(data.createdAt).toLocaleDateString();
    document.getElementById('author-img').src = data.authorImg || '../assets/author.jpg';
    document.getElementById('featured-image').src = data.image || 'https://via.placeholder.com/800x400';
    document.getElementById('image-caption').textContent = data.caption || '';
    document.getElementById('article-content').innerHTML = data.content;
  
    // Render tags
    if (Array.isArray(data.tags)) {
      const tagsContainer = document.getElementById('article-tags');
      tagsContainer.innerHTML = '';
      data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'badge bg-primary me-1';
        span.textContent = tag;
        tagsContainer.appendChild(span);
      });
    }
  }
  
  /**
   * Setup Edit and Delete button actions
   */
  function setupActionButtons() {
    const editButton = document.querySelector('.btn-warning');
    const deleteButton = document.querySelector('.btn-danger');
  
    editButton?.addEventListener('click', () => {
      alert('Edit article functionality not implemented yet.');
    });
  
    deleteButton?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this article?')) {
        const articleId = getArticleIdFromURL();
        const apiURL = `https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news/${articleId}`;
        try {
          const response = await fetch(apiURL, { method: 'DELETE' });
          if (!response.ok) {
            throw new Error('Failed to delete article.');
          }
          alert('Article deleted successfully.');
          window.location.href = 'News.html'; // Redirect after deletion
        } catch (error) {
          console.error('Error deleting article:', error);
          alert('Failed to delete the article.');
        }
      }
    });
  }
  
  /**
   * Load comments (static for now, can connect to API later)
   */
  function loadComments() {
    const comments = [
      { user: "Alice", text: "Great article!" },
      { user: "Bob", text: "Thanks for the insights!" }
    ];
  
    const commentList = document.getElementById('comment-list');
    const commentCount = document.getElementById('comment-count');
    commentList.innerHTML = '';
  
    comments.forEach(comment => {
      const div = document.createElement('div');
      div.className = 'comment p-3 mb-2';
      div.innerHTML = `
        <div class="d-flex align-items-center mb-2">
          <img src="https://via.placeholder.com/40" class="comment-avatar me-2" alt="Avatar">
          <strong>${comment.user}</strong>
        </div>
        <p>${comment.text}</p>
      `;
      commentList.appendChild(div);
    });
  
    commentCount.textContent = comments.length;
  }
  
  /**
   * Utility: Extract article ID from URL
   */
  function getArticleIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '1'; // Default to ID 1 if no ID found
  }
  