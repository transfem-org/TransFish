<template>
  <div class="swipeable-views" ref="swipeableViews">
    <div class="swipeable-view" :class="{ 'active': state.index === i }" v-for="(view, i) in props.views" :key="i" ref="view-{{i}}">
      <slot :name="view.name" :data="view.data"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import Hammer from 'hammerjs';

interface View {
  name: string;
  data: any;
}

interface State {
  index: number;
  direction: number | null;
  nextIndex: number | null;
  prevIndex: number | null;
}

const refs = {
  swipeableViews: ref<HTMLElement | null>(null),
};

const props = defineProps({
  views: {
    type: Array as () => View[],
    required: true,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
});

const state = reactive<State>({
  index: props.activeIndex,
  direction: null,
  nextIndex: null,
  prevIndex: null,
});

const moveView = () => {
  if (state.direction !== null) {
    const newIndex = state.index + state.direction;
    if (newIndex >= 0 && newIndex < props.views.length && newIndex !== state.index) {
      state.nextIndex = state.direction === 1 ? newIndex : null;
      state.prevIndex = state.direction === -1 ? newIndex : null;
      const { swipeableViews } = refs;
      const activeView = swipeableViews.value?.children[state.index];
      const newView = swipeableViews.value?.children[newIndex];
      const translateX = state.direction === 1 ? '-100%' : '100%';
      Object.assign(newView.style, { transform: `translateX(${translateX})` });
      Object.assign(newView.classList, { active: true, next: state.direction === 1, prev: state.direction === -1 });
      Object.assign(activeView.classList, { next: state.direction === 1, prev: state.direction === -1 });
      state.index = newIndex;
      setTimeout(() => {
        Object.assign(newView.style, { transform: 'translateX(0)' });
        Object.assign(activeView.style, { transform: `translateX(${translateX})` });
      }, 0);
      setTimeout(() => {
        Object.assign(activeView.classList, { active: false, prev: false, next: false });
        Object.assign(newView.classList, { prev: false, next: false });
        Object.assign(activeView.style, { transform: '' });
        state.nextIndex = null;
        state.prevIndex = null;
      }, 300);
    }
    state.direction = null;
  }
};

// Move to script later
function setView (viewIndex: number) {
  if (viewIndex !== state.index) {
    state.direction = viewIndex > state.index ? 1 : -1;
    moveView();
  }
};

onMounted(() => {
  const swipeableViews = refs.swipeableViews!.value!;
  const hammer = new Hammer(swipeableViews);

  hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

  hammer.on('swipeleft swiperight', (event) => {
    state.direction = event.type === 'swipeleft' ? 1 : -1;
    moveView();
  });
});
</script>

<style lang="scss" scoped>
.swipeable-views {
  display: flex;
  overflow-x: hidden;
  width: 100%;
}

.swipeable-view {
  flex: 1;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-in-out;
  transform: translateX(0);
}

.swipeable-view.active {
  transform: translateX(0);
}

.swipeable-view.next {
  transform: translateX(100%);
}

.swipeable-view.prev {
  transform: translateX(-100%);
}
</style>
