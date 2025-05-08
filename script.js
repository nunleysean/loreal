/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
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
  // Try to get browser language
  const browserLang = navigator.language || navigator.userLanguage;
  
  // Get system text direction if available
  const systemDir = getComputedStyle(document.body).direction;
  
  // RTL languages list
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  
  // Check if browser language is RTL
  const isRTL = rtlLanguages.some(lang => browserLang.startsWith(lang));
  
  // Set direction based on detection
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

  // Add click event listener for product selection
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

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Store the conversation history
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful assistant answering questions about beauty routines and products.",
  },
];

// Add event listener for chat form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the form from refreshing the page

  const userInput = document.getElementById("userInput").value.trim();

  if (!userInput) {
    return; // Do nothing if the input is empty
  }

  // Add user's message to the chat window
  chatWindow.innerHTML += `<div class="chat-message user-message">${userInput}</div>`;

  // Add user's message to the conversation history
  conversationHistory.push({
    role: "user",
    content: userInput,
  });

  // Clear the input field
  document.getElementById("userInput").value = "";

  // Show a loading message
//  chatWindow.innerHTML +=
    //'<div class="chat-message assistant-message">Thinking...</div>';

  try {
    // Fetch response from OpenAI API
    const response = await fetch("https://travelbot.nunley-sean.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: conversationHistory,
        max_tokens: 2000, // Increase token limit for longer responses
        temperature: 0.7  // Add some creativity while keeping responses focused
      }),
    });

    const data = await response.json();

    // Get the assistant's response
    const assistantResponse = data.choices[0].message.content;

    // Add assistant's response to the chat window
    chatWindow.innerHTML += `<div class="chat-message assistant-message">${marked.parse(
      assistantResponse
    )}</div>`;

    // Add assistant's response to the conversation history
    conversationHistory.push({
      role: "assistant",
      content: assistantResponse,
    });
  } catch (error) {
    console.error("Error fetching response:", error);
    chatWindow.innerHTML +=
      '<div class="chat-message assistant-message">Sorry, something went wrong. Please try again later.</div>';
  }

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
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



// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const direction = detectTextDirection();

  if (direction === 'rtl') {
    const displayMessage = (message, isUser) => {
      const messageClass = isUser ? 'user-message' : 'assistant-message';
      chatWindow.innerHTML += `
        <div class="chat-message ${messageClass}" style="text-align: ${isUser ? 'right' : 'left'}">
          ${message}
        </div>
      `;
    };
  }

  const productsContainer = document.getElementById("productsContainer");
  const selectedProductsList = document.getElementById("selectedProductsList");
  const categoryFilter = document.getElementById("categoryFilter");

  // Show placeholder message initially
  productsContainer.innerHTML = `
    <div class="placeholder-message">
      Select a category to view products
    </div>
  `;

  // Function to handle product selection
  const handleProductSelection = (productCard, product) => {
    if (productCard.classList.contains("selected")) {
      productCard.classList.remove("selected");
      // Remove product from selected list
      const selectedItem = selectedProductsList.querySelector(
        `[data-id="${product.id}"]`
      );
      if (selectedItem) selectedItem.remove();
      saveToLocalStorage(product, false);
    } else {
      productCard.classList.add("selected");
      // Add product to selected list
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
  };

  // Fetch products and render them based on category
  categoryFilter.addEventListener("change", () => {
    const selectedCategory = categoryFilter.value;

    fetch("products.json")
      .then((response) => response.json())
      .then((data) => {
        const filteredProducts = data.products.filter(
          (product) => product.category === selectedCategory
        );

        if (filteredProducts.length > 0) {
          productsContainer.innerHTML = "";
          filteredProducts.forEach((product) => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
              <img src="${product.image}" alt="${product.name}" />
              <div class="product-info">
                <h3>${product.brand}</h3>
                <p>${product.name}</p>
              </div>
              <div class="product-description">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
              </div>
            `;
            productCard.addEventListener("click", () =>
              handleProductSelection(productCard, product)
            );
            productsContainer.appendChild(productCard);
          });
        } else {
          productsContainer.innerHTML = `
            <div class="placeholder-message">
              No products found for the selected category
            </div>
          `;
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  });

  const generateRoutineButton = document.getElementById("generateRoutine");

  // Function to fetch routine from OpenAI API
  async function fetchRoutine(selectedProducts) {
    try {
      const response = await fetch(
        "https://travelbot.nunley-sean.workers.dev/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are a beauty advisor creating routines using the provided products.",
              },
              {
                role: "user",
                content: `Create a beauty routine using the following products: ${selectedProducts
                  .map((product) => product.name)
                  .join(", ")}`,
              },
            ],
            max_tokens: 2000, // Increase token limit for longer responses
            temperature: 0.7  // Add some creativity while keeping responses focused
          }),
        }
      );

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching routine:", error);
      return "Sorry, there was an error generating your routine. Please try again later.";
    }
  }

  // Event listener for Generate Routine button
  generateRoutineButton.addEventListener("click", async () => {
    const selectedItems =
      selectedProductsList.querySelectorAll(".selected-item");

    if (selectedItems.length === 0) {
      chatWindow.innerHTML =
        "<p>Please select some products to generate a routine.</p>";
      return;
    }

    // Collect selected products
    const selectedProducts = Array.from(selectedItems).map((item) => {
      return {
        id: item.getAttribute("data-id"),
        name: item.querySelector("p").textContent,
      };
    });

    // Show loading message
    chatWindow.innerHTML = "<p>Generating your routine...</p>";

    // Fetch routine and display it
    const routine = await fetchRoutine(selectedProducts);

    // Use marked to convert markdown to HTML
    chatWindow.innerHTML = `<div class="chat-message assistant-message">${marked.parse(
      routine
    )}</div>`;
  });

  // Add clear all functionality
  const clearAllBtn = document.getElementById("clearAllBtn");
  clearAllBtn.addEventListener("click", () => {
    // Clear selected products list
    selectedProductsList.innerHTML = "";
    localStorage.removeItem('selectedProducts');
    // Remove selected class from all product cards
    const selectedCards = document.querySelectorAll(".product-card.selected");
    selectedCards.forEach(card => card.classList.remove("selected"));
  });

  // Load saved products when page loads
  loadFromLocalStorage();
});
