import io
import os
import sys
import base64
import tempfile
from PIL import Image, ImageEnhance
from app.core.config import settings

# Path setup to find 'core'
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(current_dir, "../../../"))
if backend_root not in sys.path:
    sys.path.append(backend_root)

from core import ai_engine

class ClassificationService:
    @staticmethod
    def predict_single(image_bytes: bytes) -> dict:
        """Strictly follows predict_patch logic"""
        return ai_engine.predict_patch(image_bytes)

    @staticmethod
    def analyze_full_map(image_bytes: bytes, patch_size: int) -> dict:
        """Strictly follows get_image_analysis_data logic"""
        # Engine expects a file path for the full analysis loop
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        try:
            result = ai_engine.get_image_analysis_data(tmp_path, patch_size=patch_size)
            return result
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    @staticmethod
    def process_batch(predictions: list) -> dict:
        total = len(predictions)
        counts = {}
        for pred in predictions:
            lbl = pred.get('class', 'Unknown') # ai_engine returns 'class', not 'label'
            counts[lbl] = counts.get(lbl, 0) + 1
        return {"total_processed": total, "distribution": counts}

    @staticmethod
    def calculate_change_detection(img1_bytes: bytes, img2_bytes: bytes) -> dict:
        res1 = ai_engine.predict_patch(img1_bytes)
        res2 = ai_engine.predict_patch(img2_bytes)
        
        # Simple area calculation based on probabilities
        stats = []
        classes = res1["probabilities"].keys()
        
        for cls in classes:
            pct1 = res1["probabilities"].get(cls, 0)
            pct2 = res2["probabilities"].get(cls, 0)
            
            # 1 pixel = ~100m2 logic scaled up
            area1 = round((pct1/100) * settings.AREA_SCALE_FACTOR * 100, 2)
            area2 = round((pct2/100) * settings.AREA_SCALE_FACTOR * 100, 2)
            
            diff = area2 - area1
            trend = "increasing" if diff > 0 else "decreasing"
            if diff == 0: trend = "stable"
            
            stats.append({
                "class": cls,
                "year1_area_km2": area1,
                "year2_area_km2": area2,
                "change_pct": f"{diff:+.1f} km²",
                "trend": trend
            })
            
        return {
            "year1_prediction": res1["class"],
            "year2_prediction": res2["class"],
            "area_stats": stats
        }

    @staticmethod
    def generate_augmentations(image_bytes: bytes) -> dict:
        try:
            original = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            original.thumbnail((300, 300))
            results = {}
            results['rotated'] = ClassificationService._img_to_base64(original.rotate(90))
            results['flipped'] = ClassificationService._img_to_base64(original.transpose(Image.FLIP_LEFT_RIGHT))
            results['brightness'] = ClassificationService._img_to_base64(ImageEnhance.Brightness(original).enhance(1.5))
            return results
        except Exception:
            return {}

    @staticmethod
    def _img_to_base64(img: Image.Image) -> str:
        buffered = io.BytesIO()
        img.save(buffered, format="PNG") 
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    @staticmethod
    def get_model_leaderboard() -> list:
        return [
            {"model": "EfficientNet-B0", "accuracy": "93.4%", "precision": "0.91", "recall": "0.94", "f1": "0.92"},
            {"model": "ResNet50", "accuracy": "91.2%", "precision": "0.89", "recall": "0.90", "f1": "0.89"},
            {"model": "MobileNetV2", "accuracy": "88.7%", "precision": "0.86", "recall": "0.85", "f1": "0.85"},
            {"model": "VGG16", "accuracy": "86.1%", "precision": "0.84", "recall": "0.82", "f1": "0.83"},
        ]