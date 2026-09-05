'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';
import { analyzeImageHybrid, cleanOCRText } from '@/lib/imageAnalysis';

interface ImageOCRProps {
  onOCRComplete: (extractedText: string, detectionMethod?: string) => void;
  userAllergies?: string[];
  onClose: () => void;
}

export function ImageOCR({ onOCRComplete, onClose, userAllergies = [] }: ImageOCRProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const performOCR = async () => {
    if (!preview) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('[v0] Starting OCR processing');
      // Dynamic import of Tesseract.js
      const Tesseract = (await import('tesseract.js')).default;
      console.log('[v0] Tesseract.js imported successfully');

      const result = await Tesseract.recognize(preview, 'eng', {
        logger: (m: any) => {
          console.log('[v0] OCR Progress:', m.status, m.progress ? `${Math.round(m.progress * 100)}%` : '');
        },
      });

      const text = result.data.text.trim();
      console.log('[v0] OCR complete, extracted text length:', text.length);

      // If OCR found text, use it. Otherwise, try image classification
      if (text && text.length >= 3) {
        const cleanedText = text
          .replace(/[^\w\s,.-]/g, ' ') // Remove special characters except commas and hyphens
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();

        console.log('[v0] Cleaned text:', cleanedText);
        setExtractedText(cleanedText);
        return;
      }

      // OCR failed or returned minimal text, try image classification
      console.log('[v0] OCR text insufficient, attempting image classification...');
      try {
        const analysisResult = await analyzeImageHybrid(preview, text, userAllergies || []);
        console.log('[v0] Image analysis complete:', analysisResult);

        if (analysisResult.detectedFoods.length > 0) {
          // Use detected foods as extracted text
          const detectedText = analysisResult.detectedFoods.join(', ');
          console.log('[v0] Using classification result:', detectedText);
          setExtractedText(detectedText);
          // Store the detection method for later use
          (window as any).__detectionMethod = analysisResult.method;
          (window as any).__detectionMessage = analysisResult.message;
        } else {
          setError('No text or recognizable food detected in image. Please try:\n• A clearer, better-lit photo\n• Include visible product label\n• Upload another image\n• Enter ingredients manually');
        }
      } catch (classificationError) {
        console.error('[v0] Image classification also failed:', classificationError);
        setError('Unable to extract text or identify food. Please try:\n• A clearer, better-lit photo\n• Ensure the label is visible\n• Upload another image\n• Enter ingredients manually');
      }
    } catch (err) {
      console.error('[v0] OCR Error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log('[v0] Error details:', errorMsg);
      setError(`Failed to extract text: ${errorMsg.substring(0, 100)}. Please try another image or enter ingredients manually.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (extractedText.trim()) {
      onOCRComplete(extractedText);
      setExtractedText('');
      setPreview(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Upload Food Label Image</h2>

        {!preview ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Upload an image of the food label or ingredient list. The system will extract the text automatically.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg
                className="mx-auto h-12 w-12 text-blue-500 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="font-semibold">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>

            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        ) : !extractedText ? (
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Image uploaded successfully. Click "Extract Text" to analyze the label.
            </div>

            <div className="flex gap-2">
              <Button
                onClick={performOCR}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 gap-2"
              >
                {isProcessing && <Spinner className="size-4" />}
                {isProcessing ? 'Extracting...' : 'Extract Text'}
              </Button>
              <Button
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                Change
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Extracted Ingredients</label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Review and edit the extracted text before confirming
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirm & Check
              </Button>
              <Button
                onClick={() => {
                  setExtractedText('');
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                Upload Another
              </Button>
            </div>

            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
