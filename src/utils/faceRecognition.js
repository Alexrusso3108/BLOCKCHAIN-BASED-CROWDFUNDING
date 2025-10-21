import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Load face-api.js models
export const loadModels = async () => {
  if (modelsLoaded) return;
  
  const MODEL_URL = '/models';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.error('Error loading models:', error);
    throw new Error('Failed to load face recognition models');
  }
};

// Detect face and extract descriptor
export const detectFace = async (videoElement) => {
  if (!modelsLoaded) {
    await loadModels();
  }

  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection;
};

// Compare two face descriptors
export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance < threshold;
};

// Convert descriptor to array for storage
export const descriptorToArray = (descriptor) => {
  return Array.from(descriptor);
};

// Convert array back to Float32Array for comparison
export const arrayToDescriptor = (array) => {
  return new Float32Array(array);
};

// Start video stream
export const startVideo = async (videoElement) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 640, 
        height: 480 
      } 
    });
    videoElement.srcObject = stream;
    
    // Wait for video to be ready
    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play()
          .then(() => resolve(stream))
          .catch(reject);
      };
      videoElement.onerror = reject;
    });
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error('Failed to access camera. Please ensure camera permissions are granted.');
  }
};

// Stop video stream
export const stopVideo = (videoElement) => {
  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
  }
};
