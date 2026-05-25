import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

function ReactorModel() {
  const { scene } = useGLTF('/models/reactor-core.glb');
  
  useEffect(() => {
    scene.scale.set(0.5, 0.5, 0.5);
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    
    return () => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
          }
        }
      });
    };
  }, [scene]);
  
  return <primitive object={scene} />;
}

export default function Core3D() {
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const errorCount = useRef(0);
  const canvasRef = useRef(null);

  const handleRetry = useCallback(() => {
    errorCount.current += 1;
    if (errorCount.current <= 2) {
      setRetryKey(prev => prev + 1);
      setHasError(false);
    }
  }, []);

  // Deteksi context loss
  useEffect(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn('WebGL context lost, reloading canvas...');
      setTimeout(() => handleRetry(), 500);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [retryKey, handleRetry]);

  if (hasError) {
    return (
      <div className="w-full h-full bg-black text-red-500 flex flex-col items-center justify-center">
        <p>Gagal memuat model 3D Core</p>
        <button onClick={handleRetry} className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded">
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div ref={canvasRef} className="w-full h-full relative" style={{ width: '100%', height: '100%', minHeight: 0 }}>
      {/* LEGENDA KONTROL */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[0.65rem] font-mono p-2 rounded-md border border-gray-600 pointer-events-none select-none">
        <div className="font-bold text-blue-300 mb-1">🎮 Kontrol Kamera 360°</div>
        <div>🖱️ Drag kiri → Rotasi</div>
        <div>📜 Scroll → Zoom</div>
        <div>🖱️ Drag kanan (Shift+drag) → Geser</div>
      </div>

      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center text-white bg-black">
          Memuat model 3D Core...
        </div>
      }>
        <Canvas
          key={retryKey}
          style={{ background: 'black', display: 'block' }}
          camera={{ position: [3, 2, 4], fov: 45 }}
          gl={{ powerPreference: "high-performance", alpha: false }}
          frameloop="demand"
          onError={(err) => {
            console.error(err);
            setHasError(true);
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <pointLight position={[0, 2, 0]} intensity={0.5} />
          
          <ReactorModel />
          
          <OrbitControls 
            autoRotate={false}
            enableZoom
            enablePan
            makeDefault
          />
          
          <color attach="background" args={['#000000']} />
        </Canvas>
      </Suspense>
    </div>
  );
}