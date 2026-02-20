from typing import List
from fastapi import APIRouter, UploadFile, File
from .services import ClassificationService

router = APIRouter(prefix="/classification", tags=["Classification"])

@router.post("/predict")
async def predict_single(file: UploadFile = File(...)):
    """Single image prediction endpoint"""
    contents = await file.read()
    
    # 1. Preprocess
    tensor = ClassificationService.preprocess_image(contents)
    
    # 2. Predict (Calls your teammate's model)
    result = ClassificationService.call_teammate_model(tensor)
    
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
        tensor = ClassificationService.preprocess_image(contents)
        result = ClassificationService.call_teammate_model(tensor)
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