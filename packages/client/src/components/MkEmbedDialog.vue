<template>
	<MkModal
		ref="modal"
		:z-priority="'middle'"
		@click="$refs.modal.close()"
		@closed="$emit('closed')"
	>
		<div :class="$style.root">
			<div :class="$style.title">
				<p>{{ i18n.ts.embedDescription }}</p>
				<MkCode :code="codeblock" lang="html" :inline="false"/>
				<br/>
				<MkButton
					:class="$style.gotIt"
					primary
					full
					@click="copyToClipboard(codeblock); $refs.modal.close()"
					>{{ i18n.ts.copyContent }}
				</MkButton>
				<MkButton
					primary
					full
					@click="$refs.modal.close()"
					>{{ i18n.ts.gotIt }}
				</MkButton>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import MkModal from "@/components/MkModal.vue";
import MkButton from "@/components/MkButton.vue";
import MkCode from "@/components/MkCode.vue";
import { i18n } from "@/i18n";
import { host } from "@/config";
import copyToClipboard from "@/scripts/copy-to-clipboard";

const modal = shallowRef<InstanceType<typeof MkModal>>();

const props = withDefaults(
	defineProps<{
		id: string;
	}>(),
	{
		id: "No ID provided!",
	}
);

const codeblock = `<iframe src="https://${host}/notes/${props.id}/embed" class="embed" style="max-width: 100%; border: 0" width="400" allowfullscreen="allowfullscreen"></iframe><scr` + `ipt src="https://${host}/static-assets/embed.js" async="async"></scr` + `ipt>`;
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);
}

.title {
	font-weight: bold;
}

.version {
	margin: 1em 0;
}

.gotIt {
	margin: 8px 0 0 0;
}

.releaseNotes {
	> img {
		border-radius: 10px;
	}
}
</style>
