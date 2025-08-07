from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import io
from PIL import Image
import os

app = FastAPI(title="Marine Debris Detection API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None

def load_model():
    """Load YOLOv8 model"""
    global model
    try:
        # Try to load custom trained model first
        if os.path.exists("best.pt"):
            model = YOLO("best.pt")
        else:
            # Fallback to pre-trained model for demo
            model = YOLO("yolov8n.pt")
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

def classify_severity(detection_count):
    """Classify severity based on detection count"""
    if detection_count > 15:
        return "red", "Critical pollution detected"
    elif detection_count >= 6:
        return "yellow", "Moderate pollution detected"
    else:
        return "green", "Low pollution detected"

def process_image(image_array):
    """Process image with YOLOv8 and return results"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Run inference
    results = model(image_array)
    
    # Extract detections
    detections = []
    annotated_image = image_array.copy()
    
    for result in results:
        boxes = result.boxes
        if boxes is not None:
            for box in boxes:
                # Get coordinates and confidence
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = box.conf[0].cpu().numpy()
                class_id = int(box.cls[0].cpu().numpy())
                
                # Filter by confidence threshold
                if confidence > 0.5:
                    detections.append({
                        "bbox": [float(x1), float(y1), float(x2), float(y2)],
                        "confidence": float(confidence),
                        "class": model.names[class_id] if hasattr(model, 'names') else f"class_{class_id}"
                    })
                    
                    # Draw bounding box
                    cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    cv2.putText(annotated_image, f"{model.names[class_id] if hasattr(model, 'names') else f'class_{class_id}'}: {confidence:.2f}", 
                               (int(x1), int(y1-10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    return detections, annotated_image

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/")
async def root():
    return {"message": "Marine Debris Detection API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.post("/detect")
async def detect_debris(file: UploadFile = File(...)):
    """Detect marine debris in uploaded image"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Process image
        detections, annotated_image = process_image(image_array)
        
        # Classify severity
        detection_count = len(detections)
        severity_level, severity_message = classify_severity(detection_count)
        
        # Convert annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        annotated_image_base64 = base64.b64encode(buffer).decode()
        
        # Prepare response
        response = {
            "detection_count": detection_count,
            "severity_level": severity_level,
            "severity_message": severity_message,
            "detections": detections,
            "annotated_image": f"data:image/jpeg;base64,{annotated_image_base64}",
            "filename": file.filename
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)