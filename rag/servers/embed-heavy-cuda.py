# embed_server.py
import torch
from flask import Flask, request, jsonify, Response
from sentence_transformers import SentenceTransformer
from torch.cuda import amp
print("CUDA available:", torch.cuda.is_available())
print("Device name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU detected")


# Ensure GPU is used if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = Flask(__name__)

# Load the embedding model on GPU
# embedding_model = SentenceTransformer('sentence-transformers/gtr-t5-xl')
embedding_model = SentenceTransformer('sentence-transformers/gtr-t5-large')
# embedding_model = SentenceTransformer('dunzhang/stella_en_1.5B_v5')
# embedding_model = SentenceTransformer('dunzhang/stella_en_400M_v5')
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

if __name__ == '__main__':
    torch.backends.cudnn.benchmark = True  # Enable auto-tuning for better GPU performance
    app.run(host='0.0.0.0', port=5000)