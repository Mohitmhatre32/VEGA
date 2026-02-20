import asyncio
import random
import json

class TrainingService:
    @staticmethod
    async def simulate_training_loop():
        """
        Generator that simulates a real ML training process.
        Yields metrics for every epoch.
        """
        epochs = 20
        accuracy = 0.45  # Starting accuracy
        loss = 2.5       # Starting loss

        for i in range(1, epochs + 1):
            # Simulate processing time
            await asyncio.sleep(1) 
            
            # Simulate model improvement
            accuracy += random.uniform(0.01, 0.05)
            loss -= random.uniform(0.05, 0.2)
            
            # Cap values
            if accuracy > 0.98: accuracy = 0.98
            if loss < 0.1: loss = 0.1
            
            metrics = {
                "epoch": i,
                "total_epochs": epochs,
                "accuracy": round(accuracy, 4),
                "loss": round(loss, 4),
                "gpu_util": random.randint(70, 95), # PDF Page 7 requirement
                "log": f"Epoch [{i}/{epochs}] - Loss: {loss:.4f} - Acc: {accuracy:.4f}"
            }
            
            yield json.dumps(metrics)