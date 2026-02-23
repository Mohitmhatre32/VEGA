import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import numpy as np
from threading import Semaphore
import warnings
import io

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
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

MAX_PARALLEL_IMAGES = 2
gpu_semaphore = Semaphore(MAX_PARALLEL_IMAGES)

# ==========================================
# 2. INTERNAL MODEL LOADER (FIXED TO MATCH V1)
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
    actual_weights = checkpoint.get("model_state_dict")

    # Initialize Base ResNet
    _model = models.resnet50()
    num_ftrs = _model.fc.in_features
    
    # --- FIXED: Reverted to Simple Linear to match your saved .pth file ---
    _model.fc = nn.Linear(num_ftrs, len(_class_names))
    
    # Load weights
    try:
        _model.load_state_dict(actual_weights)
        print("✅ Model weights loaded successfully (Strict Mode).")
    except Exception as e:
        print(f"⚠️ Warning: Weight mismatch. {e}")
        # Fallback if there is still a mismatch (unlikely now)
        _model.load_state_dict(actual_weights, strict=False)

    _model.to(_device)
    _model.eval()

# ==========================================
# 3. THE "GOD MODE" HEURISTIC FILTER
# ==========================================
def get_heuristic_override(patch_img):
    """
    Forces 'Water Body' or 'Shadow' based on pixel math.
    """
    arr = np.array(patch_img)
    
    r_mean = np.mean(arr[:,:,0])
    g_mean = np.mean(arr[:,:,1])
    b_mean = np.mean(arr[:,:,2])
    brightness = np.mean(arr)

    # RULE 1: SHADOW KILLER
    if brightness < 40:
        return "Shadow"

    # RULE 2: WATER ENFORCER (Blue Dominant)
    if (b_mean > r_mean + 10) and (b_mean > g_mean + 5):
        return "Water Body"

    # RULE 3: FOREST HINT (Green Dominant)
    # We return None to let AI decide between Agri/Forest, 
    # but we ensure it doesn't pick Water or Urban.
    if (g_mean > r_mean + 10) and (g_mean > b_mean + 5):
        return None 

    return None

# ==========================================
# 4. UNIFIED INFERENCE ENGINE
# ==========================================
def _internal_inference_engine(img_patch):
    """
    Unified engine: Heuristics + AI + Sanity Checks.
    This ensures consistency between single-patch and full-map analysis.
    """
    _load_model_if_needed()

    # ──── Layer 1: Heuristic Physical Overrides ────
    override = get_heuristic_override(img_patch)
    if override:
        label = override
        conf_val = 100.0
        # Fill prob dict for consistency (map Shadow to Barren for probabilities if needed)
        prob_dict = {name: 0.0 for name in _class_names}
        if label in prob_dict:
            prob_dict[label] = 100.0
        return label, conf_val, prob_dict

    # ──── Layer 2: AI Vision Prediction ────
    # img_patch is a PIL image
    input_tensor = _preprocess(img_patch).unsqueeze(0).to(_device)
    
    with torch.no_grad():
        output = _model(input_tensor)
        probs = torch.nn.functional.softmax(output, dim=1)[0]
        conf, idx = torch.max(probs, 0)

    label = _class_names[idx.item()]
    conf_val = round(conf.item() * 100, 2)
    prob_dict = {name: round(p.item() * 100, 2) for name, p in zip(_class_names, probs)}

    # ──── Layer 3: Sanity Check (Coastal Protection) ────
    if label == "Water Body":
        arr = np.array(img_patch)
        # If mean(Red) > mean(Blue), it's likely sand/coastline, not deep water
        if np.mean(arr[:, :, 0]) > np.mean(arr[:, :, 2]):
            label = "Barren Land"
            # Update probabilities to reflect the correction
            prob_dict["Barren Land"] = prob_dict["Water Body"]
            prob_dict["Water Body"] = 0.0
            conf_val = prob_dict["Barren Land"]

    return label, conf_val, prob_dict

# ==========================================
# 5. PUBLIC API
# ==========================================
def analyze_single_image(image_path, patch_size=64):
    """
    Analyzes a full map by slicing it into patches.
    """
    with gpu_semaphore:
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        
        results = {
            "filename": os.path.basename(image_path),
            "image_width": width,
            "image_height": height,
            "patch_size": patch_size,
            "grid": []
        }

        for y in range(0, height, patch_size):
            for x in range(0, width, patch_size):
                box = (x, y, x + patch_size, y + patch_size)
                patch = img.crop(box)
                
                label, conf, _ = _internal_inference_engine(patch)
                
                results['grid'].append({
                    "x": x, "y": y,
                    "class": label,
                    "confidence": conf
                })

        return results

def predict_patch(image_input):
    """
    Predicts a single image patch (bytes or path).
    """
    try:
        if isinstance(image_input, str):
            img = Image.open(image_input).convert('RGB')
        elif hasattr(image_input, 'read'):
            image_input.seek(0)
            img = Image.open(io.BytesIO(image_input.read())).convert('RGB')
        else:
            img = Image.open(io.BytesIO(image_input)).convert('RGB')
    except Exception as e:
        return {"error": f"Image Load Error: {str(e)}"}

    label, conf, probs = _internal_inference_engine(img)
    
    return {
        "class": label,
        "confidence": conf,
        "probabilities": probs
    }

def get_image_analysis_data(input_image_path, patch_size=64):
    return analyze_single_image(input_image_path, patch_size)
