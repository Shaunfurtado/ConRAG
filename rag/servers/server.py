# embed_server.py
from flask import Flask, request, jsonify, Response
from sentence_transformers import SentenceTransformer
from meta_ai_api import MetaAI

app = Flask(__name__)
ai = MetaAI()

# Load the embedding model
embedding_model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({"error": "Text is required"}), 400

    # Generate embedding
    embedding = embedding_model.encode(text).tolist()
    return jsonify(embedding)

@app.route('/metaai', methods=['POST'])
def prompt_meta_ai():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    
    def generate_response():
        # Call Meta AI API with the given prompt and stream the response
        response = ai.prompt(message=prompt, stream=True)
        
        # For each streamed chunk, yield the data in the desired format
        for r in response:
            yield jsonify({
                'response': r['message'],
                'sources': r.get('sources', [])
            })

    # Return the Response object with the stream
    return Response(generate_response(), content_type='application/json; charset=utf-8')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
