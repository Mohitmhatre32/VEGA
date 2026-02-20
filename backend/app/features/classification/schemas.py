from pydantic import BaseModel
from typing import Dict, List, Optional

class PredictionResponse(BaseModel):
    filename: str
    label: str
    confidence: float
    probabilities: Dict  # Fixed: Specified types inside Dict
    
    # Teammate will populate these later:
    heatmap_url: Optional = None  # Fixed: Added
    terrain_mask_url: Optional = None # Fixed: Added

class BatchPredictionResponse(BaseModel):
    total_processed: int
    class_counts: Dict # Fixed: Specified types
    detailed_results: List # Fixed: Specified types

class ChangeDetectionResponse(BaseModel):
    area_difference_percentage: Dict # Fixed: Specified types
    visualization_overlay_url: Optional = None # Fixed: Added