import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import {
  Canvas,
  PerspectiveCameraProps,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import { Mesh, MeshStandardMaterial, CubeTextureLoader, Group } from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

interface Props {
  position: [number, number, number];
}

function Box(props: Props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef({} as Mesh);

  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (mesh.current.rotation.y += 0.0));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh {...props} ref={mesh} scale={1}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color={"orange"} />
    </mesh>
  );
}

interface NameProps {}
const Name: React.FC<NameProps> = React.memo(({}) => {
  const nameRef = useRef({} as Group);
  useFrame((state, delta) => (nameRef.current.rotation.y += 0.02));
  const fbx = useLoader(FBXLoader, "name.fbx");
  var cubeTextureLoader = new CubeTextureLoader();
  const envMap = cubeTextureLoader.load([
    "cubeMap.jpg",
    "cubeMap.jpg",
    "cubeMap.jpg",
    "cubeMap.jpg",
    "cubeMap.jpg",
    "cubeMap.jpg",
  ]);
  const matAluMedium = new MeshStandardMaterial({
    color: "#001536",
    roughness: 0.6,
    metalness: 1,
    envMap,
  });
  fbx.traverse(function (child) {
    if (child instanceof Mesh) {
      child.material = matAluMedium;
    }
  });
  return (
    <>
      <group ref={nameRef} position={[0, 0, 0]}>
        <primitive
          object={fbx}
          scale={0.02}
          position={[-0.5, 0, -0.1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    </>
  );
});

const mapScrollValue = (value: number) => {
  if (value < 450) {
    return { section1: value, section2: 0, section3: 0 };
  } else if (value < 600) {
    return { section1: 450, section2: value - 450, section3: 0 };
  } else {
    return { section1: 450, section2: 600, section3: value - 600 };
  }
};

interface ViewProps {
  scroll: number;
}

const View: React.FC<ViewProps> = React.memo(({ scroll }) => {
  const cameraRef = useRef({} as Group);
  // useFrame((state, delta) => {
  //   cameraRef.current.rotation.y += 0.01;
  // });

  return (
    <>
      <group
        name="Camera"
        ref={cameraRef}
        position={[0, 0, 5 + mapScrollValue(scroll).section1 / 100]}
        rotation={[0, mapScrollValue(scroll).section3 / 10000, 0]}
      >
        <PerspectiveCamera makeDefault far={100} near={0.1} fov={22.9} />
      </group>
      <ambientLight />
      <pointLight position={[0, 0, 10]} />
      <Name />
      {/* <Box position={[0, 0, 0]} /> */}
    </>
  );
});

const Three: React.FC = React.memo(() => {
  const [scroll, setScroll] = useState(0);

  const handleScroll = () => {
    setScroll(window.scrollY);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    console.log(scroll);
  }, [scroll]);

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
        }}
      >
        <Canvas>
          <Suspense fallback={null}>
            <View scroll={scroll} />
          </Suspense>
        </Canvas>
      </div>
      <div
        style={{ width: "100vw", height: "1000vh", backgroundColor: "#cdd3da" }}
      ></div>
    </>
  );
});

export default Three;
