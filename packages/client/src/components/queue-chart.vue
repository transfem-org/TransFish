<template>
<canvas ref="chartEl"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import {
	Chart,
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	LineController,
	CategoryScale,
	LinearScale,
	TimeScale,
	Legend,
	Title,
	Tooltip,
	SubTitle,
	Filler,
} from 'chart.js';
import number from '@/filters/number';
import * as os from '@/os';
import { defaultStore } from '@/store';

Chart.register(
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	LineController,
	CategoryScale,
	LinearScale,
	TimeScale,
	Legend,
	Title,
	Tooltip,
	SubTitle,
	Filler,
);

const props = defineProps<{
	domain: string,
	connection: any,
}>();

const chartEl = ref<HTMLCanvasElement>(null);

const gridColor = defaultStore.state.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

// フォントカラー
Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--fg');

onMounted(() => {
	const chartInstance = new Chart(chartEl.value, {
		type: 'line',
		data: {
			labels: [],
			datasets: [{
				label: 'Process',
				pointRadius: 0,
				tension: 0,
				borderWidth: 2,
				borderJoinStyle: 'round',
				borderColor: '#9ccfd8',
				backgroundColor: '#9ccfd81A',
				data: []
			}, {
				label: 'Active',
				pointRadius: 0,
				tension: 0,
				borderWidth: 2,
				borderJoinStyle: 'round',
				borderColor: '#31748f',
				backgroundColor: '#31748f1A',
				data: []
			}, {
				label: 'Waiting',
				pointRadius: 0,
				tension: 0,
				borderWidth: 2,
				borderJoinStyle: 'round',
				borderColor: '#f6c177',
				backgroundColor: '#f6c1771A',
				yAxisID: 'y2',
				data: []
			}, {
				label: 'Delayed',
				pointRadius: 0,
				tension: 0,
				borderWidth: 2,
				borderJoinStyle: 'round',
				borderColor: '#eb6f92',
				borderDash: [5, 5],
				fill: false,
				yAxisID: 'y2',
				data: []
			}],
		},
		options: {
			aspectRatio: 2.5,
			layout: {
				padding: {
					left: 16,
					right: 16,
					top: 16,
					bottom: 8,
				},
			},
			scales: {
				x: {
					grid: {
						display: true,
						color: gridColor,
						borderColor: '#1f1d2e',
					},
					ticks: {
						display: false,
						maxTicksLimit: 10
					},
				},
				y: {
					min: 0,
					stack: 'queue',
					stackWeight: 2,
					grid: {
