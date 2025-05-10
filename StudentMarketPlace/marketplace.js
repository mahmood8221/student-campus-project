

const apiURL = "https://681cf49af74de1d219ae5ed8.mockapi.io/StudentMarketPlace";

let itemsData=[];
let currentPage = 1;
const itemsPerPage = 6;
    
// Fetch and display
fetch(apiURL)
  .then(response => response.json())

  .then(data => {
    itemsData = data;
    populateCategoryFilter(data);
    displayItems(data);
    
    })
    
    //Error handling
  .catch(error => {
    console.error("Error fetching data:", error);
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
          <img src="${item.image}" class="card-img-top" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-text flex-grow-1">${item.description}</p>
            <p class="card-text"><strong>Price:</strong> ${item.price} BHD</p>
            <p class="card-text"><strong>Email:</strong> ${item.email}</p>
            <p class="card-text"><strong>Phone:</strong> ${item.phone}</p>
            <button class="btn btn-primary contact-seller-btn" data-seller-email="${item.email}">Contact Seller</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });

  createPagination(items);
  attachContactButtonHandlers();
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
      createdAt: new Date().toISOString(),
    };

    // Add new item to the marketplace (both in itemsData array and the API)
    fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    })
    .then(response => response.json())
    .then(data => {
      // Add the new item to the local itemsData array
      itemsData.push(data);

      // Close the modal and reset the form
      const addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
      addItemModal.hide();
      addItemForm.reset();

      // Re-display the items
      displayItems(itemsData);
      createPagination(itemsData);
    })
    .catch(error => {
      console.error('Error adding item:', error);
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

    // Here, you can handle sending the message to the seller (e.g., via an API)
    console.log('Message sent to', sellerEmail, 'Message:', message);
    alert('Message sent to the seller!');
});
