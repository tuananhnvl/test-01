import { OrbitControls } from './jsm/controls/OrbitControls.js';

import { brainJson, dogonplane, lightbud } from './components/data.js';
import { createJet } from './components/objload.js'; // Import your functions
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/DRACOLoader.js';
import simplexNoise from 'https://cdn.skypack.dev/simplex-noise';
import { data } from './data/store.js'
import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js'



const worker = new Worker('worker.js');
const marginDog = new THREE.Vector3(1.0, 1.0, 1.0)
const marginBrain = new THREE.Vector3(0.0, 2.0, -2.0)
const AMOUNTinstanced = 500
localStorage.setItem('posY', 0)
let stats,scene, camera, renderer,mixer,ModelBlender,animMixerModel 
let totalDuration
const loader = new GLTFLoader();
const curveJet = new THREE.CubicBezierCurve3(
	new THREE.Vector3(0.75, -0.75, 5),
	new THREE.Vector3(-7, 2, -3),
	new THREE.Vector3(3, 2, -5),
	new THREE.Vector3(0, 0, 6)
);
const curveJetLength = curveJet.getLength();


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');

const loaderAnim = new GLTFLoader();
const clock = new THREE.Clock();

console.log(simplexNoise)
function init() {
	//SCENE
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xEEE3CB);
	//CAMERA
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 5;
	//RERENDER
	renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("view-canvas") });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.antialias = false
	//LIGHT
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	scene.add(directionalLight);
	const light = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(light);
	//CONTROLS
	//const controls = new OrbitControls(camera, renderer.domElement);

	//LOAD  MODEL TO ANIM
	loaderAnim.setDRACOLoader(dracoLoader);
	loaderAnim.load('./asset/ufo.glb', function (gltf) {
		console.log(gltf)
		ModelBlender = gltf;
		ModelBlender.scene.position.set(0, -1, 0);
		//model.scale.set(0.005, 0.005, 0.005);
		scene.add(ModelBlender.scene);
	
		animMixerModel = new THREE.AnimationMixer(ModelBlender.scene);
		totalDuration = ModelBlender.animations[12].duration;
		console.log(ModelBlender.animations)
		
		animateModel();

	}, undefined, function (e) {

		console.error(e);

	});

	jetObj()
	instancedConeMesh()
	//curvePath()


	//monitor
	stats = new Stats();
	stats.showPanel(0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom )


	//worker
	worker.addEventListener('message', event => {
		const objectData = event.data.objectData;
		console.log(objectData)
		// Add the object to the scene
		//scene.add(objectData);
	  });
	  worker.postMessage('initializeObject');
}





init()
animate()






function jetObj() {
	const jet = createJet(loader); // Use the createJet function from objects.js
	jet.name = 'jet'
	jet.scale.set(0.2, 0.2, 0.2)
	scene.add(jet)


}
function curvePath() {

	const pointscurveJet = curveJet.getPoints(50);
	const geometryLineCurveJet = new THREE.BufferGeometry().setFromPoints(pointscurveJet);
	const curveJetObject = new THREE.Line(geometryLineCurveJet, new THREE.LineBasicMaterial({ color: 'red' }));
	scene.add(curveJetObject)
}
function instancedConeMesh() {
	const instancedMesh = new THREE.InstancedMesh(undefined, undefined, AMOUNTinstanced);
	const geometryB = new THREE.ConeBufferGeometry(0.04, 0.05, 3);


	const materialB = new THREE.MeshBasicMaterial({ color: 'red' });
	const shaderMaterial = new THREE.ShaderMaterial({

		uniforms: {
			time: { value: 1.0 },
			resolution: { value: new THREE.Vector2() },
			uScroll: { value: 0.0 }
		},

		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent

	});
	instancedMesh.geometry = geometryB
	instancedMesh.material = shaderMaterial

	const dogPosAttribute = new THREE.InstancedBufferAttribute(new Float32Array(dogonplane.dogonplane), 3);
	const brainPosAttribute = new THREE.InstancedBufferAttribute(new Float32Array(brainJson.brainJson), 3);
	const budPosAttribute = new THREE.InstancedBufferAttribute(new Float32Array(lightbud.lightbud), 3);


	// add props to shader
	instancedMesh.geometry.setAttribute('dog_pos', dogPosAttribute);
	instancedMesh.geometry.setAttribute('brain_pos', brainPosAttribute);
	instancedMesh.geometry.setAttribute('bud_pos', budPosAttribute);


	//instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	console.log(instancedMesh, dogPosAttribute)
	scene.add(instancedMesh);
}
function mixVec1ToVec2(posA, posB, t) {
	return new THREE.Vector3(
		posA.x + (posB.x - posA.x) * t,
		posA.y + (posB.y - posA.y) * t,
		posA.z + (posB.z - posA.z) * t
	)
}



function moveCurve(fromtarget, toTarget, progess, count) {
	const curve = new THREE.CubicBezierCurve3(
		fromtarget,
		new THREE.Vector3(5, 4, 0),
		new THREE.Vector3(-5, -4, toTarget.z),
		toTarget,
	);
	return curve.getPointAt(progess);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateInstancedMesh() {
	var processScroll = localStorage.getItem('posY')
	let mesh = scene.children[3]
	//console.log(processScroll)
	if (mesh.material.uniforms) {
		mesh.material.uniforms.uScroll.value = processScroll
	}
	if (mesh && 1 === 3) {
		for (let i = 0; i < AMOUNTinstanced; i++) {

			let positionDog = data[i]['dog'];
			let posBrain = data[i]['brain'];
			let posBud = data[i]['bud'];


			let adjustDog = new THREE.Vector3().copy(positionDog).multiplyScalar(4.8).add(marginDog);
			let adjustBrain = new THREE.Vector3().copy(posBrain).multiplyScalar(0.2).sub(marginBrain);
			let adjustBud = new THREE.Vector3().copy(posBud).multiplyScalar(0.3).sub(marginBrain);
			let interpolatedPosition = new THREE.Vector3();

			if (processScroll < 0.33) {
				const t = processScroll / 0.33;
				//interpolatedPosition = mixVec1ToVec2(adjustDog, adjustBrain, t);
				interpolatedPosition = moveCurve(adjustDog, adjustBrain, t, i);
			} else if (processScroll <= 0.67) {
				const t = (processScroll - 0.33) / 0.34;
				interpolatedPosition = mixVec1ToVec2(adjustBrain, adjustBud, t);
				// interpolatedPosition = moveCurve(adjustBrain,adjustBud,t);
			} else {
				const t = (processScroll - 0.67) / 0.33;
				//interpolatedPosition = mixVec1ToVec2(adjustBud, adjustDog, t);
				interpolatedPosition = moveCurve(adjustBud, adjustDog, t, i);
			}
			let matrix = new THREE.Matrix4()
			matrix.setPosition(interpolatedPosition)
			mesh.setMatrixAt(i, matrix)

			mesh.instanceMatrix.needsUpdate = true;

		}


	}

}
function updateJet() {

	if (scene.children[2]) {

		let currentJetPos = THREE.MathUtils.clamp(
			(localStorage.getItem('posY') / 14) * curveJetLength,
			0,
			curveJetLength
		);
		let targetPos = curveJet.getPointAt(currentJetPos)
		let tangent = curveJet.getTangentAt(currentJetPos);
		let targetPosRocket = targetPos
		let targetRocketlookAt = new THREE.Vector3().copy(scene.children[2].position).add(tangent)
		scene.children[2].position.copy(targetPosRocket);
		scene.children[2].lookAt(targetRocketlookAt); // inclu rote
	}
}
function animate() {
	requestAnimationFrame(animate);
	render();
	//controls.update()
	updateInstancedMesh()
	updateJet()
	animateModel()
	//monitor
	stats.begin()
	stats.end()
	
};

function animateModel() {

	if(animMixerModel) {

		animMixerModel.update(0);

		let animationTime = localStorage.getItem('posY') * totalDuration;
		animMixerModel.clipAction(ModelBlender.animations[12]).play()
		
		if(animationTime == totalDuration) {
			animMixerModel.setTime(totalDuration-0.0005)
		}else{
			animMixerModel.setTime(animationTime)
		}

		ModelBlender.scene.rotation.z +=Math.random()*0.0005 + 0.005
		ModelBlender.scene.rotation.x -=Math.random()*0.0005 + 0.005
		ModelBlender.scene.rotation.y +=Math.random()*0.0005 + 0.005
	}
}
function render() {
	renderer.render(scene, camera);
}










/* console.log('worker-s')
const canvasOffscreen = document.querySelector("#canvas-worker").transferControlToOffscreen();
const workerCode = document.querySelector('#workerCode').textContent;
const blob = new Blob([workerCode], { type: 'text/javascript' });
const url = URL.createObjectURL(blob);
const worker = new Worker(url);
const urlParts = location.href.split('/');
if (urlParts[urlParts.length - 1].indexOf('.') !== -1) {
  urlParts.pop();
}

worker.postMessage({ msg: 'start', origin: urlParts.join('/'), canvas: canvasOffscreen }, [canvasOffscreen]);
URL.revokeObjectURL(url); // cleanup
console.log('worker-endclean') */