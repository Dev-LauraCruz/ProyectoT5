from transformers import T5Tokenizer, T5ForConditionalGeneration
from diffusers import StableDiffusionPipeline
import torch
import spacy

# Cargar modelo de spaCy para encontrar entidades
nlp = spacy.load("en_core_web_sm")

# Cargar modelo y tokenizer por defecto
nombre_modelo = "t5-large"
tokenizer = T5Tokenizer.from_pretrained(nombre_modelo)
modelo = T5ForConditionalGeneration.from_pretrained(nombre_modelo)

print("¿Qué tarea quieres realizar?")
print("1.- Resumir")
print("2.- Traducir")
print("3.- Preguntar")
print("4.- Generar preguntas")
print("5.- Generar imagen")

eleccion = int(input("Elige una opción: "))
tipo_tarea = ""
texto = input("Ingresa el texto: ")

if eleccion == 1:
    tipo_tarea = "summarize: "
    texto = f"{tipo_tarea}{texto}"

elif eleccion == 2:
    tipo_tarea = "translate English to French: "
    texto = f"{tipo_tarea}{texto}"

elif eleccion == 3:
    contexto = input("Ingresa el contexto: ")
    tipo_tarea = "question: "
    texto = f"{tipo_tarea}{texto} context: {contexto}"

elif eleccion == 4:
    # Cambiar modelo a Valhalla para generar preguntas
    nombre_modelo = "valhalla/t5-small-e2e-qg"
    tokenizer = T5Tokenizer.from_pretrained(nombre_modelo)
    modelo = T5ForConditionalGeneration.from_pretrained(nombre_modelo)

    # Procesar el texto con spaCy para obtener entidades nombradas
    doc = nlp(texto)
    entidades = [ent.text for ent in doc.ents]

    if not entidades:
        print("⚠️ No se detectaron entidades automáticamente.")
        print("Generando una pregunta genérica...")
        entidades = [texto.split()[3]] if len(texto.split()) > 3 else [texto]

    print("\n======== RESULTADO ========")

    for entidad in entidades:
        texto_hl = texto.replace(entidad, f"<hl>{entidad}<hl>", 1)
        entrada = f"generate question: {texto_hl}"

        vectores_entrada = tokenizer(entrada, return_tensors="pt", truncation=True).input_ids

        vectores_salida = modelo.generate(
            vectores_entrada,
            max_length=128,
            num_beams=5,
            num_return_sequences=1,
            early_stopping=True
        )

        pregunta = tokenizer.decode(vectores_salida[0], skip_special_tokens=True)
        print(f"- {pregunta}")

    print("")
    exit()

elif eleccion == 5:
    print("\nGenerando imagen... Esto puede tomar unos minutos...")

    # Cargar el pipeline con float32 para CPU
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float32  # importante: usar float32 en CPU
    )

    pipe = pipe.to("cpu")

    # Desactivar seguridad para evitar errores si el modelo la tiene
    if pipe.safety_checker is not None:
        pipe.safety_checker = lambda images, **kwargs: (images, [False] * len(images))

    # Generar imagen
    image = pipe(texto).images[0]
    image.save("imagen_generada.png")

    print("\n======== RESULTADO ========")
    print("Imagen guardada como 'imagen_generada.png'")
    exit()

# Tokenizar entrada para otras tareas
vectores_entrada = tokenizer(texto, return_tensors="pt").input_ids
vectores_salida = modelo.generate(vectores_entrada, max_length=512)
texto_salida = tokenizer.decode(vectores_salida[0], skip_special_tokens=True)

print("\n======== RESULTADO ========")
print(texto_salida)
print("")
