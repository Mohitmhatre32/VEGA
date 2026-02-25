# import torch
# import torch.nn as nn
# from torchvision import models, transforms
# from PIL import Image
# import io
# import os
# import numpy as np # Added for pixel math
# from threading import Semaphore

# # ==========================================
# # 1. SETUP & STATE MANAGEMENT
# # ==========================================
# CORE_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_PATH = os.path.join(CORE_DIR, 'isro_model.pth')

# _model = None
# _class_names = None
# _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # --- STRICT V1 PREPROCESSING ---
# _preprocess = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
# ])

# MAX_PARALLEL_IMAGES = 2
# gpu_semaphore = Semaphore(MAX_PARALLEL_IMAGES)

# # ==========================================
# # 2. INTERNAL MODEL LOADER
# # ==========================================
# def _load_model_if_needed():
#     global _model, _class_names
#     if _model is not None:
#         return

#     if not os.path.exists(MODEL_PATH):
#         raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

#     print("🧠 Loading ISRO classification model...")
#     checkpoint = torch.load(MODEL_PATH, map_location=_device)
    
#     _class_names = checkpoint['class_names']
    
#     _model = models.resnet50()
#     _model.fc = nn.Linear(_model.fc.in_features, len(_class_names))
#     _model.load_state_dict(checkpoint['model_state_dict'])
    
#     _model.to(_device)
#     _model.eval()
#     print("✅ Model ready.")

# # ==========================================
# # 3. SPECTRAL SHADOW FILTER (THE LOGIC FIX)
# # ==========================================
# def _apply_shadow_correction(img, ai_label):
#     """
#     Checks if a patch is actually Shadow or Water based on color physics.
#     """
#     # Convert PIL to Numpy to check pixels
#     arr = np.array(img)
    
#     # Calculate average brightness and color channels
#     r_mean = np.mean(arr[:,:,0])
#     b_mean = np.mean(arr[:,:,2])
#     brightness = np.mean(arr)

#     # THRESHOLD: How dark is "Too Dark"? (Adjustable: 30-40 is usually good)
#     DARK_THRESHOLD = 35 

#     # CASE 1: The patch is pitch black (Darker than threshold)
#     if brightness < DARK_THRESHOLD:
#         # Check: Is it Water? (Water reflects Blue)
#         # If Blue is significantly higher than Red (e.g., +10), it's likely Water.
#         if b_mean > (r_mean + 10):
#             return "Water Body"
#         else:
#             # If it's dark and neutral (no specific color), it's a Shadow.
#             return "Shadow"

#     # CASE 2: The AI said "Water Body", but the image is actually very bright
#     # (Prevents white roofs/sand being called water)
#     if ai_label == "Water Body" and brightness > 180:
#         return "Barren Land"

#     # If no manual override needed, return the AI's original guess
#     return ai_label

# # ==========================================
# # 4. PREDICTION LOGIC
# # ==========================================
# def _predict_single_patch_logic(img):
#     _load_model_if_needed()

#     # 1. AI Inference
#     input_tensor = _preprocess(img).unsqueeze(0).to(_device)

#     with torch.no_grad():
#         output = _model(input_tensor)
#         probabilities = torch.nn.functional.softmax(output, dim=1)
#         confidence, predicted_idx = torch.max(probabilities, 1)
#         ai_label = _class_names[predicted_idx.item()]

#     # 2. Apply Shadow/Physics Filter
#     final_label = _apply_shadow_correction(img, ai_label)

#     return {
#         "class": final_label,
#         "confidence": round(confidence.item() * 100, 2)
#     }

# # ==========================================
# # 5. PUBLIC API
# # ==========================================
# def predict_patch(image_input):
#     try:
#         if isinstance(image_input, str):
#             img = Image.open(image_input).convert('RGB')
#         else:
#             img = Image.open(io.BytesIO(image_input)).convert('RGB')
#     except Exception as e:
#         return {"error": str(e)}

#     return _predict_single_patch_logic(img)

# def get_image_analysis_data(input_image_path, patch_size=32):
#     with gpu_semaphore:
#         img = Image.open(input_image_path).convert("RGB")
#         width, height = img.size
        
#         results = {
#             "image_width": width,
#             "image_height": height,
#             "patch_size": patch_size,
#             "grid": []
#         }

#         print(f"📡 Analyzing Map: {width}x{height} with Shadow Detection...")

#         for y in range(0, height, patch_size):
#             for x in range(0, width, patch_size):
#                 box = (x, y, x + patch_size, y + patch_size)
#                 patch = img.crop(box)
                
#                 # Predict with filter
#                 result = _predict_single_patch_logic(patch)
                
#                 results['grid'].append({
#                     "x": x, "y": y,
#                     "class": result['class'],
#                     "confidence": result['confidence']
#                 })

#         return results

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import io
import os
from threading import Semaphore

# ==========================================
# 1. SETUP & STATE MANAGEMENT
# ==========================================
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CORE_DIR, 'isro_model.pth')

_model = None
_class_names = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- V1 LOGIC: SQUASH RESIZE (Crucial for your model's accuracy) ---
_preprocess = transforms.Compose([
    transforms.Resize((224, 224)), 
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

MAX_PARALLEL_IMAGES = 2
gpu_semaphore = Semaphore(MAX_PARALLEL_IMAGES)

# ==========================================
# 2. INTERNAL MODEL LOADER
# ==========================================
def _load_model_if_needed():
    global _model, _class_names
    if _model is not None:
        return

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    print("🧠 Loading ISRO classification model...")
    checkpoint = torch.load(MODEL_PATH, map_location=_device)
    
    _class_names = checkpoint['class_names']
    
    _model = models.resnet50()
    _model.fc = nn.Linear(_model.fc.in_features, len(_class_names))
    _model.load_state_dict(checkpoint['model_state_dict'])
    
    _model.to(_device)
    _model.eval()
    print(f"✅ Model ready. Classes: {_class_names}")

# ==========================================
# 3. SPECTRAL CORRECTION (The Fix for Shadows/Water)
# ==========================================
def _apply_spectral_correction(img_pil, ai_label, ai_probs):
    """
    Refines the AI's opinion using pixel physics.
    """
    # Convert to Numpy for pixel math
    arr = np.array(img_pil)
    
    r_mean = np.mean(arr[:,:,0])
    g_mean = np.mean(arr[:,:,1])
    b_mean = np.mean(arr[:,:,2])
    brightness = np.mean(arr)

    # RULE 1: PITCH BLACK = SHADOW
    # AI often thinks black pixels are Water or Forest. We correct this.
    if brightness < 35: 
        if "Shadow" not in ai_probs:
            # Add Shadow to the probability list artificially
            ai_probs["Shadow"] = 100.0
            # Zero out others
            for k in ai_probs:
                if k != "Shadow": ai_probs[k] = 0.0
        return "Shadow", 99.9, ai_probs

    # RULE 2: VEGETATION CHECK
    # If AI says Water, but it's Green... it's Forest/Agri.
    if ai_label == "Water Body":
        if (g_mean > b_mean + 5) and (g_mean > r_mean + 5):
            # Correction: It's likely Forest
            ai_probs["Forest"] = ai_probs.pop("Water Body")
            return "Forest", ai_probs["Forest"], ai_probs

    # RULE 3: WATER CHECK
    # If AI says Forest, but it's Blue... it's Water.
    if ai_label == "Forest" or ai_label == "Agricultural Land":
        if (b_mean > g_mean + 10) and (b_mean > r_mean):
            ai_probs["Water Body"] = ai_probs.get(ai_label, 0)
            ai_probs[ai_label] = 0.0
            return "Water Body", ai_probs["Water Body"], ai_probs

    return ai_label, ai_probs[ai_label], ai_probs

# ==========================================
# 4. INFERENCE ENGINE (Single Patch)
# ==========================================
def _predict_single_patch_logic(img):
    """
    Core logic: Preprocess -> Model -> Correction
    """
    _load_model_if_needed()

    # 1. AI Prediction
    input_tensor = _preprocess(img).unsqueeze(0).to(_device)

    with torch.no_grad():
        output = _model(input_tensor)
        probs_tensor = torch.nn.functional.softmax(output, dim=1)
        
        # Flatten probs for dictionary
        probs_list = probs_tensor[0].tolist()
        prob_dict = {name: round(p * 100, 2) for name, p in zip(_class_names, probs_list)}
        
        # Get preliminary top label
        top_prob, top_idx = torch.max(probs_tensor, 1)
        raw_label = _class_names[top_idx.item()]

    # 2. Spectral Correction
    final_label, final_conf, final_probs = _apply_spectral_correction(img, raw_label, prob_dict)

    return {
        "class": final_label,
        "confidence": round(float(final_conf), 2),
        "probabilities": final_probs
    }

# ==========================================
# 5. PUBLIC API
# ==========================================

def predict_patch(image_input):
    """
    Called by backend for single image upload.
    """
    try:
        if isinstance(image_input, str):
            img = Image.open(image_input).convert('RGB')
        else:
            # Assume bytes/stream
            image_input.seek(0)
            img = Image.open(image_input).convert('RGB')
    except Exception as e:
        return {"error": str(e)}

    return _predict_single_patch_logic(img)

def get_image_analysis_data(input_image_path, patch_size=32):
    """
    Called by backend for Full Map Analysis.
    patch_size=32 gives much higher resolution than 64.
    """
    with gpu_semaphore:
        img = Image.open(input_image_path).convert("RGB")
        width, height = img.size
        
        results = {
            "image_width": width,
            "image_height": height,
            "patch_size": patch_size,
            "grid": []
        }

        print(f"📡 Mapping {width}x{height} image with patch size {patch_size}...")

        # Loop grid
        for y in range(0, height, patch_size):
            for x in range(0, width, patch_size):
                # Crop
                box = (x, y, x + patch_size, y + patch_size)
                patch = img.crop(box)
                
                # Predict
                result = _predict_single_patch_logic(patch)
                
                # Store simple result for map (save bandwidth)
                results['grid'].append({
                    "x": x, "y": y,
                    "class": result['class'],
                    "confidence": result['confidence']
                })

        return results