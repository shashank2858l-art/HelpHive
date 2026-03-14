import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

const GlobeScene = () => (
  <div className="h-80 w-full overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-950/50">
    <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 3]} intensity={1.4} />
      <Stars radius={100} depth={50} count={3000} factor={4} />
      <Sphere args={[1, 64, 64]} rotation={[0.4, 0.2, 0]}>
        <meshStandardMaterial color="#2563eb" roughness={0.35} metalness={0.3} />
      </Sphere>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.7} />
    </Canvas>
  </div>
);

export default GlobeScene;
