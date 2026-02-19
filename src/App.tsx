import { useState, useCallback } from 'react';
import { Upload, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeAntennaImage } from './services/geminiService';

// A utility to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      setError(null);
      setImageFile(file);
      setAnalysisResult(null);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileChange(event.dataTransfer.files);
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const result = await analyzeAntennaImage(imageBase64, imageFile.type);
      setAnalysisResult(result);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!analysisResult) return null;
    if (analysisResult.includes('ปกติ')) {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
    if (analysisResult.includes('เกิด Flashover')) {
      return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
    if (analysisResult.includes('แตกหัก')) {
      return <XCircle className="w-8 h-8 text-red-500" />;
    }
    return null;
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Antenna Status Analyzer</h1>
          <p className="text-slate-500 mt-2">อัปโหลดภาพถ่ายสายอากาศเพื่อวิเคราะห์สถานะ</p>
        </header>

        <main className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors duration-300"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center text-slate-500">
                <Upload className="w-12 h-12 mb-4 text-slate-400" />
                <p className="font-semibold">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่ออัปโหลด</p>
                <p className="text-sm mt-1">รองรับไฟล์รูปภาพ (PNG, JPG, WEBP)</p>
            </div>
          </div>

          {imagePreview && (
            <div className="mt-6 text-center">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">ตัวอย่างภาพ</h2>
              <div className="relative inline-block">
                <img src={imagePreview} alt="Image preview" className="max-w-full h-auto max-h-80 rounded-lg shadow-md" />
                <button 
                  onClick={() => { setImageFile(null); setImagePreview(null); setAnalysisResult(null); setError(null); }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-transform transform hover:scale-110"
                  aria-label="Remove image"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {imageFile && (
            <div className="mt-8 text-center">
              <button 
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'กำลังวิเคราะห์...' : 'เริ่มการวิเคราะห์'}
              </button>
            </div>
          )}

          {isLoading && (
            <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">เกิดข้อผิดพลาด:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {analysisResult && (
            <div className="mt-8 p-6 bg-slate-100/80 rounded-xl border border-slate-200/80">
              <h2 className="text-xl font-semibold text-slate-800 text-center mb-4">ผลการวิเคราะห์</h2>
              <div className="flex items-center justify-center space-x-4">
                {getStatusIcon()}
                <p className="text-2xl font-medium text-slate-700">{analysisResult}</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
