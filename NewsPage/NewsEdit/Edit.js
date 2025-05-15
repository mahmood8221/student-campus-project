// Edit.js - Handles news article editing

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.news-form');
  const updateButton = form.querySelector('button[type="submit"]');
  const loadingElement = document.getElementById('loading');
  const errorMessageElement = document.getElementById('errorMessage');
  const imageInput = document.getElementById('imageUpload');
  let uploadedImageBase64 = '';
  
  // Get article ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  
  if (!articleId) {
    showError('No article ID provided. Please go back and try again.');
    return;
  }
  
  // Set the hidden article ID field
  document.getElementById('articleId').value = articleId;
  
  // Load article data
  loadArticleData(articleId);
  
  // Show image preview and save base64
  imageInput.addEventListener('change', function () {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedImageBase64 = e.target.result;
        document.getElementById('currentImage').src = uploadedImageBase64;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const titleField = document.getElementById('articleTitle');
    const categoryField = document.getElementById('category');
    const contentField = document.getElementById('content');
    const authorField = document.getElementById('author');
    
    // Reset field styles
    [titleField, categoryField, contentField, authorField].forEach(field => {
      field.style.borderColor = '';
    });
    
    // Validation
    let hasError = false;
    if (!titleField.value.trim()) { titleField.style.borderColor = 'red'; hasError = true; }
    if (!categoryField.value) { categoryField.style.borderColor = 'red'; hasError = true; }
    if (!contentField.value.trim()) { contentField.style.borderColor = 'red'; hasError = true; }
    if (!authorField.value.trim()) { authorField.style.borderColor = 'red'; hasError = true; }
    
    if (hasError) {
      Swal.fire({
        icon: 'error',
        title: 'Form Incomplete',
        text: 'Please fill in all the required fields!',
      });
      return;
    }
    
    // Prepare news data
    let newsData = {
      title: titleField.value.trim(),
      category: categoryField.value,
      content: contentField.value.trim(),
      author: authorField.value.trim()
    };
    
    // Add image if a new one was uploaded
    if (uploadedImageBase64) {
      newsData.image = uploadedImageBase64;
    }
    
    try {
      updateButton.disabled = true;
      updateButton.innerHTML = 'Updating...';
      
      // Send update request
      const response = await fetch(`http://localhost/News/api.php?action=update_news&id=${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update article');
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Article Updated!',
        text: 'Your article has been successfully updated!',
        confirmButtonText: 'Go to News',
      }).then(() => {
        window.location.href = '../News.html';
      });
      
    } catch (error) {
      console.error('Error updating article:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'There was an error updating your article. Please try again.',
      });
    } finally {
      updateButton.disabled = false;
      updateButton.innerHTML = 'Update Article';
    }
  });
});

/**
 * Load article data from the API
 */
async function loadArticleData(articleId) {
  try {
    const response = await fetch(`http://localhost/News/api.php?action=get_news&id=${articleId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch article data');
    }
    
    const article = await response.json();
    
    // Populate form fields
    document.getElementById('articleTitle').value = article.title || '';
    document.getElementById('category').value = article.category || '';
    document.getElementById('content').value = article.content || '';
    document.getElementById('author').value = article.author || '';
    
    // Set image preview
    if (article.image) {
      document.getElementById('currentImage').src = article.image;
    } else {
      document.getElementById('currentImage').src = 'https://placehold.co/600x400?text=No+Image';
    }
    
    // Show form and hide loading
    document.querySelector('.news-form').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    
  } catch (error) {
    console.error('Error loading article data:', error);
    showError('Failed to load article data. Please try again later.');
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  document.getElementById('loading').style.display = 'none';
}
