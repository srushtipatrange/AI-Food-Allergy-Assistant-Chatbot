'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [quaggaReady, setQuaggaReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load QuaggaJS
  useEffect(() => {
    const loadQuagga = async () => {
      try {
        // Try to import QuaggaJS from CDN
        if (!(window as any).Quagga) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
          script.async = true;
          script.onload = () => {
            console.log('[v0] QuaggaJS loaded successfully');
            setQuaggaReady(true);
          };
          script.onerror = () => {
            console.log('[v0] QuaggaJS failed to load from CDN, will use manual entry');
            setQuaggaReady(false);
          };
          document.body.appendChild(script);
        } else {
          setQuaggaReady(true);
        }
      } catch (err) {
        console.log('[v0] QuaggaJS unavailable, using manual entry', err);
        setQuaggaReady(false);
      }
    };
    
    loadQuagga();
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const startCamera = async () => {
      try {
        console.log('[v0] Requesting camera access');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('[v0] Camera stream started');
        }

        // If QuaggaJS is ready, initialize it
        if (quaggaReady && (window as any).Quagga) {
          initializeQuagga();
        }
      } catch (err) {
        console.error('[v0] Camera access error:', err);
        const errorMsg = (err as any)?.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access in settings.'
          : 'Unable to access camera. Please check permissions and try again.';
        setError(errorMsg);
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
      if ((window as any).Quagga) {
        try {
          (window as any).Quagga.stop();
        } catch (e) {
          console.log('[v0] Error stopping Quagga:', e);
        }
      }
    };
  }, [isScanning, quaggaReady]);

  const initializeQuagga = async () => {
    try {
      console.log('[v0] Initializing QuaggaJS');
      const Quagga = (window as any).Quagga;
      
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: videoRef.current,
            constraints: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          decoder: {
            workers: 2,
            debug: false,
            multiple: false,
            formats: ['code_128', 'code_39', 'code_39_vin', 'codabar', 'ean_13', 'ean_8', 'ean', 'upca', 'upce', 'upc'],
          },
        },
        (err: any) => {
          if (err) {
            console.error('[v0] QuaggaJS init error:', err);
            setError('Barcode scanner initialization failed. Please use manual entry.');
            return;
          }
          console.log('[v0] QuaggaJS initialized successfully');
          Quagga.start();

          // Handle barcode detection
          Quagga.onDetected((result: any) => {
            if (result.codeResult && result.codeResult.code) {
              const barcode = result.codeResult.code;
              console.log('[v0] Barcode detected:', barcode);
              handleBarcodeDetected(barcode);
            }
          });
        }
      );
    } catch (err) {
      console.error('[v0] Error initializing Quagga:', err);
      setError('Barcode detection not available. Please enter barcode manually.');
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    console.log('[v0] Processing barcode:', barcode);
    setIsProcessing(true);
    setIsScanning(false);
    
    // Stop scanning
    if ((window as any).Quagga) {
      try {
        (window as any).Quagga.stop();
      } catch (e) {
        console.log('[v0] Error stopping Quagga:', e);
      }
    }

    // Give visual feedback
    setTimeout(() => {
      onScanSuccess(barcode);
    }, 500);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      console.log('[v0] Manual barcode submitted:', manualBarcode);
      onScanSuccess(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">📷 Scan Product Barcode</h2>

        {!isScanning ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Option 1: Point your camera at a product barcode to scan it automatically.
              {!quaggaReady && ' (Barcode auto-detection unavailable)'}
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Option 2: Manual Barcode Entry</label>
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g., 5449000064812"
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <p className="text-xs text-gray-500">Usually found on the back of the product</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ❌ {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {quaggaReady && (
                <Button
                  onClick={() => {
                    setError(null);
                    setIsScanning(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📱 Open Camera
                </Button>
              )}
              <Button
                onClick={handleManualSubmit}
                disabled={!manualBarcode.trim() || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Spinner className="size-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  '✓ Check Barcode'
                )}
              </Button>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              📍 Position the barcode in the center of the camera view
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-green-400 rounded-lg" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ❌ {error}
              </div>
            )}

            <Button
              onClick={() => {
                setIsScanning(false);
                setError(null);
              }}
              variant="outline"
              className="w-full"
            >
              ✕ Stop Scanning
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
