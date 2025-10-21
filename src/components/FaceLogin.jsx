import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  loadModels, 
  detectFace, 
  startVideo, 
  stopVideo, 
  descriptorToArray,
  arrayToDescriptor,
  compareFaces
} from '../utils/faceRecognition';

const FaceLogin = ({ onSuccess, onCancel }) => {
  const { signInLocal } = useAuth();
  const [status, setStatus] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    // Load models on component mount
    loadModels()
      .then(() => {
        setModelsLoaded(true);
        setStatus('Models loaded. Ready to scan face.');
      })
      .catch((error) => {
        setStatus('Error loading models: ' + error.message);
      });

    return () => {
      if (streamRef.current) {
        stopVideo(videoRef.current);
      }
    };
  }, []);

  const startCapture = async () => {
    if (!modelsLoaded) {
      setStatus('Please wait for models to load...');
      return;
    }

    try {
      setStatus('Starting camera...');
      streamRef.current = await startVideo(videoRef.current);
      setIsCapturing(true);
      isCapturingRef.current = true;
      setStatus('Camera started. Position your face in the frame.');
      
      // Wait for video to be ready before starting detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start detecting faces
      detectFaceLoop();
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const detectFaceLoop = async () => {
    if (!videoRef.current || !isCapturingRef.current) return;

    // Check if video is ready
    if (videoRef.current.readyState !== 4) {
      setTimeout(detectFaceLoop, 100);
      return;
    }

    try {
      const detection = await detectFace(videoRef.current);
      
      if (detection) {
        setFaceDetected(true);
        setStatus('Face detected! Click Login to authenticate.');
        console.log('Face detected successfully');
      } else {
        setFaceDetected(false);
        setStatus('No face detected. Please position your face clearly.');
      }
    } catch (error) {
      console.error('Detection error:', error);
      setStatus('Detection error: ' + error.message);
    }

    // Continue loop
    if (isCapturingRef.current) {
      setTimeout(detectFaceLoop, 100);
    }
  };

  const handleLogin = async () => {
    if (!faceDetected) {
      setStatus('No face detected. Please ensure your face is clearly visible.');
      return;
    }

    try {
      setStatus('Authenticating...');
      
      // Detect face and get descriptor
      const detection = await detectFace(videoRef.current);
      
      if (!detection) {
        setStatus('Failed to detect face. Please try again.');
        return;
      }

      const currentDescriptor = detection.descriptor;
      
      setStatus('Comparing with registered faces...');

      // Fetch all user profiles with face descriptors
      const { data: profiles, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*');

      if (fetchError) {
        setStatus('Error fetching profiles: ' + fetchError.message);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setStatus('No registered users found. Please register first.');
        return;
      }

      // Compare current face with all registered faces
      let matchedProfile = null;
      let bestMatch = 1; // Lower is better (distance)

      for (const profile of profiles) {
        if (profile.face_descriptor) {
          const storedDescriptor = arrayToDescriptor(profile.face_descriptor);
          const isMatch = compareFaces(currentDescriptor, storedDescriptor, 0.6);
          
          if (isMatch) {
            const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
            if (distance < bestMatch) {
              bestMatch = distance;
              matchedProfile = profile;
            }
          }
        }
      }

      if (matchedProfile) {
        setStatus(`Welcome back, ${matchedProfile.name}!`);
        
        // Sign in the user (you might want to implement a custom token-based auth)
        // For now, we'll just pass the user data
        stopVideo(videoRef.current);
        setIsCapturing(false);
        isCapturingRef.current = false;
        
        // Persist a local sign-in so the session remains after refresh (face login)
        try {
          signInLocal(matchedProfile);
        } catch (e) {
          console.error('Local sign-in failed', e);
        }

        setTimeout(() => {
          if (onSuccess) onSuccess(matchedProfile);
        }, 1500);
      } else {
        setStatus('Face not recognized. Please try again or register.');
      }
    } catch (error) {
      setStatus('Error: ' + error.message);
      console.error('Login error:', error);
    }
  };

  const handleCancel = () => {
    stopVideo(videoRef.current);
    setIsCapturing(false);
    isCapturingRef.current = false;
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Login with Face Recognition</h2>
          
          {/* Video Preview */}
          <div className="mb-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {faceDetected && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Face Detected ✓
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mb-4 p-3 rounded-lg ${
              status.includes('Error') || status.includes('Failed') || status.includes('not recognized')
                ? 'bg-red-100 text-red-700' 
                : status.includes('Welcome')
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {status}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isCapturing ? (
              <>
                <button
                  onClick={startCapture}
                  disabled={!modelsLoaded}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Start Camera
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={!faceDetected}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Login
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceLogin;
