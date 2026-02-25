from fastapi import APIRouter, UploadFile, File
from .services import ClassificationService
from typing import List

router = APIRouter(prefix="/classification", tags=["Classification"])

@router.post("/predict")
async def predict_single(file: UploadFile = File(...)):
    """Predict top label and confidence for a patch"""
    contents = await file.read()
    return ClassificationService.predict_single(contents)

@router.post("/analyze-map")
async def analyze_map(file: UploadFile = File(...), patch_size: int = 32):
    """Generate the full grid JSON for the heatmap visualization"""
    contents = await file.read()
    return ClassificationService.analyze_full_map(contents, patch_size)

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

@router.get("/leaderboard")
async def get_leaderboard():
    """
    Returns the Model Comparison Table data.
    """
    return {
        "leaderboard": ClassificationService.get_model_leaderboard()
    }