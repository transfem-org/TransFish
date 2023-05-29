<template>
	<div class="_panel ntjkdlsfk" :class="$style.root">
		<div class="container env">
			<div class="body">
				<div class="number _panel">
					<div class="label">Calckey</div>
					<div class="value _monospace">{{ version }}</div>
				</div>
				<div v-if="serverInfo" class="number _panel">
					<div class="label">Node.js</div>
					<div class="value _monospace">{{ serverInfo.node }}</div>
				</div>
				<div v-if="serverInfo" class="number _panel">
					<div class="label">PostgreSQL</div>
					<div class="value _monospace">{{ serverInfo.psql }}</div>
				</div>
				<div v-if="serverInfo" class="number _panel">
					<div class="label">Redis</div>
					<div class="value _monospace">{{ serverInfo.redis }}</div>
				</div>
				<div class="_panel">
					<XPie class="pie" :value="cpuUsage" />
					<div>
						<p><i class="ph-cpu ph-bold ph-lg"></i>CPU</p>
						<p>{{ meta.cpu.cores }} Logical cores</p>
						<p>{{ meta.cpu.model }}</p>
					</div>
				</div>

				<div class="_panel">
					<XPie class="pie" :value="memUsage" />
					<div>
						<p><i class="ph-microchip ph-bold ph-lg"></i>RAM</p>
						<p>Total: {{ bytes(memTotal, 1) }}</p>
						<p>Used: {{ bytes(memUsed, 1) }}</p>
						<p>Free: {{ bytes(memFree, 1) }}</p>
					</div>
				</div>

				<div class="_panel">
					<XPie class="pie" :value="diskUsage" />
					<div>
						<p><i class="ph-hard-drives ph-bold ph-lg"></i>Disk</p>
						<p>Total: {{ bytes(diskTotal, 1) }}</p>
						<p>Free: {{ bytes(diskAvailable, 1) }}</p>
						<p>Used: {{ bytes(diskUsed, 1) }}</p>
					</div>
				</div>

				<div class="_panel">
					<XPie class="pie" :value="meiliProgress" />
					<div>
						<p>
							<i class="ph-file-search ph-bold ph-lg"></i
							>MeiliSearch
						</p>
						<p>
							{{ i18n.ts._widgets.meiliStatus }}:
							{{ meiliAvailable }}
						</p>
						<p>
							{{ i18n.ts._widgets.meiliSize }}:
							{{ bytes(meiliTotalSize, 1) }}
						</p>
						<p>
							{{ i18n.ts._widgets.meiliIndexCount }}:
							{{ meiliIndexCount }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
import XPie from "../../widgets/server-metric/pie.vue";
import bytes from "@/filters/bytes";
import { stream } from "@/stream";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { version } from "@/config";

const meta = await os.api("server-info", {});
const serverStats = await os.api("stats");
const serverInfo = await os.api("admin/server-info");

let cpuUsage: number = $ref(0);

let memUsage: number = $ref(0);
let memTotal: number = $ref(0);
let memUsed: number = $ref(0);
let memFree: number = $ref(0);

let meiliProgress: number = $ref(0);
let meiliTotalSize: number = $ref(0);
let meiliIndexCount: number = $ref(0);
let meiliAvailable: string = $ref("unavailable");

const diskUsage = $computed(() => meta.fs.used / meta.fs.total);
const diskTotal = $computed(() => meta.fs.total);
const diskUsed = $computed(() => meta.fs.used);
const diskAvailable = $computed(() => meta.fs.total - meta.fs.used);

function onStats(stats) {
	cpuUsage = stats.cpu;

	memUsage = stats.mem.active / meta.mem.total;
	memTotal = meta.mem.total;
	memUsed = stats.mem.active;
	memFree = memTotal - memUsed;

	meiliTotalSize = stats.meilisearch.size;
	meiliIndexCount = stats.meilisearch.indexed_count;
	meiliAvailable = stats.meilisearch.health;
	meiliProgress = meiliIndexCount / serverStats.notesCount;
}

const connection = stream.useChannel("serverStats");
onMounted(() => {
	connection.on("stats", onStats);
	connection.dispose();
});

onUnmounted(() => {
	connection.off("stats", onStats);
	connection.dispose();
});
</script>

<style lang="scss" module>
.root {
	padding: 20px;
}

.ntjkdlsfk {
	display: flex;
	padding: 16px;

	&.env {
		> .body {
			display: grid;
			grid-gap: 16px;
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

			> .number {
				padding: 14px 20px;

				> .label {
					opacity: 0.7;
					font-size: 0.8em;
				}

				> .value {
					font-size: 1.1em;
				}
			}

			> .pie {
				height: 82px;
				flex-shrink: 0;
				margin-right: 16px;
			}

			> div {
				flex: 1;

				> p {
					margin: 0;
					font-size: 0.8em;

					&:first-child {
						font-weight: bold;
						margin-bottom: 4px;

						> i {
							margin-right: 4px;
						}
					}
				}
			}
		}
	}
}
</style>
