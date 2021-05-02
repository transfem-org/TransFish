<template>
<div class="dkjvrdxtkvqrwmhfickhndpmnncsgacq" v-hotkey.global="keymap">
	<div class="bg" @click="close"></div>

	<img ref="img" :src="img.url" :alt="img.name" :title="img.name" @click="close" @load="loaded" v-touch:swipe.left="next" v-touch:swipe.right="prev"/>
	<img v-if="prevImg" ref="prevImg" class="prev" :src="prevImg.url" :alt="prevImg.name" :title="prevImg.name"/>
	<img v-if="nextImg" ref="nextImg" class="next" :src="nextImg.url" :alt="nextImg.name" :title="nextImg.name"/>

	<button v-if="isMultiple && !isFirst" class="prev" @click="prev">
		<fa :icon="faChevronLeft"/>
	</button>
	<button v-if="isMultiple" class="next" @click="next">
		<fa :icon="isLast ? faAngleDoubleLeft : faChevronRight"/>
	</button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import anime from 'animejs';
import { faChevronLeft, faChevronRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';

export default Vue.extend({
	props: {
		image: {
			type: Object,
			required: false
		},
		images: {
			type: Array,
			required: false
		},
		index: {
			type: Number,
			required: false,
			default: 0
		}
	},
	data() {
		return {
			currentIndex: 0,
			prevImg: null,
			nextImg: null,
			faChevronLeft, faChevronRight, faAngleDoubleLeft
		}
	},
	created() {
		if (this.image) {
			this.images = [this.image];
			this.currentIndex = 0;
		} else {
			this.currentIndex = this.index;
		}
	},
	mounted() {
		anime({
			targets: this.$el,
			opacity: 1,
			duration: 100,
			easing: 'linear'
		});
	},
	computed: {
		img(): any {
			return this.images[this.currentIndex];
		},
		isMultiple() {
			return this.images.length > 1;
		},
		isFirst() {
			return this.currentIndex === 0;
		},
		isLast() {
			return this.currentIndex === this.images.length - 1;
		},
		keymap(): any {
			return {
				'esc': this.close,
				'left': this.prev,
				'right': this.next,
			};
		}
	},
	methods: {
		loaded() {
			(this.$refs.img as HTMLImageElement).style.opacity = '1';
		},
		prev() {
			const prevIndex = !this.isMultiple ? 0 : this.isFirst ? this.images.length - 1 : this.currentIndex - 1;
			this.prevImg = this.images[prevIndex];

			this.$nextTick(() => {
				anime({
					targets: this.$refs.img,
					left: '100%',
					duration: 500,
					easing: 'easeOutSine',
				}).finished.then(() => {
					this.currentIndex = prevIndex;
					this.prevImg = null;
					(this.$refs.prevImg as HTMLImageElement).style.left = '-200%';
					(this.$refs.img as HTMLImageElement).style.left = '0';
				});

				anime({
					targets: this.$refs.prevImg,
					left: '0',
					duration: 500,
					easing: 'easeOutSine',
				}).finished.then(() => {
				});
			});
		},
		next() {
			const nextIndex = !this.isMultiple ? 0 : this.isLast ? 0 : this.currentIndex + 1;
			this.nextImg = this.images[nextIndex];

			const duration = nextIndex === 0 ? 0 : 500;

			this.$nextTick(() => {
				anime({
					targets: this.$refs.img,
					left: '-200%',
					duration,
					easing: 'easeOutSine',
				}).finished.then(() => {
					this.currentIndex = nextIndex;
					this.nextImg = null;
					(this.$refs.img as HTMLImageElement).style.left = '0';
					(this.$refs.nextImg as HTMLImageElement).style.left = '100%';
				});

				anime({
					targets: this.$refs.nextImg,
					left: '0',
					duration,
					easing: 'easeOutSine',
				});
			});

		},
		close() {
			anime({
				targets: this.$el,
				opacity: 0,
				duration: 100,
				easing: 'linear',
				complete: () => this.destroyDom()
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.dkjvrdxtkvqrwmhfickhndpmnncsgacq
	display block
	position fixed
	z-index 2048
	top 0
	left 0
	width 100%
	height 100%
	opacity 0

	> .bg
		display block
		position fixed
		z-index 1
		top 0
		left 0
		width 100%
		height 100%
		background rgba(#000, 0.7)

	>>> img
		position fixed
		z-index 2
		top 0
		right 0
		bottom 0
		left 0
		max-width 90%
		max-height 90%
		margin auto
		cursor zoom-out
		image-orientation from-image

		&.next
			left 100%

		&.prev
			left -200%

	> button
		position fixed
		top 50%
		z-index 4096
		display flex
		align-items center
		justify-content center
		color #fff
		opacity 0.6
		margin-top -25px

		> svg
			height 50px
			width 50px

		&.prev
			left 0
			margin-left -10px

		&.next
			right 0
			margin-top -25px
			margin-right -10px

</style>
