import io
import numpy as np
from PIL import Image
from app.core.config import settings
from PIL import Image, ImageEnhance
import os
import base64

class ClassificationService:
    @staticmethod
    def preprocess_image(image_bytes: bytes) -> np.ndarray:
        """
        Prepares the image for the ML model (Resize 224x224, Normalize).
        """
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_resized = img.resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE))
        img_array = np.array(img_resized).astype(np.float32) / 255.0
        
        # (C, H, W) format for PyTorch
        img_tensor = np.transpose(img_array, (2, 0, 1))
        return np.expand_dims(img_tensor, axis=0)

    @staticmethod
    def call_teammate_model(image_bytes: bytes) -> dict:
        """
        ### TEAMMATE INTEGRATION POINT ###
        Calls the actual ISRO model from backend/core/ai_engine.py
        """
        # 1. Save Input for Demo
        try:
            static_dir = os.path.join(os.getcwd(), "app/static")
            os.makedirs(static_dir, exist_ok=True)
            
            with open(os.path.join(static_dir, "latest_input.png"), "wb") as f:
                f.write(image_bytes)
        except Exception as e:
            print(f"Warning: Could not save demo input: {e}")

        # 2. Call Real Model
        # We need to import the core engine. 
        # Since uvicorn runs from 'backend/', 'app' is a package, and 'core' is a sibling folder.
        # We try to import it dynamically or assume python path is set root-wise.
        try:
            import sys
            # Ensure backend root is in path
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_root = os.path.abspath(os.path.join(current_dir, "../../../"))
            if backend_root not in sys.path:
                sys.path.append(backend_root)
                
            from core import ai_engine
            
            # Predict
            result = ai_engine.predict_patch(image_bytes)
            
            # 3. Save Output for Demo
            try:
                import json
                with open(os.path.join(static_dir, "latest_result.json"), "w") as f:
                    json.dump(result, f, indent=4)
            except Exception as e:
                print(f"Warning: Could not save demo output: {e}")
                
            return {
                "label": result["class"],
                "confidence": result["confidence"],
                "probabilities": result["probabilities"]
            }
            
        except ImportError:
            print("CRITICAL: Could not import backend.core.ai_engine. Falling back to MOCK.")
            # Fallback Mock (Copy of original)
            probs = np.random.dirichlet(np.ones(5), size=1)[0]
            class_idx = np.argmax(probs)
            return {
                "label": settings.CLASSES[class_idx],
                "confidence": round(float(probs[class_idx]) * 100, 2),
                "probabilities": {settings.CLASSES[i]: round(float(probs[i]) * 100, 2) for i in range(5)}
            }
    
    @staticmethod
    def process_batch(predictions: list) -> dict:
        """
        Aggregates multiple predictions into a batch statistical report.
        """
        total = len(predictions)
        counts = {cls: 0 for cls in settings.CLASSES}
        
        for pred in predictions:
            label = pred['label']
            if label in counts:
                counts[label] += 1
            
        return {
            "total_processed": total,
            "distribution": counts
        }

    @staticmethod
    def calculate_change_detection(img1_bytes: bytes, img2_bytes: bytes) -> dict:
        """
        Compares two images (Year 1 vs Year 2).
        Calculates % change and Area shift (km²).
        """
        # 1. Process both images (Pass bytes directly now)
        result1 = ClassificationService.call_teammate_model(img1_bytes)
        result2 = ClassificationService.call_teammate_model(img2_bytes)

        # 2. Area Calculation based on probabilities
        stats = []
        
        for cls in settings.CLASSES:
            # Get probability as a proxy for area coverage %
            pct_year1 = result1["probabilities"].get(cls, 0)
            pct_year2 = result2["probabilities"].get(cls, 0)
            
            # Calculate Area in km² (PDF Page 10)
            area_year1 = round((pct_year1 / 100) * settings.AREA_SCALE_FACTOR * (settings.IMAGE_SIZE ** 2), 2)
            area_year2 = round((pct_year2 / 100) * settings.AREA_SCALE_FACTOR * (settings.IMAGE_SIZE ** 2), 2)
            
            # Calculate % Change (PDF Page 7)
            diff = area_year2 - area_year1
            pct_change = 0.0
            if area_year1 > 0:
                pct_change = round(((area_year2 - area_year1) / area_year1) * 100, 1)
            
            direction = "↑" if diff > 0 else "↓"
            trend_type = "increasing" if diff > 0 else "decreasing"
            
            stats.append({
                "class": cls,
                "year1_area_km2": area_year1,
                "year2_area_km2": area_year2,
                "change_pct": f"{direction} {abs(pct_change)}%",
                "trend": trend_type
            })

        return {
            "year1_prediction": result1["label"],
            "year2_prediction": result2["label"],
            "area_stats": stats
        }
        
    @staticmethod
    def generate_augmentations(image_bytes: bytes) -> dict:
        """
        Generates 3 augmented versions for preview. 
        Downscales to 300x300 to ensure fast Base64 transmission.
        """
        try:
            original = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            # Downscale for preview performance
            original.thumbnail((300, 300)) 

            results = {}

            # 1. Rotation
            rotated = original.rotate(90, expand=True)
            results['rotated'] = ClassificationService._img_to_base64(rotated)

            # 2. Horizontal Flip
            flipped = original.transpose(Image.FLIP_LEFT_RIGHT)
            results['flipped'] = ClassificationService._img_to_base64(flipped)

            # 3. Brightness
            enhancer = ImageEnhance.Brightness(original)
            bright = enhancer.enhance(1.5)
            results['brightness'] = ClassificationService._img_to_base64(bright)

            return results
        except Exception as e:
            print(f"Augmentation Error: {e}")
            return {}

    @staticmethod
    def _img_to_base64(img: Image.Image) -> str:
        buffered = io.BytesIO()
        # Using PNG for better Base64 compatibility
        img.save(buffered, format="PNG") 
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    @staticmethod
    def get_model_leaderboard() -> list:
        """
        Returns the performance metrics for available models (PDF Page 9).
        """
        return [
            {"model": "EfficientNet-B0", "accuracy": "93.4%", "precision": "0.91", "recall": "0.94", "f1": "0.92"},
            {"model": "ResNet50", "accuracy": "91.2%", "precision": "0.89", "recall": "0.90", "f1": "0.89"},
            {"model": "MobileNetV2", "accuracy": "88.7%", "precision": "0.86", "recall": "0.85", "f1": "0.85"},
            {"model": "VGG16", "accuracy": "86.1%", "precision": "0.84", "recall": "0.82", "f1": "0.83"},
        ]