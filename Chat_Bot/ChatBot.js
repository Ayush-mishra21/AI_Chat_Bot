let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");

// Add missing file input
let imageinput = document.createElement("input");
imageinput.type = "file";
imageinput.accept = "image/*";
imageinput.style.display = "none";
document.body.appendChild(imageinput);

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyClM88slJCTuGTXBov99WlJC8D3OnfNigc";  // Use a backend instead of direct API key

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    let RequestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: user.message },
                        ...(user.file.data ? [{ inline_data: user.file }] : [])
                    ]
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            let apiResponse = data.candidates[0].content.parts[0].text
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .trim();
            text.innerHTML = apiResponse;
        } else {
            text.innerHTML = "Error: No response from AI.";
        }
    } catch (error) {
        console.error("Fetch error:", error);
        text.innerHTML = "Error fetching AI response.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {};
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage.trim();
    if (!user.message) return; // Prevent empty messages

    let html = `
    <div class="user-chat-box">
        <img src="image.png" alt="User" width="50" style="position: absolute;
    right: 0;
    filter:drop-shadow( 2px 2px 10px black);">
    <div class="user-chat-area">${user.message}</div>
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" style="margin-left: 10px;"/>` : ""}
    </div>
`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHtml = `
            <div class="ai-chat-box">
                <img src="image copy.png" alt="AI" width="70">
                <div class="ai-chat-area">
                    <img src="image copy 2.png" alt="Loading" class="load" width="50px">
                </div>
            </div>
        `;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});
