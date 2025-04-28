// Read.js

document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
    setupActionButtons();
    loadComments();
  });
  
  /**
   * Load the article details dynamically
   */
  function loadArticle() {
    const articleId = getArticleIdFromURL();
    
    // Simulate fetching article data (replace with actual API or database fetch)
    const articleData = {
      id: articleId,
      title: "Sample News Article Title",
      author: "John Doe",
      date: "April 25, 2025",
      image: "https://via.placeholder.com/800x400",
      content: `
        <p class="lead">This is a lead paragraph introducing the article.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel tincidunt...</p>
        <h2 class="section-title">Subheading Example</h2>
        <p>More detailed content continues here...</p>
        <blockquote class="blockquote">
          <p>This is a highlighted quote from the article.</p>
          <footer class="blockquote-footer">John Doe</footer>
        </blockquote>
      `
    };
  
    displayArticle(articleData);
  }
  
  /**
   * Display the article content
   */
  function displayArticle(data) {
    document.querySelector('.article-title').textContent = data.title;
    document.querySelector('.article-date').textContent = data.date;
    document.querySelector('.featured-image img').src = data.image;
    document.querySelector('.article-content').innerHTML = data.content;
  }
  
  /**
   * Setup Edit and Delete button actions
   */
  function setupActionButtons() {
    const editButton = document.querySelector('.btn-warning');
    const deleteButton = document.querySelector('.btn-danger');
  
    editButton?.addEventListener('click', () => {
      alert('Edit article functionality not implemented yet.');
      // Redirect to edit page if needed
    });
  
    deleteButton?.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this article?')) {
        alert('Delete functionality not implemented yet.');
        // Call delete API or perform action
      }
    });
  }
  
  /**
   * Load comments dynamically
   */
  function loadComments() {
    // Example comments (replace with dynamic fetch)
    const comments = [
      { user: "Alice", text: "Great article!" },
      { user: "Bob", text: "Thanks for the information." }
    ];
  
    const commentList = document.querySelector('.comment-list');
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
  }
  
  /**
   * Utility: Extract article ID from URL
   */
  function getArticleIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '1'; // Default to 1 if no id
  }
  