# embed_server.py
import torch
from flask import Flask, request, jsonify, Response
from sentence_transformers import SentenceTransformer
from meta_ai_api import MetaAI
from torch.cuda import amp
print("CUDA available:", torch.cuda.is_available())
print("Device name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU detected")


# Ensure GPU is used if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = Flask(__name__)
ai = MetaAI()

# Load the embedding model on GPU
embedding_model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
embedding_model = embedding_model.to(device)

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    texts = data.get('text')
    if not texts:
        return jsonify({"error": "Text is required"}), 400

    # Ensure input is in batch format for better performance
    if isinstance(texts, str):
        texts = [texts]

    # Use autocast for mixed-precision on GPU
    with amp.autocast(), torch.no_grad():
        embeddings = embedding_model.encode(
            texts, 
            batch_size=32,  # Process texts in batches
            device=device, 
            convert_to_tensor=True  # Keep embeddings as tensors
        )
    
    # Convert tensors to lists for JSON serialization
    embeddings = embeddings.cpu().numpy().tolist()
    return jsonify(embeddings)

@app.route('/metaai', methods=['POST'])
def prompt_meta_ai():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    
    # Call Meta AI API with the given prompt
    response = ai.prompt(message=prompt)
    return jsonify({'response': response['message'], 'sources': response.get('sources', [])})

if __name__ == '__main__':
    torch.backends.cudnn.benchmark = True  # Enable auto-tuning for better GPU performance
    app.run(host='0.0.0.0', port=5000)