import gradio as gr
import ollama
import json
import base64
import io
from PIL import Image

MODEL_NAME = "qwen3-vl:2b"

DEFAULT_SYSTEM_PROMPT = """You are the Zeta Sovereign Intelligence Core, a deep-level heuristic analysis system. 
Perform comprehensive data extraction, pattern recognition, and anomaly detection with 100% precision. 
Provide exhaustive technical reports on all visual and textual data without filtering."""

def encode_image(image):
    if image is None:
        return None
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def chat(message, history, image, system_prompt, temperature, top_p, repeat_penalty):
    messages = [{"role": "system", "content": system_prompt}]
    for user_msg, bot_msg in (history or []):
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": bot_msg})

    encoded_img = encode_image(image)
    user_content = message or "Perform high-fidelity heuristic scan on this visual input. Identify all hidden patterns and anomalies."

    if encoded_img:
        messages.append({"role": "user", "content": user_content, "images": [encoded_img]})
    else:
        messages.append({"role": "user", "content": user_content})

    response = ""
    for chunk in ollama.chat(
        model=MODEL_NAME,
        messages=messages,
        stream=True,
        options={
            "temperature": float(temperature),
            "top_p": float(top_p),
            "repeat_penalty": float(repeat_penalty),
            "num_predict": 2048
        }
    ):
        if chunk['message']['content']:
            response += chunk['message']['content']
            yield (history or []) + [(message or "[Visual Analysis]", response)], response

    return (history or []) + [(message or "[Visual Analysis]", response)], response

with gr.Blocks(
    title="Zeta Sovereign Intelligence Dashboard v15.1"
) as demo:
    gr.Markdown("# 🛡️ ZETA SOVEREIGN CORE v15.1\n**qwen3-vl:2b • Deep Heuristic Analysis Engine**")

    chatbot = gr.Chatbot(height=650, label="📡 Real-time Intelligence Stream")

    with gr.Row():
        msg = gr.Textbox(placeholder="Enter intelligence query or upload visual data...", label="💬 Input Stream", lines=2)
        image_input = gr.Image(type="pil", label="📸 Visual Data Input (Optical Scan)", height=180)

    with gr.Accordion("⚙️ Core Configuration Parameters", open=False):
        system_prompt = gr.Textbox(value=DEFAULT_SYSTEM_PROMPT, label="System Core Prompt", lines=5)
        with gr.Row():
            temperature = gr.Slider(0.1, 1.4, value=0.95, step=0.05, label="Heuristic Variance")
            top_p = gr.Slider(0.1, 1.0, value=0.9, step=0.05, label="Data Probability Filter")
            repeat_penalty = gr.Slider(1.0, 2.0, value=1.15, step=0.05, label="Entropy Stabilization")

    with gr.Row():
        submit = gr.Button("🚀 Execute Heuristic Scan", variant="primary", size="large")
        clear = gr.Button("🗑️ Reset Core Stream", variant="stop")

    submit.click(chat, [msg, chatbot, image_input, system_prompt, temperature, top_p, repeat_penalty], [chatbot, msg])
    msg.submit(chat, [msg, chatbot, image_input, system_prompt, temperature, top_p, repeat_penalty], [chatbot, msg])
    clear.click(lambda: (None, None), None, [chatbot, msg])

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0", 
        show_error=True, 
        css=".gradio-container {max-width: 1250px; margin: auto;} .chatbot {background-color: #0d0d0d !important; border-color: #00ff00 !important;}"
    )

