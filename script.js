/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const htmlElement = document.documentElement;

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

// Function to detect text direction
function detectTextDirection() {
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  const systemDir = getComputedStyle(document.body).direction;
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  const isRTL = rtlLanguages.some(lang => browserLang.startsWith(lang));
  const direction = isRTL || systemDir === 'rtl' ? 'rtl' : 'ltr';
  htmlElement.setAttribute('dir', direction);
  htmlElement.setAttribute('lang', browserLang);
  return direction;
}

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <div class="product-description">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((productCard, index) => {
    productCard.addEventListener("click", () =>
      handleProductSelection(productCard, products[index])
    );
  });
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );
  displayProducts(filteredProducts);
});

// Function to save selected products to localStorage
function saveToLocalStorage(product, isSelected) {
  const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  if (isSelected) {
    savedProducts.push(product);
  } else {
    const index = savedProducts.findIndex(p => p.id === product.id);
    if (index > -1) savedProducts.splice(index, 1);
  }
  localStorage.setItem('selectedProducts', JSON.stringify(savedProducts));
}

// Function to load selected products from localStorage
function loadFromLocalStorage() {
  const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  savedProducts.forEach(product => {
    const selectedItem = document.createElement("div");
    selectedItem.classList.add("selected-item");
    selectedItem.setAttribute("data-id", product.id);
    selectedItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h3>${product.brand}</h3>
        <p>${product.name}</p>
      </div>
    `;
    selectedProductsList.appendChild(selectedItem);
  });
}

// Function to handle product selection - moved to global scope
function handleProductSelection(productCard, product) {
  if (productCard.classList.contains("selected")) {
    productCard.classList.remove("selected");
    const selectedItem = selectedProductsList.querySelector(
      `[data-id="${product.id}"]`
    );
    if (selectedItem) selectedItem.remove();
    saveToLocalStorage(product, false);
  } else {
    productCard.classList.add("selected");
    const selectedItem = document.createElement("div");
    selectedItem.classList.add("selected-item");
    selectedItem.setAttribute("data-id", product.id);
    selectedItem.innerHTML = `
       <img src="${product.image}" alt="${product.name}" />
            <div class="product-info">
              <h3>${product.brand}</h3>
              <p>${product.name}</p>
            </div>
    `;
    selectedProductsList.appendChild(selectedItem);
    saveToLocalStorage(product, true);
  }
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const direction = detectTextDirection();

  // Show placeholder message initially
  productsContainer.innerHTML = `
    <div class="placeholder-message">
      Select a category to view products
    </div>
  `;

  // Add clear all functionality
  const clearAllBtn = document.getElementById("clearAllBtn");
  clearAllBtn.addEventListener("click", () => {
    selectedProductsList.innerHTML = "";
    localStorage.removeItem('selectedProducts');
    const selectedCards = document.querySelectorAll(".product-card.selected");
    selectedCards.forEach(card => card.classList.remove("selected"));
  });

  // Load saved products when page loads
  loadFromLocalStorage();
});
