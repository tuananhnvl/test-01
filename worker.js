/* 



THREE.DRACOLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/DRACOLoader.js');


console.log(new THREE.DRACOLoader())
 */
  
/* const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material); */

// Send the initialized object data back to the main script

self.importScripts( 'https://unpkg.com/three@0.137.5/build/three.module.js' );


self.postMessage({ objectData: 'helo' });