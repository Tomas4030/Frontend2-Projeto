"use client";
import * as THREE from "three";
import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const fragmentShader = `
uniform vec2 iResolution;
uniform float iTime;

// Helper function: clamped hyperbolic tangent
vec2 stanh(vec2 a) {
    return tanh(clamp(a, -40.,  40.));
}

void mainImage( out vec4 o, vec2 u )
{
    vec2 v = iResolution.xy;
         u = .2*(u+u-v)/v.y;    
         
    vec4 z = o = vec4(1,2,3,0);
     
    for (float a = .5, t = iTime, i; 
         ++i < 19.; 
         o += (1. + cos(z+t)) 
            / length((1.+i*dot(v,v)) 
                   * sin(1.5*u/(.5-dot(u,u)) - 9.*u.yx + t))
         )  
        v = cos(++t - 7.*u*pow(a += .03, i)) - 5.*u, 
        // use stanh here if shader has black artifacts
        //   vvvv
        u += tanh(40. * dot(u *= mat2(cos(i + .02*t - vec4(0,11,33,0)))
                           ,u)
                      * cos(1e2*u.yx + t)) / 2e2
           + .2 * a * u
           + cos(4./exp(dot(o,o)/1e2) + t) / 3e2;
              
     o = 25.6 / (min(o, 13.) + 164. / o) 
       - dot(u, u) / 250.;
}


void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
`;

const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const ShaderBackground = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { size, camera } = useThree();


  const shaderMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        iResolution: { value: new THREE.Vector2(size.width, size.height) },
        iTime: { value: 0 }
      },
      fragmentShader,
      vertexShader
    })
  );


  useFrame(() => {
    if (meshRef.current) {

      shaderMaterial.current.uniforms.iTime.value = performance.now() * 0.001;
    }
  });


  useEffect(() => {

    shaderMaterial.current.uniforms.iResolution.value.set(
      size.width,
      size.height
    );


    const aspect = size.width / size.height;



    const frustumHeight = 2;
    const visibleHeight = frustumHeight / (camera as THREE.OrthographicCamera).zoom;
    const visibleWidth = aspect * visibleHeight;

    if (meshRef.current) {

      meshRef.current.geometry.dispose();

      meshRef.current.geometry = new THREE.PlaneGeometry(
        visibleWidth,
        visibleHeight
      );
    }
  }, [size, (camera as THREE.OrthographicCamera).zoom]);

  return (
    <mesh ref={meshRef}>
      {}
      <planeGeometry args={[1, 1]} /> 
      {}
      <primitive object={shaderMaterial.current} attach="material" />
    </mesh>);

};

export default function ElectroBackground() {
  return (
    <div className="relative min-h-screen w-full ">
      {}
      <div className="absolute inset-0 z-0">
        <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
          {}
          <ShaderBackground />
        </Canvas>
      </div>

    </div>);

}