# PowerShell script to download face-api.js models

Write-Host "Creating models directory..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "public\models" | Out-Null

Write-Host "Downloading face-api.js models..." -ForegroundColor Green

$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

foreach ($model in $models) {
    $url = "$baseUrl/$model"
    $output = "public\models\$model"
    
    Write-Host "Downloading $model..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
        Write-Host "Downloaded $model" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download $model" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "All models downloaded successfully!" -ForegroundColor Green
Write-Host "Models are located in public\models" -ForegroundColor Cyan
