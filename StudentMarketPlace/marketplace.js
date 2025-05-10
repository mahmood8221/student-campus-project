

const apiURL = "https://681cf49af74de1d219ae5ed8.mockapi.io/StudentMarketPlace";

// Fetch and display items
fetch(apiURL)
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('#marketplace-listings');
    container.innerHTML = '';

    data.forEach(item => {
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
              <button class="btn btn-primary mt-auto">Contact Seller</button>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });

