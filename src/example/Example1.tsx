import { useTexture } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';
import { Fluid } from '../../lib/Fluid';
import { ThreeTunnel } from './tunel';

import img from '@/assets/img.jpg';
import Text from './Text';

import { useRef } from 'react';
import * as THREE from 'three';


const Image = () => {
    const texture = useTexture(img);
    const meshRef = useRef<THREE.Mesh>(null!);

    return (
        <mesh ref={meshRef} position-z={-4}>
            <planeGeometry args={[7, 10, 20, 20]} />
            <meshBasicMaterial map={texture} color="#c4b4d2" />
        </mesh>
    );
};


const Example1 = () => {
    return (
        <ThreeTunnel.In>
            <Text />
            <Image />
            <EffectComposer>
                <Fluid />
            </EffectComposer>
        </ThreeTunnel.In>
    );
};

export default Example1;
