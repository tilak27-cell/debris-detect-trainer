# Marine Debris Detection API

FastAPI backend for marine debris detection using YOLOv8.

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Add your trained YOLOv8 model:
   - Place your trained model file as `best.pt` in the root directory
   - Or the API will use YOLOv8n as fallback

3. Run the server:
```bash
uvicorn main:app --reload
```

4. Access the API documentation at `http://localhost:8000/docs`

## Deployment on Render

### Method 1: Connect GitHub Repository

1. Push this backend code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: marine-debris-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Click "Create Web Service"

### Method 2: Using render.yaml

1. Push this code with the `render.yaml` file to GitHub
2. In Render, click "New +" and select "Blueprint"
3. Connect your repository and deploy

### Method 3: Docker Deployment

1. Use the included Dockerfile
2. In Render, select "Docker" as environment
3. Set Dockerfile path to `./Dockerfile`

## Environment Variables

Add these in Render dashboard if needed:
- `PYTHON_VERSION`: 3.9.16

## Adding Your Trained Model

Upload your `best.pt` file to the repository or use Render's persistent disk feature for large models.

## API Endpoints

- `GET /`: Health check
- `GET /health`: Detailed health status
- `POST /detect`: Upload image for debris detection

## API Usage

```python
import requests

# Upload image for detection
with open('satellite_image.jpg', 'rb') as f:
    response = requests.post(
        'https://your-render-url.onrender.com/detect',
        files={'file': f}
    )
    result = response.json()
    print(f"Severity: {result['severity_level']}")
    print(f"Objects detected: {result['detection_count']}")
```