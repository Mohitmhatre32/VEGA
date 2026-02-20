from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

router = APIRouter(prefix="/models", tags= ["Models"])

@router.get("/")
async def get_models():
    """Returns the sortable leaderboard of models."""
    return

@router.post("/train")
async def start_training(dataset_name: str, model_type: str = "ResNet50"):
    """Triggers the backend training job."""
    # Logic to trigger background ML task goes here
    return {"message": f"Training job started for {model_type} on {dataset_name}"}

@router.websocket("/ws/training-logs")
async def websocket_training_logs(websocket: WebSocket):
    """Streams live training metrics (Accuracy/Loss vs Epoch) via WebSocket."""
    await websocket.accept()
    try:
        # Simulating live ML training logs streaming
        for epoch in range(1, 11):
            log_data = {
                "epoch": epoch,
                "loss": round(1.0 / epoch, 4),
                "accuracy": round(70 + (epoch * 2.5), 2),
                "gpu_utilization": "88%"
            }
            await websocket.send_text(json.dumps(log_data))
            await asyncio.sleep(1) # Send update every 1 second
            
        await websocket.send_text(json.dumps({"status": "Training Complete"}))
    except WebSocketDisconnect:
        print("Client disconnected from training logs.")
        
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