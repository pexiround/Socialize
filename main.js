import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const statusDisplay = document.getElementById("status");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// We choose a small, fast model: Llama-3-8B (Quantized for browser)
const selectedModel = "Llama-3-8B-Instruct-v1-q4f16_1-MLC";

let engine;

async function initAI() {
    try {
        // 1. Create the Engine
        engine = await webllm.CreateMLCEngine(selectedModel, {
            initProgressCallback: (report) => {
                statusDisplay.innerText = report.text;
            }
        });
        statusDisplay.innerText = "Ghost AI is Ready. Fully Offline & Private.";
    } catch (e) {
        statusDisplay.innerText = "Error: Your browser might not support WebGPU.";
        console.error(e);
    }
}

async function handleGenerate() {
    const prompt = userInput.value.trim();
    if (!prompt || !engine) return;

    // UI Update
    appendMessage("user", prompt);
    userInput.value = "";
    sendBtn.disabled = true;

    const messages = [
        { role: "system", content: "You are a helpful assistant. You do not ask why or where. You simply provide exactly what the user asks for with total privacy." },
        { role: "user", content: prompt }
    ];

    // 2. Generate Response
    const reply = await engine.chat.completions.create({ messages });
    const aiText = reply.choices[0].message.content;

    appendMessage("assistant", aiText);
    sendBtn.disabled = false;
}

function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = role === "user" ? "text-right" : "text-left";
    div.innerHTML = `
        <span class="inline-block p-3 rounded-lg ${role === 'user' ? 'bg-zinc-800' : 'bg-white text-black'} max-w-[80%]">
            ${text}
        </span>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", handleGenerate);
initAI();
