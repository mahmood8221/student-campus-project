// Add.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.news-form');
    const publishButton = form.querySelector('button[type="submit"]');
    const imageInput = document.getElementById('imageUpload');
    let uploadedImageBase64 = '';
  
    // Show image preview and save base64
    imageInput.addEventListener('change', function () {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          uploadedImageBase64 = e.target.result; // Save base64 image
  
          let existingPreview = document.getElementById('imagePreview');
          if (!existingPreview) {
            existingPreview = document.createElement('img');
            existingPreview.id = 'imagePreview';
            existingPreview.style.maxWidth = '100%';
            existingPreview.style.marginTop = '10px';
            imageInput.parentElement.appendChild(existingPreview);
          }
          existingPreview.src = uploadedImageBase64;
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
  
      // Reset field styles
      [titleField, categoryField, contentField, authorField, publishDateField].forEach(field => {
        field.style.borderColor = '';
      });
  
      // Validation
      let hasError = false;
      if (!titleField.value.trim()) { titleField.style.borderColor = 'red'; hasError = true; }
      if (!categoryField.value) { categoryField.style.borderColor = 'red'; hasError = true; }
      if (!contentField.value.trim()) { contentField.style.borderColor = 'red'; hasError = true; }
      if (!authorField.value.trim()) { authorField.style.borderColor = 'red'; hasError = true; }
      if (!publishDateField.value) { publishDateField.style.borderColor = 'red'; hasError = true; }
  
      if (hasError) {
        Swal.fire({
          icon: 'error',
          title: 'Form Incomplete',
          text: 'Please fill in all the required fields!',
        });
        return;
      }
  
      // Prepare data
      const newsData = {
        title: titleField.value.trim(),
        category: categoryField.value,
        content: contentField.value.trim(),
        author: authorField.value.trim(),
        publishDate: publishDateField.value,
        image: uploadedImageBase64 || null, // Optional
      };
  
      try {
        publishButton.disabled = true;
        publishButton.innerHTML = 'Publishing...';
  
        const response = await fetch('https://680bf1c32ea307e081d2c4f6.mockapi.io/api/v1/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newsData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to publish article.');
        }
  
        // Show nice success message
        Swal.fire({
          icon: 'success',
          title: 'Article Published!',
          text: 'Your article has been successfully added!',
          confirmButtonText: 'Go to News',
        }).then(() => {
          window.location.href = '../News.html'; // Redirect after user clicks OK
        });
  
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Publish Failed',
          text: 'There was an error publishing your article. Please try again.',
        });
      } finally {
        publishButton.disabled = false;
        publishButton.innerHTML = 'Publish Article';
      }
    });
  });
  