// Load environment variables
require('dotenv').config();

// Function to send a message to the Gemini API and handle the response
async function sendMessageToGemini(message, inputCode, outputCode) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.openRouter_API}`,
                "HTTP-Referer": `Mathamatica`,
                "X-Title": `Mathamatica`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemma-7b-it:free", // Or any other suitable model
                "messages": [
                    {
                        "role": "system",
                        "content": `Here is the user's current MathJS code in the input editor:\n${inputCode}\n\nHere is the current output:\n${outputCode}`
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ],
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const botMessage = data.choices[0].message.content;
            displayMessage("Bot: " + botMessage);
        } else {
            console.error("No response from Gemini API");
            displayMessage("Error: No response from the bot.");
        }
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        displayMessage("Error: Failed to send message.");
    }
}

// Function to display messages in the chat section
function displayMessage(message) {
    const chatContainer = document.getElementById("chat-container");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Event listener for user input in the chat
const inputField = document.getElementById("input-field");
inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        const userMessage = inputField.value.trim();
        if (userMessage !== "") {
            displayMessage("You: " + userMessage);

            // Get current code from input and output editors
            const inputCode = editor.toString();
            const outputCode = results.toString();

            // Send the message along with the code context to Gemini
            sendMessageToGemini(userMessage, inputCode, outputCode);

            inputField.value = ""; // Clear the input field
        }
    }
});