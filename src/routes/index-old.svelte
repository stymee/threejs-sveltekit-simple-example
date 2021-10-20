<script lang="ts">
	import '../style.css';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from '$lib/OrbitControlsExt';
	import { CSS2DRenderer, CSS2DObject } from '$lib/CSS2DRendererExt';

	let canvas: HTMLCanvasElement;
	let renderer3d: THREE.WebGLRenderer;
	let div: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.OrthographicCamera;
	let controls: OrbitControls;
	let renderer2d: CSS2DRenderer;
	let toolTip: CSS2DObject;
	let toolTipDiv: HTMLDivElement;
	let mouse: THREE.Vector2;

	const getLabel = (): string => `test label s[${div.clientWidth}x${div.clientHeight}], m[${mouse.x.toFixed(3)},${mouse.y.toFixed(3)}]`;

	const onMouseMove = (e: MouseEvent) => {
		const x = ((e.x - div.clientLeft) / div.clientWidth) * 2 - 1;
		const y = -((e.y - div.clientTop) / div.clientHeight) * 2 + 1;
		mouse.set(x, y);
		
		toolTipDiv.innerText = getLabel();
	};

	const onResize = () => {
		// 3d renderer set to window
		renderer3d.setSize(window.innerWidth, window.innerHeight);
		renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// 2d renderer set to container div
		renderer2d.domElement.style.top = `${div.clientTop}px`;
		renderer2d.domElement.style.left = `${div.clientLeft}px`;
		renderer2d.setSize(div.clientWidth, div.clientHeight);

		// for OrthographicCamera
		const aspect = div.clientWidth / div.clientHeight;
		const frustumSize = 100;
		camera.left = (-frustumSize * aspect) / 2;
		camera.right = (frustumSize * aspect) / 2;
		camera.top = frustumSize / 2;
		camera.bottom = -frustumSize / 2;
		camera.updateProjectionMatrix();

		toolTipDiv.innerText = getLabel();
	};

	onMount(() => {
		mouse = new THREE.Vector2();

		scene = new THREE.Scene();
		scene.add(new THREE.AxesHelper(5));

		const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
		scene.add(box);

		// for OrthographicCamera
		const aspect = div.clientWidth / div.clientHeight;
		const frustumSize = 100;
		camera = new THREE.OrthographicCamera(
			(frustumSize * aspect) / -2,
			(frustumSize * aspect) / 2,
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

		// 3d renderer
		renderer3d = new THREE.WebGLRenderer({
			canvas,
			antialias: true
		});
		renderer3d.setSize(window.innerWidth, window.innerHeight);
		renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// 2d renderer
		renderer2d = new CSS2DRenderer();
		renderer2d.domElement.className = 'css-renderer';
		renderer2d.domElement.style.top = `${div.clientTop}px`;
		renderer2d.domElement.style.left = `${div.clientLeft}px`;
		renderer2d.setSize(div.clientWidth, div.clientHeight);
		div.appendChild(renderer2d.domElement);

		// test label
		toolTipDiv = document.createElement('div');
		toolTipDiv.className = 'css-label';
		toolTipDiv.textContent = `label in ${name}`;
		toolTipDiv.style.marginTop = '-1em';
		toolTip = new CSS2DObject(toolTipDiv);
		toolTip.position.set(2, 2, 2);
		scene.add(toolTip);


		// initial resize to get everything rendered correctly
		onResize();

		// call render/tick
		let frame = requestAnimationFrame(tick);

		function tick() {
			controls.update();
			renderer3d.render(scene, camera);
			renderer2d.render(scene, camera);

			frame = requestAnimationFrame(tick);
		}

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

{#if false}<slot />{/if}

<svelte:window on:resize={onResize} on:mousemove={onMouseMove} />
<canvas bind:this={canvas} />
<div bind:this={div} class="container" />

<style>
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		z-index: 0;
	}

	.container {
		height: 100vh;
		width: 100%;
		position: relative;
	}
</style>
