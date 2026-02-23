from typing import List
from fastapi import APIRouter, UploadFile, File
from .services import ClassificationService

router = APIRouter(prefix="/classification", tags=["Classification"])

@router.post("/predict")
async def predict_single(file: UploadFile = File(...)):
    """Single image prediction endpoint"""
    contents = await file.read()
    
    # 1. Preprocess & Predict (Service handles it now)
    result = ClassificationService.call_teammate_model(contents)
    
    return {
        "filename": file.filename,
        "prediction": result["label"],
        "confidence": f"{result['confidence']}%",
        "breakdown": result["probabilities"]
    }

@router.post("/predict-batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """Batch image prediction endpoint (Upload multiple patches)"""
    predictions = []
    
    for file in files:
        contents = await file.read()
        # Service handles bytes directly
        result = ClassificationService.call_teammate_model(contents)
        predictions.append(result)
        
    # Aggregate stats
    batch_stats = ClassificationService.process_batch(predictions)
    
    return {
        "message": "Batch processed successfully",
        "stats": batch_stats
    }

@router.post("/change-detection")
async def change_detection(
    file1: UploadFile = File(...), 
    file2: UploadFile = File(...)
):
    """
    Compare Year 1 and Year 2 images to detect urban expansion/deforestation.
    """
    img1 = await file1.read()
    img2 = await file2.read()
    
    change_report = ClassificationService.calculate_change_detection(img1, img2)
    
    return {
        "message": "Change detection complete",
        "report": change_report
    }
    
@router.post("/augment-preview")
async def augment_preview(file: UploadFile = File(...)):
    """
    Returns 3 augmented versions of the uploaded image (Rotated, Flipped, Brightness).
    """
    contents = await file.read()
    augments = ClassificationService.generate_augmentations(contents)
    return {
        "message": "Augmentation preview generated",
        "images": augments
    }

@router.post("/analyze-map")
async def analyze_map(
    file: UploadFile = File(...),
    patch_size: int = 64
):
    """
    Full satellite image grid analysis.
    Returns the same JSON as test_run.py:
    { filename, image_width, image_height, patch_size, grid: [{x, y, class, confidence}] }
    """
    contents = await file.read()
    result = ClassificationService.analyze_map(contents, file.filename, patch_size)
    return result

@router.get("/leaderboard")
async def get_leaderboard():
    """
    Returns the Model Comparison Table data.
    """
    return {
        "leaderboard": ClassificationService.get_model_leaderboard()
    }