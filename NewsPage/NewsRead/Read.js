// Read.js
document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
    loadComments();
  });
  
  /**
   * Load the article details dynamically from the API
   */
  function loadArticle() {
    const articleId = getArticleIdFromURL();
    const apiURL = `https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news/${articleId}`;
    fetch(apiURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch article.');
        }
        return response.json();
      })
      .then(articleData => {
        displayArticle(articleData);
      })
      .catch(error => {
        console.error('Error loading article:', error);
        showError('Failed to load the article. Please try again later.');
      });
  }
  
  /**
   * Display the article content in the HTML
   */
  function displayArticle(data) {
    document.getElementById('article-category').textContent = data.category || 'Uncategorized';
    document.getElementById('article-title').textContent = data.title || 'No Title';
    document.getElementById('author-name').textContent = data.author || 'Unknown Author';
    document.getElementById('publish-date').textContent = data.createdAt 
      ? new Date(data.createdAt).toLocaleDateString()
      : 'Unknown Date';
    document.getElementById('author-img').src = data.authorImg || '../assets/placeholder.jpg';
    document.getElementById('featured-image').src = data.image || 'https://via.placeholder.com/800x400';
    document.getElementById('article-content').innerHTML = data.content || '<p>No content available.</p>';
  }
  
  /**
   * Load comments dynamically from the API
   */
  function loadComments() {
    const articleId = getArticleIdFromURL();
    const commentsURL = `https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news/${articleId}/comments`;
  
    fetch(commentsURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch comments.');
        }
        return response.json();
      })
      .then(commentsData => {
        displayComments(commentsData);
      })
      .catch(error => {
        console.error('Error loading comments:', error);
        document.getElementById('comment-count').textContent = '0';
        document.getElementById('comment-list').innerHTML = `
          <div class="alert alert-warning" role="alert">
            Failed to load comments.
          </div>
        `;
      });
  }
  
  /**
   * Display the comments
   */
  function displayComments(comments) {
    const commentList = document.getElementById('comment-list');
    const commentCount = document.getElementById('comment-count');
  
    commentList.innerHTML = '';
    commentCount.textContent = comments.length;
  
    if (comments.length === 0) {
      commentList.innerHTML = `<p class="text-muted">No comments yet. Be the first to comment!</p>`;
      return;
    }
  
    comments.forEach(comment => {
      const div = document.createElement('div');
      div.className = 'comment p-3 mb-2 border rounded';
      div.innerHTML = `
        <div class="d-flex align-items-center mb-2">
          <img src="https://via.placeholder.com/40" 
               alt="Avatar" 
               class="rounded-circle me-2" 
               width="40" 
               height="40">
          <strong>${comment.user || 'Anonymous'}</strong>
        </div>
        <p class="mb-0">${comment.text || ''}</p>
      `;
      commentList.appendChild(div);
    });
  }
  
  /**
   * Utility: Extract article ID from URL
   */
  function getArticleIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '1'; // Default to article 1 if no ID found
  }
  
  /**
   * Utility: Show error message in main content
   */
  function showError(message) {
    document.querySelector('main').innerHTML = `
      <div class="alert alert-danger text-center" role="alert">
        ${message}
      </div>
    `;
  }
  