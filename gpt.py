from flask import Flask, request, jsonify, render_template, send_from_directory
from transformers import T5Tokenizer, T5ForConditionalGeneration
from diffusers import StableDiffusionPipeline
import torch
import spacy
import os
import base64
from io import BytesIO

app = Flask(__name__, 
            static_folder='.', 
            template_folder='HTML')

# Inicialización y carga de modelos
print("Inicializando modelos...")

# Cargar modelo de spaCy para encontrar entidades
nlp = spacy.load("en_core_web_sm")

# Cargar modelo T5 por defecto para tareas básicas
default_model_name = "t5-large"
default_tokenizer = T5Tokenizer.from_pretrained(default_model_name)
default_model = T5ForConditionalGeneration.from_pretrained(default_model_name)

# Cargar modelo para generación de preguntas
qg_model_name = "valhalla/t5-small-e2e-qg"
qg_tokenizer = T5Tokenizer.from_pretrained(qg_model_name)
qg_model = T5ForConditionalGeneration.from_pretrained(qg_model_name)

# Inicializar Stable Diffusion (lo cargaremos bajo demanda para ahorrar memoria)
sd_model_loaded = False
sd_pipe = None

def load_sd_model():
    global sd_pipe, sd_model_loaded
    if not sd_model_loaded:
        print("Cargando modelo Stable Diffusion...")
        sd_pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float32
        )
        sd_pipe = sd_pipe.to("cpu")
        
        # Desactivar seguridad para evitar errores
        if sd_pipe.safety_checker is not None:
            sd_pipe.safety_checker = lambda images, **kwargs: (images, [False] * len(images))
            
        sd_model_loaded = True
    return sd_pipe

# Rutas para archivos estáticos
@app.route('/CSS/<path:path>')
def send_css(path):
    return send_from_directory('CSS', path)

@app.route('/JS/<path:path>')
def send_js(path):
    return send_from_directory('JS', path)

@app.route('/IMG/<path:path>')
def send_img(path):
    return send_from_directory('IMG', path)

# Rutas para páginas HTML
@app.route('/')
def index():
    return render_template('inicio.html')

@app.route('/pagina2')
def pagina2():
    return render_template('Pagina2.html')

@app.route('/resumen')
def resumen_page():
    return render_template('resumen.html')

@app.route('/traduccion')
def traduccion_page():
    return render_template('traduccion.html')

@app.route('/pregunta')
def pregunta_page():
    return render_template('pregunta.html')

@app.route('/generar-preguntas')
def generar_preguntas_page():
    return render_template('generar-preguntas.html')

@app.route('/generar-imagenes')
def generar_imagenes_page():
    return render_template('generar-imagenes.html')

# API endpoints
@app.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No se proporcionó texto para resumir"}), 400
    
    input_text = f"summarize: {text}"
    input_ids = default_tokenizer(input_text, return_tensors="pt").input_ids
    output_ids = default_model.generate(input_ids, max_length=512)
    summary = default_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    
    return jsonify({"summary": summary})

@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    source_lang = data.get('source_lang', 'English')
    target_lang = data.get('target_lang', 'French')
    
    if not text:
        return jsonify({"error": "No se proporcionó texto para traducir"}), 400
    
    input_text = f"translate {source_lang} to {target_lang}: {text}"
    input_ids = default_tokenizer(input_text, return_tensors="pt").input_ids
    output_ids = default_model.generate(input_ids, max_length=512)
    translation = default_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    
    return jsonify({"translation": translation})

@app.route('/api/question', methods=['POST'])
def question():
    data = request.get_json()
    question_text = data.get('question', '')
    context = data.get('context', '')
    
    if not question_text or not context:
        return jsonify({"error": "Falta la pregunta o el contexto"}), 400
    
    input_text = f"question: {question_text} context: {context}"
    input_ids = default_tokenizer(input_text, return_tensors="pt").input_ids
    output_ids = default_model.generate(input_ids, max_length=512)
    answer = default_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    
    return jsonify({"answer": answer})

@app.route('/api/generate_questions', methods=['POST'])
def generate_questions():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No se proporcionó texto para generar preguntas"}), 400
    
    # Procesar el texto con spaCy para obtener entidades nombradas
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents]
    
    # Si no hay entidades, usar una estrategia alternativa
    if not entities:
        entities = [text.split()[3]] if len(text.split()) > 3 else [text]
    
    questions = []
    
    for entity in entities:
        text_hl = text.replace(entity, f"<hl>{entity}<hl>", 1)
        input_text = f"generate question: {text_hl}"
        
        input_ids = qg_tokenizer(input_text, return_tensors="pt", truncation=True).input_ids
        output_ids = qg_model.generate(
            input_ids,
            max_length=128,
            num_beams=5,
            num_return_sequences=1,
            early_stopping=True
        )
        
        question = qg_tokenizer.decode(output_ids[0], skip_special_tokens=True)
        questions.append(question)
    
    return jsonify({"questions": questions})

@app.route('/api/generate_image', methods=['POST'])
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({"error": "No se proporcionó prompt para generar imagen"}), 400
    
    try:
        # Cargar el modelo si aún no se ha cargado
        pipe = load_sd_model()
        
        # Generar imagen
        image = pipe(prompt).images[0]
        
        # Guardar imagen en la carpeta IMG si existe
        img_path = None
        if os.path.exists('IMG'):
            img_filename = f"generated_{hash(prompt) % 10000}.png"
            img_path = os.path.join('IMG', img_filename)
            image.save(img_path)
            img_url = f"/IMG/{img_filename}"
        
        # Convertir imagen a base64 para enviarla al frontend
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        result = {
            "image": f"data:image/png;base64,{img_str}",
            "prompt": prompt
        }
        
        if img_path:
            result["image_url"] = img_url
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Error al generar imagen: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
