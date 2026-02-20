
import requests
import os
import json
import time

# Create a dummy image
from PIL import Image
import io

def create_test_image():
    img = Image.new('RGB', (224, 224), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    return img_byte_arr

def test_prediction():
    url = "http://localhost:8000/classification/predict"
    files = {'file': ('test_image.png', create_test_image(), 'image/png')}
    
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ API Request Success")
        else:
            print("❌ API Request Failed")
            return

        # Check static files
        static_dir = os.path.join(os.getcwd(), "backend/app/static") # Adjust path if running from root
        # Actually the service saves to app/static relative to cwd of the server
        # If server runs from backend/, then static is backend/app/static
        
        # We need to check where the server thinks it is.
        # Assuming we check d:\Hackathon\VEGA\backend\app\static
        
        static_path = r"d:\Hackathon\VEGA\backend\app\static"
        
        input_path = os.path.join(static_path, "latest_input.png")
        result_path = os.path.join(static_path, "latest_result.json")
        
        if os.path.exists(input_path):
            print(f"✅ latest_input.png exists at {input_path}")
        else:
            print(f"❌ latest_input.png NOT found at {input_path}")

        if os.path.exists(result_path):
            print(f"✅ latest_result.json exists at {result_path}")
            with open(result_path, 'r') as f:
                data = json.load(f)
                print(f"📄 Saved JSON content: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ latest_result.json NOT found at {result_path}")

    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_prediction()
