from fastapi import APIRouter, UploadFile, File
from .services import ImageProcessor

router = APIRouter(prefix="/classification", tags=["Classification"])

@router.post("/predict")
async def predict_land_use(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Run Preprocessing
    _ = ImageProcessor.process_for_model(contents)
    
    # Get Prediction (Currently Mocked)
    prediction = ImageProcessor.get_mock_prediction()
    
    return {
        "filename": file.filename,
        "prediction": prediction["label"],
        "confidence": f"{prediction['confidence']}%",
        "breakdown": prediction["probabilities"]
    }