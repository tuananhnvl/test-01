// objects.js
import * as THREE from 'three';


export function createJet(loader) {
  const jet = new THREE.Group();
  loader.load('./asset/Jet.glb', function (gltf) {
    gltf.scene.scale.set(0.025, 0.025, 0.025);
    jet.add(gltf.scene);
  });
  return jet;
}



