<script lang="ts">
	import '../style.css';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import View from '$lib/View.svelte';

	let canvas: HTMLCanvasElement;
	let renderer3d: THREE.WebGLRenderer;
	let mouse: THREE.Vector2;

	let mainView: View;
	let cavityView: View;
	let planView: View;

	let debugtext: string = '';

	const getLabel = (): string => `test label s[${window.innerWidth}x${window.innerHeight}], m[${mouse.x.toFixed(3)},${mouse.y.toFixed(3)}]`;

	const onMouseMove = (e: MouseEvent) => {
		var rect;
		if (e.x <= cavityView.getRect().left && e.y >= mainView.getRect().top) {
			rect = mainView.getRect();
		} else if (e.x > cavityView.getRect().left) {
			rect = cavityView.getRect();
		} else {
			rect = planView.getRect();
		}
		const x = ((e.x - rect.left) / rect.width) * 2 - 1;
		const y = -((e.y - rect.top) / rect.height) * 2 + 1;
		mouse.set(x, y);
		debugtext = getLabel();
	};

	const onResize = () => {
		// 3d renderer set to window
		renderer3d.setSize(window.innerWidth, window.innerHeight);
		renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		debugtext = getLabel();
	};

	onMount(() => {
		mouse = new THREE.Vector2();

		// 3d renderer
		renderer3d = new THREE.WebGLRenderer({
			canvas,
			antialias: true
		});
		renderer3d.setSize(window.innerWidth, window.innerHeight);
		renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// initial resize to get everything rendered correctly
		onResize();
		mainView.resize();
		cavityView.resize();
		planView.resize();

		// call render/tick
		let frame = requestAnimationFrame(tick);

		function tick() {
			renderer3d.setScissorTest(false);
			renderer3d.clear(true, true);
			renderer3d.setScissorTest(true);
			for (let v of [mainView, cavityView, planView]) {
				const rect = v.getRect();
				v.updateControls();

				const yBot = canvas.clientHeight - rect.bottom;
				renderer3d.setScissor(rect.left, yBot, rect.width, rect.height);
				renderer3d.setViewport(rect.left, yBot, rect.width, rect.height);
				renderer3d.render(v.getScene(), v.getCamera());

				v.render2d();
			}

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
<div class="container">
	<View bind:this={mainView} name="main" viewclass="view-main"/>
	<View bind:this={cavityView} name="cavity" viewclass="view-cavity"/>
	<View bind:this={planView} name="plan" viewclass="view-plan"/>
</div>
<div class="debug">
	{debugtext}
</div>

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
		display: grid;
		grid-template-columns: 8fr minmax(300px, 3fr);
		grid-template-rows: 50px 1fr;
	}

	.debug {
		position: absolute;
		bottom: 5px;
		left: 10px;
		width: 400px;
		height: 20px;
		color: var(--c-border);
	}
</style>
