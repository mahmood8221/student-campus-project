// Add.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.news-form');
    const publishButton = form.querySelector('button[type="submit"]');
    const imageInput = document.getElementById('imageUpload');
  
    // Show image preview when a file is selected
    imageInput.addEventListener('change', function () {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          let existingPreview = document.getElementById('imagePreview');
          if (!existingPreview) {
            existingPreview = document.createElement('img');
            existingPreview.id = 'imagePreview';
            existingPreview.style.maxWidth = '100%';
            existingPreview.style.marginTop = '10px';
            imageInput.parentElement.appendChild(existingPreview);
          }
          existingPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      // Fields
      const titleField = document.getElementById('articleTitle');
      const categoryField = document.getElementById('category');
      const contentField = document.getElementById('content');
      const authorField = document.getElementById('author');
      const publishDateField = document.getElementById('publishDate');
      const imageFile = imageInput.files[0];
  
      // Reset all field styles
      [titleField, categoryField, contentField, authorField, publishDateField].forEach(field => {
        field.style.borderColor = '';
      });
  
      // Validate Form Fields
      let hasError = false;
  
      if (!titleField.value.trim()) {
        titleField.style.borderColor = 'red';
        hasError = true;
      }
      if (!categoryField.value) {
        categoryField.style.borderColor = 'red';
        hasError = true;
      }
      if (!contentField.value.trim()) {
        contentField.style.borderColor = 'red';
        hasError = true;
      }
      if (!authorField.value.trim()) {
        authorField.style.borderColor = 'red';
        hasError = true;
      }
      if (!publishDateField.value) {
        publishDateField.style.borderColor = 'red';
        hasError = true;
      }
  
      if (hasError) {
        alert('Please fill in all the highlighted fields!');
        return;
      }
  
      // Prepare Data to Send
      const formData = new FormData();
      formData.append('title', titleField.value.trim());
      formData.append('category', categoryField.value);
      formData.append('content', contentField.value.trim());
      formData.append('author', authorField.value.trim());
      formData.append('publishDate', publishDateField.value);
  
      if (imageFile) {
        formData.append('image', imageFile);
      }
  
      try {
        // Disable button and show loading
        publishButton.disabled = true;
        publishButton.innerHTML = 'Publishing...';
  
        const response = await fetch('https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Failed to publish the article.');
        }
  
        alert('Article published successfully!');
        form.reset(); // Clear the form
        // Remove image preview if exists
        const preview = document.getElementById('imagePreview');
        if (preview) {
          preview.remove();
        }
      } catch (error) {
        console.error(error);
        alert('There was an error publishing the article.');
      } finally {
        publishButton.disabled = false;
        publishButton.innerHTML = 'Publish Article';
      }
    });
  });
  