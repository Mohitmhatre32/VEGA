# ai_engine.py
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import numpy as np
import concurrent.futures
from threading import Semaphore
import warnings

warnings.filterwarnings("ignore")

# ==========================================
# 1. SETUP & STATE MANAGEMENT
# ==========================================
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CORE_DIR, 'isro_model.pth')

_model = None
_class_names = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

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

    print("🧠 Loading ISRO classification model into memory...")
    checkpoint = torch.load(MODEL_PATH, map_location=_device)
    
    _class_names = checkpoint.get("class_names")
    if _class_names is None:
        raise ValueError("Checkpoint missing 'class_names' key")

    # Create model with YOUR CURRENT architecture
    temp_model = models.resnet50()
    num_ftrs = temp_model.fc.in_features
    
    temp_model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 512),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(512, len(_class_names))
    )
    
    state_dict = checkpoint.get("model_state_dict")
    
    # ──── KEY FIX ────
    # Load only the parts that match → ignore fc mismatch
    model_dict = temp_model.state_dict()
    pretrained_dict = {k: v for k, v in state_dict.items() if k in model_dict and "fc" not in k}
    
    model_dict.update(pretrained_dict)
    temp_model.load_state_dict(model_dict, strict=False)   # strict=False is crucial here
    
    temp_model.to(_device)
    temp_model.eval()
    
    _model = temp_model
    print("✅ Model loaded (partial weights – backbone only). FC head initialized randomly.")

# def _load_model_if_needed():
#     global _model, _class_names
#     if _model is not None:
#         return

#     if not os.path.exists(MODEL_PATH):
#         raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

#     print("🧠 Loading ISRO classification model into memory...")
#     checkpoint = torch.load(MODEL_PATH, map_location=_device)
    
#     _class_names = checkpoint.get("class_names")
#     actual_weights = checkpoint.get("model_state_dict")

#     # Use a temporary model to prevent state corruption if it crashes
#     temp_model = models.resnet50()
#     num_ftrs = temp_model.fc.in_features
    
#     # --- FIXED: Restored exactly to your V3 Architecture! ---
#     temp_model.fc = nn.Sequential(
#         nn.Linear(num_ftrs, 512),
#         nn.ReLU(),
#         nn.Dropout(0.4),
#         nn.Linear(512, len(_class_names))
#     )
    
#     temp_model.load_state_dict(actual_weights)
#     temp_model.to(_device)
#     temp_model.eval()
    
#     # Safely assign to global only after successful load
#     _model = temp_model
#     print("✅ V3 Model ready & loaded successfully.")

# ==========================================
# 3. HELPER: RGB to HSV CONVERSION
# ==========================================
def rgb_to_hsv(arr):
    """
    Converts RGB numpy array to HSV. Returns mean H (degrees), S (%), V (%).
    """
    # Normalize to [0,1]
    arr = arr.astype(np.float32) / 255.0
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
    
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    maxc = np.max(arr, axis=-1)
    minc = np.min(arr, axis=-1)
    deltac = maxc - minc
    
    # Value
    v = maxc
    
    # Saturation
    s = np.zeros_like(maxc)
    mask = maxc != 0
    s[mask] = deltac[mask] / maxc[mask]
    
    # Hue
    h = np.zeros_like(maxc)
    mask_delta = deltac != 0
    
    # Red max
    mask_r = (maxc == r) & mask_delta
    h[mask_r] = ((g - b)[mask_r] / deltac[mask_r]) / 6.0
    
    # Green max
    mask_g = (maxc == g) & mask_delta
    h[mask_g] = (2.0 + (b - r)[mask_g] / deltac[mask_g]) / 6.0
    
    # Blue max
    mask_b = (maxc == b) & mask_delta
    h[mask_b] = (4.0 + (r - g)[mask_b] / deltac[mask_b]) / 6.0
    
    h = (h + 1) % 1.0  # Normalize to [0,1)
    h *= 360  # To degrees
    
    # Means
    mean_h = np.mean(h)
    mean_s = np.mean(s) * 100
    mean_v = np.mean(v) * 100
    
    return mean_h, mean_s, mean_v

# ==========================================
# 4. THE IMPROVED HEURISTIC FILTER (using HSV)
# ==========================================
def check_for_override(patch_img):
    """
    Improved heuristic using HSV to distinguish shadows, water, and forest accurately.
    Returns 'Shadow', 'Water', 'Forest', or None (let AI model decide).
    """
    arr = np.array(patch_img)
    
    # Get HSV means
    mean_h, mean_s, mean_v = rgb_to_hsv(arr)
    
    # Shadow: very low brightness or low brightness + low saturation (grayish)
    if mean_v < 20 or (mean_v < 60 and mean_s < 15):
        return "Shadow"
    
    # For other dark/medium patches: check if strongly colored
    if mean_s > 20:
        # Water: blue-cyan hues (180-300 degrees)
        if 180 < mean_h < 300:
            return "Water"
        
        # Forest/Agriculture: green hues (80-160 degrees)
        if 80 < mean_h < 160:
            return "Forest"
    
    # If not clearly shadow or colored, let the model decide
    return None

# ==========================================
# 5. PUBLIC API FOR BACKEND TEAM
# ==========================================
def analyze_single_image(image_path, patch_size=64):
    with gpu_semaphore:
        _load_model_if_needed()
        
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        
        analysis_results = []

        for y in range(0, height, patch_size):
            for x in range(0, width, patch_size):
                x_end = min(x + patch_size, width)
                y_end = min(y + patch_size, height)
                box = (x, y, x_end, y_end)
                patch = img.crop(box)
                
                # --- 1. HEURISTIC OVERRIDE ---
                override_class = check_for_override(patch)
                
                if override_class is not None:
                    analysis_results.append({
                        "x": x, "y": y, 
                        "class": override_class, 
                        "confidence": 100.0
                    })
                    continue 
                
                # --- 2. AI PREDICTION ---
                input_tensor = _preprocess(patch).unsqueeze(0).to(_device)
                with torch.no_grad():
                    output = _model(input_tensor)
                    probabilities = torch.nn.functional.softmax(output, dim=1)
                    confidence, predicted_idx = torch.max(probabilities, 1)
                    
                    label = _class_names[predicted_idx.item()]
                
                analysis_results.append({
                    "x": x, "y": y,
                    "class": label,
                    "confidence": round(confidence.item() * 100, 2)
                })

        return analysis_results

def get_image_analysis_data(input_image_path, patch_size=64):
    return analyze_single_image(input_image_path, patch_size)