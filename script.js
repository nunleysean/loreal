/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

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

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
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
});
