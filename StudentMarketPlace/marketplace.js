

const apiURL = 'https://d8a050ec-60d2-4649-8662-1a13b4235fbb-00-3h16e67wguxgj.sisko.replit.dev/api/market_api.php';


let itemsData=[];
let currentPage = 1;
const itemsPerPage = 6;
    
// Fetch and display
showLoading();
fetch(apiURL)
  .then(response => response.json())
  .then(data => {
    itemsData = data;
    displayItems(itemsData);
    createPagination(itemsData);
  })
  .catch(error => {
    console.error('Error loading items:', error);
  })
  .finally(() => {
    hideLoading();
  });
  
  //dynamic category filter from api
function populateCategoryFilter(items) {
  const filterSelect = document.querySelector('select.form-select');
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  // Clear existing options and add default
  filterSelect.innerHTML = `<option selected>Filter Category</option>`;

  // Add dynamic options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filterSelect.appendChild(option);
  });
}

function displayItems(items) {
  const container = document.querySelector('#marketplace-listings');
  container.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = items.slice(start, end);

  if (paginatedItems.length === 0) {
    container.innerHTML = `<div class="col-12 text-center"><p>No items found.</p></div>`;
    return;
  }

  paginatedItems.forEach(item => {
    const card = `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${item.image}" class="card-img-top" style="height: 200px; object-fit: cover;" data-item-id="${item.id}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-text flex-grow-1">${item.description}</p>
            <p class="card-text"><strong>Price:</strong> ${item.price} BHD</p>
            <p class="card-text"><strong>Email:</strong> ${item.email}</p>
            <p class="card-text"><strong>Phone:</strong> ${item.phone}</p>
            <button class="btn btn-primary contact-seller-btn" data-seller-email="${item.email}">Contact Seller</button>
            <button class="btn btn-info view-details-btn" data-item-id="${item.id}">View Details</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });

  createPagination(items);
  attachContactButtonHandlers();
  attachViewDetailHandlers();
}

function createPagination(items) {
  const pagination = document.querySelector('#pagination');
  pagination.innerHTML = '';

  const pageCount = Math.ceil(items.length / itemsPerPage);

  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevButton.innerHTML = `<button class="page-link">&lt;</button>`;

  prevButton.querySelector('button').style.fontSize = '18px'; 
  prevButton.querySelector('button').style.padding = '8px 16px'; 
  
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayItems(items);
    }
  });
  pagination.appendChild(prevButton);
  
  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;

    li.querySelector('button').style.fontSize = '18px'; 
    li.querySelector('button').style.padding = '8px 16px'; 

    li.addEventListener('click', () => {
      currentPage = i;
      displayItems(items);
    });

    pagination.appendChild(li);
  }
  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
  nextButton.innerHTML = `<button class="page-link">&gt;</button>`;

  nextButton.querySelector('button').style.fontSize = '18px'; 
  nextButton.querySelector('button').style.padding = '8px 16px'; 
  nextButton.addEventListener('click', () => {
    if (currentPage < pageCount) {
      currentPage++;
      displayItems(items);
    }
  });
  pagination.appendChild(nextButton);
}

const sortSelect = document.querySelector('#sort-items');
sortSelect.addEventListener('change', () => {
  filterItems(); 
});

const searchInput = document.querySelector('input[type="text"]');
searchInput.addEventListener('input', () => {
  filterItems();
});

const filterSelect = document.querySelector('#filter-category');
filterSelect.addEventListener('change', () => {
  filterItems();
});

function filterItems() {
  showLoading();
    const sortValue = sortSelect.value;
    const searchValue = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    let filteredItems = itemsData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchValue) || item.description.toLowerCase().includes(searchValue);
    const matchesFilter = filterValue === 'Filter Category' || item.category === filterValue;

    return matchesSearch && matchesFilter;
  });

   if (sortValue === 'price-low-high') {
    filteredItems.sort((a, b) => a.price - b.price);  // Sort by price: low to high
  } else if (sortValue === 'price-high-low') {
    filteredItems.sort((a, b) => b.price - a.price);  // Sort by price: high to low
  } else if (sortValue === 'Newest') {
    filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));  // Sort by newest
  }
    currentPage = 1;
  displayItems(filteredItems); // Display the filtered items
  attachContactButtonHandlers();
   hideLoading();

}

// Get the form and the submit button
const addItemForm = document.getElementById('addItemForm');
const addItemButton = document.querySelector('.btn.btn-success');

// Listen for form submission
addItemForm.addEventListener('submit', function(event) {
  event.preventDefault();  

  // Get the values from the form fields
  const title = document.getElementById('itemTitle').value.trim();
  const description = document.getElementById('itemDescription').value.trim();
  const category = document.getElementById('itemCategory').value;
  const email = document.getElementById('itemEmail').value.trim();
  const image = document.getElementById('itemImage').value.trim();
  const phone = document.getElementById('itemPhone').value.trim();
  const price = document.getElementById('itemPrice').value.trim();

  let valid = true;

  // Validate title (required)
  if (!title) {
    alert('Title is required');
    valid = false;
  }

  // Validate description (required)
  if (!description) {
    alert('Description is required');
    valid = false;
  }
  

  
  // Validate category (required and not the default value)
if (!category || category === "" || category === "Choose a category") {
  alert('Category is required');
  valid = false;
}


  // Validate email (required and correct format)
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!email || !emailPattern.test(email)) {
    alert('Please enter a valid email address');
    valid = false;
  }

  // Validate phone (optional but should be valid if provided)
  const phonePattern = /^[0-9]+$/;
  if (phone && !phonePattern.test(phone)) {
    alert('Please enter a valid phone number');
    valid = false;
  }

  // Validate price (required and positive number)
  if (!price || isNaN(price) || price <= 0) {
    alert('Please enter a valid price');
    valid = false;
  }

  // If all validations pass, submit the form
  if (valid) {
    const newItem = {
  title,
  description,
  category,
  email,
  image,
  phone,
  price,
  createdAt: new Date().toISOString()
};


    console.log('Submitting item:', newItem);

    // Add new item to the marketplace
    showLoading();

    fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    })
    .then(response => response.json())
    .then(data => {

     if (data.success) {
      // Add the new item
      itemsData.unshift(data.item);

      // Close the modal and reset the form
      const addItemModalEl = document.getElementById('addItemModal');
      const addItemModal = bootstrap.Modal.getInstance(addItemModalEl);
      addItemModal.hide();
      addItemForm.reset();

      // Re-display the items
      displayItems(itemsData);
      createPagination(itemsData);
    } else {
      console.error('failed to add item:', data);
    }
  
  })
    .catch(error => {
      console.error('Error adding item:', error);
    })
.finally(() => {
  hideLoading(); 
});
  }
});

// Function to open the contact seller modal and populate it with seller data
function openContactSellerModal(sellerEmail) {
    document.getElementById('sellerEmail').value = sellerEmail; // Populate seller's email
    const contactModal = new bootstrap.Modal(document.getElementById('contactSellerModal'));
    contactModal.show();
}

// Example of how the contact seller button can trigger this
function attachContactButtonHandlers() {
  document.querySelectorAll('.contact-seller-btn').forEach(button => {
    button.addEventListener('click', () => {
      const sellerEmail = button.getAttribute('data-seller-email');
      openContactSellerModal(sellerEmail);
    });
  });
}


// Handle the contact seller form submission
document.getElementById('contactSellerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    const sellerEmail = document.getElementById('sellerEmail').value;

    // Log for debugging
    console.log('Message sent to', sellerEmail, 'Message:', message);

    // Send message using fetch
    fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'messageSeller',
            email: sellerEmail,
            message: message
        }),
    })
    .then(response => {
        // Try to parse JSON if status is OK
        if (response.ok) {
            return response.json();
        } else {
            return response.text(); // Could be HTML error page
        }
    })
    .then(data => {
        if (typeof data === 'object' && data.success) {
            alert('Message sent to the seller!');
            // Close the modal
            const contactModalEl = document.getElementById('contactSellerModal');
            const contactModal = bootstrap.Modal.getInstance(contactModalEl);
            contactModal.hide();
        } else {
            console.error('Failed to send message:', data);
            alert('There was an issue sending the message.');
        }
    })
    .catch(error => {
        console.error('Error sending message:', error);
        alert('There was an error processing your request.');
    });
});


// Create the modal instance once when the script runs
const itemDetailModalInstance = new bootstrap.Modal(document.getElementById('itemDetailModal'));

function attachViewDetailHandlers() {
  const viewDetailButtons = document.querySelectorAll('.view-details-btn');
  viewDetailButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const itemId = event.target.dataset.itemId;
      const item = itemsData.find(item => item.id === itemId);

      if (item) {
        // Set item details in the modal
        document.getElementById('itemDetailTitle').textContent = item.title;
        document.getElementById('itemDetailImage').src = item.image;
        document.getElementById('itemDetailDescription').textContent = item.description;
        document.getElementById('itemDetailPrice').textContent = item.price;
        document.getElementById('itemDetailCategory').textContent = item.category;
        document.getElementById('itemDetailEmail').textContent = item.email;
        document.getElementById('itemDetailPhone').textContent = item.phone;
        
        // Show the modal using the existing instance
        itemDetailModalInstance.show();
      }
    });
  });
}



function populateModalWithData(item) {
  // Populate the modal with item details
  const modal = document.getElementById('itemDetailModal');
  modal.querySelector('.modal-title').textContent = item.title;
  modal.querySelector('.modal-body .description').textContent = item.description;
  modal.querySelector('.modal-body .price').textContent = `${item.price} BHD`;
  modal.querySelector('.modal-body .location').textContent = item.location;
  
  // Add the same contact seller button to the modal as on the main page
  const contactButton = modal.querySelector('.contact-seller-btn');
contactButton.setAttribute('data-item-id', item.id);
contactButton.addEventListener('click', () => {
  // Add any specific contact seller functionality here
  alert(`Contacting seller for item: ${item.id}`);
});

  
  // Show the modal
  $('#itemDetailModal').modal('show');
}

function showLoading() {
  document.getElementById('loadingIndicator').classList.remove('d-none');
}

function hideLoading() {
  document.getElementById('loadingIndicator').classList.add('d-none');
}
