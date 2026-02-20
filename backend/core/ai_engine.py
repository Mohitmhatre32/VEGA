import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image, ImageDraw
import io
import os

# ==========================================
# 1. SETUP & STATE MANAGEMENT
# ==========================================
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CORE_DIR, 'isro_model.pth')

_model = None
_class_names = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- FIXED: Explicit Mean and Std values added ---
_preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

COLORS = {
    'Urban Area': (255, 0, 0, 100),         # Red
    'Agricultural Land': (255, 255, 0, 100), # Yellow
    'Forest': (0, 255, 0, 100),             # Green
    'Water Body': (0, 0, 255, 100),         # Blue
    'Barren Land': (128, 128, 128, 100)     # Grey
}

# ==========================================
# 2. INTERNAL MODEL LOADER
# ==========================================
def _load_model_if_needed():
    global _model, _class_names
    if _model is not None:
        return

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    print("🧠 Loading ISRO classification model into memory...")
    checkpoint = torch.load(MODEL_PATH, map_location=_device)
    
    # --- FIXED: Correct Dictionary Access ---
    _class_names = checkpoint['class_names']

    _model = models.resnet50()
    _model.fc = nn.Linear(_model.fc.in_features, len(_class_names))
    
    # --- FIXED: Correct State Dict Access ---
    _model.load_state_dict(checkpoint['model_state_dict'])
    
    _model.to(_device)
    _model.eval()
    print("✅ Model ready.")

# ==========================================
# 3. PUBLIC API FOR BACKEND TEAM
# ==========================================
def predict_patch(image_input):
    """
    Predicts a single satellite patch.
    Accepts either a file path or raw image bytes.
    """
    _load_model_if_needed()

    if isinstance(image_input, str):
        img = Image.open(image_input).convert('RGB')
    else:
        img = Image.open(io.BytesIO(image_input)).convert('RGB')

    input_tensor = _preprocess(img).unsqueeze(0).to(_device)

    # Predict
    with torch.no_grad():
        output = _model(input_tensor)
        probabilities = torch.nn.functional.softmax(output, dim=1)
        # Get top prediction (dim=1 for class dimension)
        confidence, predicted_idx = torch.max(probabilities, 1)

    predicted_label = _class_names[predicted_idx.item()]
    
    # Get all probabilities
    probs_list = probabilities[0].tolist()
    class_probs = {name: round(prob * 100, 2) for name, prob in zip(_class_names, probs_list)}

    return {
        "class": predicted_label,
        "confidence": round(confidence.item() * 100, 2),
        "probabilities": class_probs
    }

# def generate_heatmap(input_image_path, output_image_path, patch_size=32):
#     """
#     High-Resolution Heatmap Generator.
#     - Saves individual patches for verification.
#     - Generates a colored overlay.
#     """
#     _load_model_if_needed()
    
#     # 1. Setup Directories for the individual patches
#     patch_folder = os.path.join(os.path.dirname(output_image_path), 'patches')
#     os.makedirs(patch_folder, exist_ok=True)

#     img = Image.open(input_image_path).convert("RGB")
#     width, height = img.size
    
#     # Create the transparent colored layer
#     overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
#     draw = ImageDraw.Draw(overlay)

#     print(f"🗺️ Mapping: {width}x{height} pixels.")
#     print(f"📁 Saving individual patches to: {patch_folder}")

#     patch_count = 0
#     # Loop through the image
#     for y in range(0, height, patch_size):
#         for x in range(0, width, patch_size):
#             # Define the square
#             box = (x, y, x + patch_size, y + patch_size)
#             patch = img.crop(box)
            
#             # Prepare for AI (Resize to 224 for the ResNet model)
#             input_tensor = _preprocess(patch).unsqueeze(0).to(_device)
            
#             # Predict
#             with torch.no_grad():
#                 output = _model(input_tensor)
#                 _, predicted_idx = torch.max(output, 1)
#                 label = _class_names[predicted_idx.item()]
            
#             # --- YOUR REQUEST: Save individual patch ---
#             # Format: <terrain_type>_<count>.png
#             clean_label = label.replace(" ", "_")
#             patch_filename = f"{clean_label}_patch_{patch_count}.png"
#             patch.save(os.path.join(patch_folder, patch_filename))
#             patch_count += 1

#             # --- YOUR REQUEST: Custom Color Mapping ---
#             color = get_terrain_color(label)
#             draw.rectangle(box, fill=color)

#     # Blend and Save
#     combined = Image.alpha_composite(img.convert("RGBA"), overlay)
#     combined.save(output_image_path)
#     print(f"✅ Full Heatmap saved to: {output_image_path}")
#     return output_image_path

# def get_terrain_color(terrain_type):
#     """
#     EDIT THIS FUNCTION to change the color scheme!
#     Format: (Red, Green, Blue, Alpha/Transparency)
#     Alpha: 0 is invisible, 255 is solid.
#     """
#     mapping = {
#         'Urban Area':         (231, 76, 60, 120),   # Bright Red
#         'Agricultural Land':  (241, 196, 15, 120),  # Yellow
#         'Forest':             (39, 174, 96, 120),   # Deep Green
#         'Water Body':         (41, 128, 185, 120),  # Ocean Blue
#         'Barren Land':        (149, 165, 166, 120)  # Concrete Grey
#     }
#     # Return color or Transparent if not found
#     return mapping.get(terrain_type, (0, 0, 0, 0))

import json

def get_image_analysis_data(input_image_path, patch_size=64):
    """
    ANALYSIS ENGINE: Returns JSON data for the Frontend Dev.
    Does NOT draw colors. Just analyzes.
    """
    _load_model_if_needed()
    
    img = Image.open(input_image_path).convert("RGB")
    width, height = img.size
    
    analysis_results = {
        "image_width": width,
        "image_height": height,
        "patch_size": patch_size,
        "grid": []
    }

    print(f"📡 Analyzing Image: {width}x{height}...")

    # Loop through the image in a grid
    for y in range(0, height, patch_size):
        for x in range(0, width, patch_size):
            # 1. Capture the square
            box = (x, y, x + patch_size, y + patch_size)
            patch = img.crop(box)
            
            # 2. AI Pre-processing (Scale fix)
            # We force it to 224x224 so the ResNet sees it at the 'Correct' scale
            input_tensor = _preprocess(patch).unsqueeze(0).to(_device)
            
            # 3. Inference
            with torch.no_grad():
                output = _model(input_tensor)
                probabilities = torch.nn.functional.softmax(output, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)
                label = _class_names[predicted_idx.item()]
            
            # 4. Add to the Data Map
            analysis_results["grid"].append({
                "x": x,
                "y": y,
                "class": label,
                "confidence": round(confidence.item() * 100, 2)
            })

    print(f"✅ Analysis Complete. {len(analysis_results['grid'])} patches processed.")
    return analysis_results