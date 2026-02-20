from pydantic import BaseModel, Field
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


# ==========================================
# Map Analysis (Full Grid) Schemas
# ==========================================
class GridPatch(BaseModel):
    x: int
    y: int
    terrain_class: str = Field(alias="class", serialization_alias="class")
    confidence: float

    model_config = {"populate_by_name": True}


class MapAnalysisResponse(BaseModel):
    filename: str
    image_width: int
    image_height: int
    patch_size: int
    grid: List[GridPatch]