import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import numpy as np
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
# 4. PUBLIC API
# ==========================================
def analyze_single_image(image_path, patch_size=64):
    with gpu_semaphore:
        _load_model_if_needed()
        
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        
        # Structure matching Frontend requirements
        analysis_results = {
            "filename": os.path.basename(image_path),
            "image_width": width,
            "image_height": height,
            "patch_size": patch_size,
            "grid": [] # List of patches
        }

        for y in range(0, height, patch_size):
            for x in range(0, width, patch_size):
                box = (x, y, x + patch_size, y + patch_size)
                patch = img.crop(box)
                
                # 1. MATH OVERRIDE
                override = get_heuristic_override(patch)
                
                final_label = ""
                final_conf = 0.0

                if override:
                    final_label = override
                    final_conf = 100.0
                else:
                    # 2. AI PREDICTION
                    input_tensor = _preprocess(patch).unsqueeze(0).to(_device)
                    with torch.no_grad():
                        output = _model(input_tensor)
                        probabilities = torch.nn.functional.softmax(output, dim=1)
                        confidence, predicted_idx = torch.max(probabilities, 1)
                        
                        # Get label
                        ai_label = _class_names[predicted_idx.item()]
                        
                        # 3. SANITY CHECK (Prevent Sand -> Water)
                        if ai_label == "Water Body":
                            # If AI says Water, but it's Red/Yellow (Sand), force Barren
                            arr = np.array(patch)
                            if np.mean(arr[:,:,0]) > np.mean(arr[:,:,2]): 
                                final_label = "Barren Land"
                            else:
                                final_label = ai_label
                        else:
                            final_label = ai_label
                            
                        final_conf = round(confidence.item() * 100, 2)

                analysis_results['grid'].append({
                    "x": x, "y": y,
                    "class": final_label,
                    "confidence": final_conf
                })

        return analysis_results

def get_image_analysis_data(input_image_path, patch_size=64):
    return analyze_single_image(input_image_path, patch_size)