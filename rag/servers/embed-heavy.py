from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# Load the embedding model
embedding_model = SentenceTransformer('sentence-transformers/gtr-t5-large')

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({"error": "Text is required"}), 400

    # Generate embedding
    embedding = embedding_model.encode(text).tolist()
    return jsonify(embedding)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
