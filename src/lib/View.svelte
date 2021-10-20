<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Rect } from '$lib/utils';
	import { getRectFromElem, setRectFromElem } from '$lib/utils';
	import * as THREE from 'three';
	import { CSS2DObject, CSS2DRenderer } from '$lib/CSS2DRendererExt';
	import { OrbitControls } from '$lib/OrbitControlsExt';

	export let name: string;
	export let viewclass: string;

	let rect: Rect;
	let div: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.OrthographicCamera;
	let controls: OrbitControls;
	let renderer2d: CSS2DRenderer;

	export const getRect = (): Rect => rect;
	export const getScene = (): THREE.Scene => scene;
	export const getCamera = (): THREE.OrthographicCamera => camera;
	export const getControls = (): OrbitControls => controls;
	export const getRenderer2d = (): CSS2DRenderer => renderer2d;
	export const updateControls = (): boolean => controls.update();
	export const render2d = (): void => renderer2d.render(scene, camera);

	let helperGroup: THREE.Group;

	let viewPortSize = '';

	let toolTip: CSS2DObject;
	let toolTipDiv: HTMLDivElement;

	onMount(() => {
		rect = getRectFromElem(div);

		scene = new THREE.Scene();
		scene.add(new THREE.AxesHelper(5));
		scene.name = name;

		helperGroup = new THREE.Group();
		helperGroup.name = `helpers`;
		const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
		helperGroup.add(box);
		scene.add(helperGroup);

		// for PerspectiveCamera
		// const camera = new THREE.PerspectiveCamera(5, div.clientWidth / div.clientHeight, 0.001, 10000);
		// camera.position.set(200, 400, 600);
		// camera.aspect = div.clientWidth / div.clientHeight;
		// camera.updateProjectionMatrix();

		// for OrthographicCamera
		const frustumSize = 100;
		camera = new THREE.OrthographicCamera(
			(frustumSize * rect.aspect) / -2,
			(frustumSize * rect.aspect) / 2,
			frustumSize / 2,
			frustumSize / -2,
			0.001,
			100
		);
		camera.position.set(0, 0, 5);
		camera.zoom = 5;

		// controls
		controls = new OrbitControls(camera, div);
		controls.enableDamping = true;
		controls.dampingFactor = 0.8;
		controls.screenSpacePanning = true;
		controls.zoomSpeed = 3;
		controls.enableRotate = true;
		controls.update();

		switch (name) {
			case 'main':
				camera.position.set(20, 40, 60);
				camera.zoom = 1;
				break;
			case 'cavity':
				camera.position.set(-20, 0, 0);
				camera.zoom = 5;
				break;
			case 'plan':
				break;
		}
		controls.saveState();

		
		// 2d renderer
		renderer2d = new CSS2DRenderer();
		renderer2d.domElement.className = 'css-renderer';
		// renderer2d.domElement.style.position = 'absolute';
		renderer2d.domElement.style.top = `${rect.top}px`;
		renderer2d.domElement.style.left = `${rect.left}px`;
		renderer2d.setSize(rect.width, rect.height);
		div.appendChild(renderer2d.domElement);
		//resize();

		//renderer2d.domElement.appendChild(toolTipDiv);
			// // test label
		toolTipDiv = document.createElement('div');
		toolTipDiv.className = 'css-label';
		toolTipDiv.textContent = `label in ${name}`;
		toolTipDiv.style.marginTop = '-1em';
		toolTip = new CSS2DObject(toolTipDiv);
		toolTip.position.set(2, 2, 2);
		scene.add(toolTip);
		if (name === "main") {
			console.log('tooltip', toolTip);
			//debugger;
		}

		viewPortSize = `${rect.width}x${rect.height}`;
	});

	const resetControls = () => {
		controls.reset();
	};

	export const resize = () => {
		setRectFromElem(rect, div);// = getRectFromElem(div);

		renderer2d.domElement.style.top = `${rect.top}px`;
		renderer2d.domElement.style.left = `${rect.left}px`;
		renderer2d.setSize(div.clientWidth, div.clientHeight);

		viewPortSize = `${rect.width}x${rect.height}`;

		// for PerspectiveCamera
		//console.log(`resize ${name} `, rect);
		// camera.aspect = div.clientWidth / div.clientHeight;
		// camera.updateProjectionMatrix();

		// for OrthographicCamera
		const frustumSize = 100;
		camera.left = (-frustumSize * rect.aspect) / 2;
		camera.right = (frustumSize * rect.aspect) / 2;
		camera.top = frustumSize / 2;
		camera.bottom = -frustumSize / 2;
		camera.updateProjectionMatrix();
	};

</script>

<svelte:window on:resize={resize} />
<div bind:this={div} class="viewport {viewclass}">
	<div on:click={resetControls} class="screensize">{viewPortSize}</div>
</div>

<style>
	.viewport {
		/* grid-column: 1 / 2;
		grid-row: 2 / 3; */
		/* height: 100vh;
		width: 100%; */
		position: relative;

		z-index: var(--z-canvas);
		cursor: crosshair;
		/* position: relative; */
		/* border: 1px solid red; */
	}

	.screensize {
		position: absolute;
		bottom: 22px;
		right: 5px;
		font-size: 0.625rem;
		color: var(--c-border);
		z-index: 100;
		cursor: pointer;
		text-align: right;
	}
</style>
