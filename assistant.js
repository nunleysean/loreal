// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  /* Get chat interface elements */
  const chatForm = document.getElementById("chatForm");
  const chatWindow = document.getElementById("chatWindow");
  const generateRoutineButton = document.getElementById("generateRoutine");

  // Store the conversation history
  let conversationHistory = [
    {
      role: "system",
      content: "You are a helpful assistant answering questions about beauty routines and products.",
    },
  ];

  // Add event listener for chat form submission
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    // Add user's message to chat window
    chatWindow.innerHTML += `<div class="chat-message user-message">${userInput}</div>`;

    // Add user's message to conversation history
    conversationHistory.push({
      role: "user",
      content: userInput,
    });

    // Clear input field
    document.getElementById("userInput").value = "";

    try {
      // Fetch response from OpenAI API
      const response = await fetch("https://travelbot.nunley-sean.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: conversationHistory,
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      // Add assistant's response to chat window
      chatWindow.innerHTML += `<div class="chat-message assistant-message">${marked.parse(assistantResponse)}</div>`;

      // Add assistant's response to conversation history
      conversationHistory.push({
        role: "assistant",
        content: assistantResponse,
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      chatWindow.innerHTML += 
        '<div class="chat-message assistant-message">Sorry, something went wrong. Please try again later.</div>';
    }

    // Scroll to bottom of chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });

  // Function to fetch routine from OpenAI API
  async function fetchRoutine(selectedProducts) {
    try {
      const response = await fetch("https://travelbot.nunley-sean.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a beauty advisor creating routines using the provided products.",
            },
            {
              role: "user",
              content: `Create a beauty routine using the following products: ${selectedProducts
                .map((product) => product.name)
                .join(", ")}`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching routine:", error);
      return "Sorry, there was an error generating your routine. Please try again later.";
    }
  }

  // Event listener for Generate Routine button
  generateRoutineButton.addEventListener("click", async () => {
    const selectedItems = document.querySelectorAll(".selected-item");

    if (selectedItems.length === 0) {
      chatWindow.innerHTML = "<p>Please select some products to generate a routine.</p>";
      return;
    }

    // Collect selected products
    const selectedProducts = Array.from(selectedItems).map((item) => ({
      id: item.getAttribute("data-id"),
      name: item.querySelector("p").textContent,
    }));

    // Show loading message
    chatWindow.innerHTML = "<p>Generating your routine...</p>";

    // Fetch routine and display it
    const routine = await fetchRoutine(selectedProducts);
    chatWindow.innerHTML = `<div class="chat-message assistant-message">${marked.parse(routine)}</div>`;
  });
});
