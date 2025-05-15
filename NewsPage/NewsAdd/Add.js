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
        uploadedImageBase64 = e.target.result;

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

    // Prepare news data
    let newsData = {
      title: titleField.value.trim(),
      category: categoryField.value,
      content: contentField.value.trim(),
      author: authorField.value.trim(),
      publishDate: publishDateField.value,
      image: uploadedImageBase64 || null,
    };

    try {
      publishButton.disabled = true;
      publishButton.innerHTML = 'Publishing...';

      let response = await fetch('http://localhost/News/api.php?action=create_news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData),
      });

      if (!response.ok) {
        // Try again without image
        newsData.image = null;
        response = await fetch('http://localhost/News/api.php?action=create_news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newsData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed even after removing image.');
        }

        // Success without image
        Swal.fire({
          icon: 'success',
          title: 'Article Published!',
          html: `
            <p>Your article has been successfully added!</p>
            <p style="color:red; font-weight:bold; margin-top:10px;">⚠️ Image upload failed. A random image was NOT added.</p>
          `,
          confirmButtonText: 'Go to News',
        }).then(() => {
          window.location.href = '../News.html';
        });

      } else {
        // Success with image
        Swal.fire({
          icon: 'success',
          title: 'Article Published!',
          text: 'Your article has been successfully added!',
          confirmButtonText: 'Go to News',
        }).then(() => {
          window.location.href = '../News.html';
        });
      }

    } catch (error) {
      console.error(error);

      let errorMessage = 'There was an error publishing your article. Please try again.';

      if (error && error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Publish Failed',
        text: errorMessage,
      });
    } finally {
      publishButton.disabled = false;
      publishButton.innerHTML = 'Publish Article';
    }
  });
});
