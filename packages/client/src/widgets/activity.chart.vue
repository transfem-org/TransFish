<template>
	<svg
		:viewBox="`0 0 ${viewBoxX} ${viewBoxY}`"
		@mousedown.prevent="onMousedown"
	>
		<polyline
			:points="pointsNote"
			fill="none"
			stroke-width="1"
			stroke="#c4a7e7"
		/>
		<polyline
			:points="pointsReply"
			fill="none"
			stroke-width="1"
			stroke="#eb6f92"
		/>
		<polyline
			:points="pointsRenote"
			fill="none"
			stroke-width="1"
			stroke="#ebbcba"
		/>
		<polyline
			:points="pointsTotal"
			fill="none"
			stroke-width="1"
			stroke="#6e6a86"
			stroke-dasharray="2 2"
		/>
	</svg>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
	activity: any[];
}>();

const viewBoxX: number = ref(147);
const viewBoxY: number = ref(60);
const zoom: number = ref(1);
const pos: number = ref(0);
const pointsNote: any = ref(null);
const pointsReply: any = ref(null);
const pointsRenote: any = ref(null);
const pointsTotal: any = ref(null);

function dragListen(fn) {
	window.addEventListener("mousemove", fn);
	window.addEventListener("mouseleave", dragClear.bind(null, fn));
	window.addEventListener("mouseup", dragClear.bind(null, fn));
}

function dragClear(fn) {
	window.removeEventListener("mousemove", fn);
	window.removeEventListener("mouseleave", dragClear);
	window.removeEventListener("mouseup", dragClear);
}

function onMousedown(ev) {
	const clickX = ev.clientX;
	const clickY = ev.clientY;
	const baseZoom = zoom.value;
	const basePos = pos.value;

	// 動かした時
	dragListen((me) => {
		const moveLeft = me.clientX - clickX;
		const moveTop = me.clientY - clickY;

		zoom.value = Math.max(1, baseZoom + -moveTop / 20);
		pos.value = Math.min(0, basePos + moveLeft);
		if (
			pos.value <
			-((props.activity.length - 1) * zoom.value - viewBoxX.value)
		)
			pos.value = -(
				(props.activity.length - 1) * zoom.value -
				viewBoxX.value
			);

		render();
	});
}

function render() {
	const peak = Math.max(...props.activity.map((d) => d.total));
	if (peak !== 0) {
		const activity = props.activity.slice().reverse();
		pointsNote.value = activity
			.map(
				(d, i) =>
					`${i * zoom.value + pos.value},${
						(1 - d.notes / peak) * viewBoxY.value
					}`,
			)
			.join(" ");
		pointsReply.value = activity
			.map(
				(d, i) =>
					`${i * zoom.value + pos.value},${
						(1 - d.replies / peak) * viewBoxY.value
					}`,
			)
			.join(" ");
		pointsRenote.value = activity
			.map(
				(d, i) =>
					`${i * zoom.value + pos.value},${
						(1 - d.renotes / peak) * viewBoxY.value
					}`,
			)
			.join(" ");
		pointsTotal.value = activity
			.map(
				(d, i) =>
					`${i * zoom.value + pos.value},${
						(1 - d.total / peak) * viewBoxY.value
					}`,
			)
			.join(" ");
	}
}
</script>

<style lang="scss" scoped>
svg {
	display: block;
	padding: 16px;
	width: 100%;
	box-sizing: border-box;
	cursor: all-scroll;
}
</style>
