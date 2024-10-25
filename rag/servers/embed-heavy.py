# embed_server.py
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# Load the model (gtr-t5-large)
model = SentenceTransformer('sentence-transformers/gtr-t5-large')

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data['text']
    embeddings = model.encode([text])[0].tolist()
    return jsonify(embeddings)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
