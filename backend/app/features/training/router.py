from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .services import TrainingService

router = APIRouter(prefix="/training", tags=["Training"])

@router.websocket("/ws/start")
async def websocket_training_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Stream training logs
        async for metrics in TrainingService.simulate_training_loop():
            await websocket.send_text(metrics)
            
        # Send completion message
        await websocket.send_text('{"status": "complete", "message": "Model Training Finished Successfully"}')
        await websocket.close()
        
    except WebSocketDisconnect:
        print("Client disconnected from training stream")