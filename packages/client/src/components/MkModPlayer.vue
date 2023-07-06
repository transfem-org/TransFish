<template>
	<div class="mod-player-disabled" v-if="!available">
		<MkLoading />
	</div>
	<div class="mod-player-disabled" v-else-if="hide" @click="toggleVisible()">
		<div>
			<b
				><i class="ph-warning ph-bold ph-lg"></i>
				{{ i18n.ts.sensitive }}</b
			>
			<span>{{ i18n.ts.clickToShow }}</span>
		</div>
	</div>

	<div class="mod-player-enabled" v-else>
		<div class="pattern-display">
			<div class="mod-pattern" ref="modPattern" v-if="patternShow">
				<span
					v-for="(row, i) in patData[currentPattern]"
					ref="initRow"
					v-bind:class="{ modRowActive: isRowActive(i) }"
				>
					<span v-bind:class="{ modColQuarter: i % 4 === 0 }">{{
						indexText(i)
					}}</span>
					<span class="mod-row-inner">{{ getRowText(row) }}</span>
				</span>
			</div>
			<div class="mod-pattern" v-else @click="showPattern()">
				<span class="modRowActive" ref="initRow">
					<span class="modColQuarter">00</span>
					<span class="mod-row-inner">|C-41Cv14XEF</span>
				</span>
				<br />
				<p>{{ i18n.ts.clickToShowPatterns }}</p>
			</div>
		</div>
		<div class="controls">
			<button class="play" @click="playPause()">
				<i class="ph-pause ph-fill ph-lg" v-if="playing"></i>
				<i class="ph-play ph-fill ph-lg" v-else></i>
			</button>
			<button class="stop" @click="stop()">
				<i class="ph-stop ph-fill ph-lg"></i>
			</button>
			<FormRange
				class="progress"
				:min="0"
				:max="length"
				v-model="position"
				:step="0.1"
				ref="progress"
				:background="false"
				:tooltips="false"
				:instant="true"
				@update:modelValue="performSeek()"
			></FormRange>
			<button class="mute" @click="toggleMute()">
				<i class="ph-speaker-simple-x ph-fill ph-lg" v-if="muted"></i>
				<i class="ph-speaker-simple-high ph-fill ph-lg" v-else></i>
			</button>
			<FormRange
				:min="0"
				:max="1"
				v-model="player.context.gain.value"
				:step="0.1"
				:background="false"
				:tooltips="false"
				:instant="true"
				@update:modelValue="updateMute()"
			></FormRange>
			<a
				class="download"
				:title="i18n.ts.download"
				:href="module.url"
				target="_blank"
			>
				<i class="ph-download-simple ph-fill ph-lg"></i>
			</a>
		</div>
		<div class="buttons">
			<button
				v-if="module.comment"
				v-tooltip="i18n.ts.alt"
				class="_button"
				@click.stop="captionPopup"
			>
				<i class="ph-subtitles ph-bold ph-lg"></i>
			</button>
			<button
				v-if="!hide"
				v-tooltip="i18n.ts.hide"
				class="_button"
				@click.stop="toggleVisible()"
			>
				<i class="ph-eye-slash ph-bold ph-lg"></i>
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, nextTick, onDeactivated, onMounted } from "vue";
import * as calckey from "calckey-js";
import FormRange from "./form/range.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { ChiptuneJsPlayer, ChiptuneJsConfig } from "@/scripts/chiptune2";

const props = defineProps<{
	module: calckey.entities.DriveFile;
}>();

interface ModRow {
	notes: string[];
	insts: string[];
	vols: string[];
	fxs: string[];
	ops: string[];
}

const available = ref(false);
const initRow = shallowRef<HTMLSpanElement>();
const player = shallowRef(new ChiptuneJsPlayer(new ChiptuneJsConfig()));
let hide = ref(
	defaultStore.state.nsfw === "force"
		? true
		: props.module.isSensitive && defaultStore.state.nsfw !== "ignore"
);
let playing = ref(false);
let patternShow = ref(false);
let modPattern = ref<HTMLDivElement>();
let progress = ref<FormRange>();
let position = ref(0);
let patData = shallowRef([] as ModRow[][]);
let currentPattern = ref(0);
let nbChannels = ref(0);
let length = ref(1);
let muted = ref(false);

const loaded = !!window.libopenmpt;

onMounted(() => {
	if (loaded) {
		available.value = true;
		player.value
			.load(props.module.url)
			.then((result: null) => {
				buffer = result;
			})
			.catch((error: any) => {
				console.error(error);
			});
	} else {
		document.head
			.appendChild(
				Object.assign(document.createElement("script"), {
					async: true,
					src: "/client-assets/libopenmpt.js",
				})
			)
			.addEventListener("load", () => {
				available.value = true;
				window.libopenmpt = window.Module;
				player.value
					.load(props.module.url)
					.then((result: null) => {
						buffer = result;
					})
					.catch((error: any) => {
						console.error(error);
					});
			});
	}
});

let currentRow = 0;
let rowHeight = 0;
let buffer = null;
let isSeeking = false;

function captionPopup() {
	os.alert({
		type: "info",
		text: props.module.comment,
	});
}

function showPattern() {
	patternShow.value = !patternShow.value;
	nextTick(() => {
		if (playing.value) display();
		else stop();
	});
}

function getRowText(row: ModRow) {
	let text = "";
	for (let i = 0; i < row.notes.length; i++) {
		text = text.concat(
			"|",
			row.notes[i],
			row.insts[i],
			row.vols[i],
			row.fxs[i],
			row.ops[i]
		);
	}
	return text;
}

function playPause() {
	player.value.addHandler("onRowChange", (i: { index: number }) => {
		currentRow = i.index;
		currentPattern.value = player.value.getPattern();
		length.value = player.value.duration();
		if (!isSeeking) {
			position.value = player.value.position() % player.value.duration();
		}
		requestAnimationFrame(display);
	});

	player.value.addHandler("onEnded", () => {
		stop();
	});

	if (player.value.currentPlayingNode === null) {
		player.value.play(buffer);
		player.value.seek(position.value);
		playing.value = true;
	} else {
		player.value.togglePause();
		playing.value = !player.value.currentPlayingNode.paused;
	}
}

function stop(noDisplayUpdate = false) {
	player.value.stop();
	playing.value = false;
	if (!noDisplayUpdate) {
		try {
			player.value.play(buffer);
			display(0, true);
		} catch (e) {
			console.warn(e);
		}
	}
	player.value.stop();
	position.value = 0;
	currentRow = 0;
	player.value.clearHandlers();
}

let savedVolume = 0;

function toggleMute() {
	if (muted.value) {
		player.value.context.gain.value = savedVolume;
		savedVolume = 0;
	} else {
		savedVolume = player.value.context.gain.value;
		player.value.context.gain.value = 0;
	}
	muted.value = !muted.value;
}

function updateMute() {
	muted.value = false;
	savedVolume = 0;
}

function performSeek() {
	player.value.seek(position.value);
	display();
}

function toggleVisible() {
	hide.value = !hide.value;
	nextTick(() => {
		stop(hide.value);
	});
}

function isRowActive(i: number) {
	if (i === currentRow) {
		if (modPattern.value) {
			if (rowHeight === 0 && initRow.value)
				rowHeight = initRow.value[0].getBoundingClientRect().height;
			modPattern.value.scrollTop = currentRow * rowHeight;
		}
		return true;
	}
	return;
}

function indexText(i: number) {
	let rowText = parseInt(i).toString(16);
	if (rowText.length === 1) {
		rowText = "0" + rowText;
	}
	return rowText;
}

function getRow(pattern: number, rowOffset: number) {
	let notes: string[] = [],
		insts: string[] = [],
		vols: string[] = [],
		fxs: string[] = [],
		ops: string[] = [];

	for (let channel = 0; channel < nbChannels.value; channel++) {
		const part = player.value.getPatternRowChannel(
			pattern,
			rowOffset,
			channel
		);

		notes.push(part.substring(0, 3));
		insts.push(part.substring(4, 6));
		vols.push(part.substring(6, 9));
		fxs.push(part.substring(10, 11));
		ops.push(part.substring(11, 13));
	}

	return {
		nbChannels: nbChannels.value,
		notes,
		insts,
		vols,
		fxs,
		ops,
	};
}

function display(_time = 0, reset = false) {
	if (!patternShow.value) return;

	if (reset) {
		const pattern = player.value.getPattern();
		currentPattern.value = pattern;
	}

	if (patData.value.length === 0) {
		const nbPatterns = player.value.getNumPatterns();
		const pattern = player.value.getPattern();

		currentPattern.value = pattern;

		if (player.value.currentPlayingNode) {
			nbChannels.value = player.value.currentPlayingNode.nbChannels;
		}

		const patternsArray: ModRow[][] = [];

		for (let patOffset = 0; patOffset < nbPatterns; patOffset++) {
			const rowsArray: ModRow[] = [];
			const nbRows = player.value.getPatternNumRows(patOffset);
			for (let rowOffset = 0; rowOffset < nbRows; rowOffset++) {
				rowsArray.push(getRow(patOffset, rowOffset));
			}
			patternsArray.push(rowsArray);
		}

		patData.value = Object.freeze(patternsArray);
	}
}

onDeactivated(() => {
	stop();
});
</script>

<style lang="scss" scoped>
.mod-player-enabled {
	position: relative;
	display: flex;
	flex-direction: column;

	> i {
		display: block;
		position: absolute;
		border-radius: 6px;
		background-color: var(--fg);
		color: var(--accentLighten);
		font-size: 14px;
		opacity: 0.5;
		padding: 3px 6px;
		text-align: center;
		cursor: pointer;
		top: 12px;
		right: 12px;
	}

	> .buttons {
		display: flex;
		gap: 4px;
		position: absolute;
		border-radius: 6px;
		overflow: hidden;
		top: 12px;
		right: 12px;
		> * {
			background-color: var(--accentedBg);
			-webkit-backdrop-filter: var(--blur, blur(15px));
			backdrop-filter: var(--blur, blur(15px));
			color: var(--accent);
			font-size: 0.8em;
			padding: 6px 8px;
			text-align: center;
		}
	}

	> .pattern-display {
		width: 100%;
		height: 100%;
		overflow: hidden;
		color: #ffffff;
		background-color: black;
		text-align: center;
		font: 12px monospace;
		white-space: pre;
		user-select: none;

		> .mod-pattern {
			display: grid;
			overflow-y: hidden;
			height: 0;
			padding-top: 25%;
			padding-bottom: 25%;
			content-visibility: auto;

			> .modRowActive {
				opacity: 1;
			}

			> span {
				opacity: 0.5;

				> .modColQuarter {
					color: #ffff00;
				}

				> .mod-row-inner {
					background: repeating-linear-gradient(
						to right,
						white 0 4ch,
						#80e0ff 4ch 6ch,
						#80ff80 6ch 9ch,
						#ff80e0 9ch 10ch,
						#ffe080 10ch 12ch
					);
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				}
			}
		}
	}

	> .controls {
		display: flex;
		width: 100%;
		background-color: var(--panelHighlight);

		> * {
			padding: 4px 8px;
		}

		> button,
		a {
			border: none;
			background-color: transparent;
			color: var(--navFg);
			cursor: pointer;
			margin: auto;

			&:hover {
				background-color: var(--accentedBg);
				border-radius: 3px;
			}
		}

		> .progress {
			flex-grow: 1;
			min-width: 0;
		}
	}
}

.mod-player-disabled {
	display: flex;
	justify-content: center;
	align-items: center;
	background: #111;
	color: #fff;

	> div {
		display: table-cell;
		text-align: center;
		font-size: 12px;

		> b {
			display: block;
		}
	}
}
</style>
