import cv2
import numpy as np
from PIL import Image
import io
from app.core.config import settings

class ImageProcessor:
    @staticmethod
    def process_for_model(image_bytes: bytes):
        # 1. Load image
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # 2. Resize (Requirement: 224x224)
        img_resized = img.resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE))
        
        # 3. Convert to Array and Normalize
        img_array = np.array(img_resized).astype(np.float32) / 255.0
        
        # Prepare for ML Service (C, H, W)
        img_tensor = np.transpose(img_array, (2, 0, 1))
        return np.expand_dims(img_tensor, axis=0)

    @staticmethod
    def get_mock_prediction():
        """
        Temporary mock for the teammate's model. 
        Returns random probabilities for the 5 classes.
        """
        probs = np.random.dirichlet(np.ones(5), size=1)[0]
        class_idx = np.argmax(probs)
        return {
            "label": settings.CLASSES[class_idx],
            "confidence": round(float(probs[class_idx]) * 100, 2),
            "probabilities": {settings.CLASSES[i]: round(float(probs[i]) * 100, 2) for i in range(5)}
        }