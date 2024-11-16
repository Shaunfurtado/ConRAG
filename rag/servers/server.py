# embed_server.py
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from meta_ai_api import MetaAI

app = Flask(__name__)
ai = MetaAI()

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

# Meta AI API
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
    app.run(host='0.0.0.0', port=5000)
