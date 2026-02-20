class Settings:
    PROJECT_NAME: str = "VEGA - Satellite Intelligence"
    IMAGE_SIZE: int = 224
    CLASSES: list = ["Urban Area", "Agricultural Land", "Forest", "Water Body", "Barren Land"]
    CLASS_COLORS: dict = {
        "Urban Area": [128, 128, 128],      # Gray
        "Agricultural Land": [255, 255, 0], # Yellow
        "Forest": [0, 128, 0],              # Green
        "Water Body": [0, 0, 255],           # Blue
        "Barren Land": [165, 42, 42]        # Brown
    }

settings = Settings()