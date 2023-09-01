<template>
	<div class="lzyxtsnt">
		<ImgWithBlurhash
			v-if="image"
			:hash="image.blurhash"
			:src="image.url"
			:alt="image.comment"
			:title="image.comment"
			:cover="false"
		/>
	</div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import ImgWithBlurhash from "@/components/MkImgWithBlurhash.vue";
import type { ImageBlock } from "@/scripts/hpml/block";
import type { Hpml } from "@/scripts/hpml/evaluator";

const props = defineProps<{
	block: PropType<ImageBlock>;
	hpml: PropType<Hpml>;
}>();

const image = props.hpml.page.attachedFiles.find(
	(x) => x.id === props.block.fileId,
);
</script>

<style lang="scss" scoped>
.lzyxtsnt {
	display: flex;
	justify-content: center;
}
</style>
