import { useState, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import './App.css'

function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra-large'>('large')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // カメラを起動する関数
const startCamera = async () => {
  try {
    // iOSのSafariでは特定の制約が必要な場合がある
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    // カメラへのアクセスを要求
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // 自動再生の問題を回避するためにplayメソッドを明示的に呼び出す
      await videoRef.current.play();
      setCameraActive(true);
    } else {
      throw new Error('ビデオ要素が見つかりません');
    }
  } catch (err) {
    console.error('カメラへのアクセスに失敗しました:', err);
    alert('カメラへのアクセスに失敗しました。ブラウザの設定でカメラへのアクセスを許可してください。');
    setCameraActive(false);
  }
}


  // カメラを停止する関数
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  // 画像をキャプチャする関数
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        // キャンバスのサイズをビデオのサイズに合わせる
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // ビデオの現在のフレームをキャンバスに描画
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // キャンバスの内容をデータURLとして取得
        const imageDataUrl = canvas.toDataURL('image/png')
        setCapturedImage(imageDataUrl)
        
        // OCR処理を開始
        recognizeText(imageDataUrl)
      }
    }
  }

  // OCR処理を行う関数
const recognizeText = async (imageUrl: string) => {
  setIsProcessing(true);
  
  try {
    // 修正前:
    // const worker = await createWorker('jpn');
    
    // 修正後:
    const worker = await createWorker();
    await worker.loadLanguage('jpn');
    await worker.initialize('jpn');
    
    const { data } = await worker.recognize(imageUrl);
    
    // 日本語OCRの場合、スペースが入ることがあるので取り除く
    const cleanedText = data.text.replace(/\s+/g, '');
    setRecognizedText(cleanedText);
    
    await worker.terminate();
  } catch (err) {
    console.error('OCR処理に失敗しました:', err);
    setRecognizedText('テキスト認識に失敗しました。もう一度お試しください。');
  } finally {
    setIsProcessing(false);
  }
}


  // テキストサイズを変更する関数
  const changeTextSize = (size: 'normal' | 'large' | 'extra-large') => {
    setTextSize(size)
  }

  // テキスト表示用のクラス名を取得する関数
  const getTextDisplayClass = () => {
    switch (textSize) {
      case 'normal':
        return 'text-display'
      case 'large':
        return 'text-display-large'
      case 'extra-large':
        return 'text-display-extra-large'
      default:
        return 'text-display-large'
    }
  }

  // コンポーネントがアンマウントされる際にカメラを停止
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">OCRテキスト認識アプリ</h1>
      
      <div className="mb-4 flex justify-center">
        {!cameraActive ? (
          <button 
            onClick={startCamera}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            カメラを起動
          </button>
        ) : (
          <button 
            onClick={stopCamera}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            カメラを停止
          </button>
        )}
      </div>
      
      <div className="video-container mb-4 flex flex-col items-center">
        {cameraActive && (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full max-w-lg border border-gray-300 rounded"
            />
            <button 
              onClick={captureImage}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={isProcessing}
            >
              {isProcessing ? '処理中...' : '撮影してテキスト認識'}
            </button>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {capturedImage && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-center">撮影した画像:</h2>
          <div className="flex justify-center">
            <img 
              src={capturedImage} 
              alt="撮影した画像" 
              className="w-full max-w-lg border border-gray-300 rounded"
            />
          </div>
        </div>
      )}
      
      {recognizedText && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-center">認識されたテキスト:</h2>
          
          <div className="text-controls">
            <button 
              onClick={() => changeTextSize('normal')}
              className={`text-control-button size-normal ${textSize === 'normal' ? 'opacity-100' : 'opacity-70'}`}
            >
              標準
            </button>
            <button 
              onClick={() => changeTextSize('large')}
              className={`text-control-button size-large ${textSize === 'large' ? 'opacity-100' : 'opacity-70'}`}
            >
              大きい
            </button>
            <button 
              onClick={() => changeTextSize('extra-large')}
              className={`text-control-button size-extra-large ${textSize === 'extra-large' ? 'opacity-100' : 'opacity-70'}`}
            >
              特大
            </button>
          </div>
          
          <div className="text-container">
            <div className={getTextDisplayClass()}>
              {recognizedText}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
