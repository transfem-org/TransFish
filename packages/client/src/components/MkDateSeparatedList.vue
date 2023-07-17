<script lang="ts">
import type { PropType } from "vue";
import { TransitionGroup, defineComponent, h, ref } from "vue";
import MkAd from "@/components/global/MkAd.vue";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import { getScrollContainer } from "@/scripts/scroll";

export default defineComponent({
	props: {
		items: {
			type: Array as PropType<
				{ id: string; createdAt: string; _shouldInsertAd_: boolean }[]
			>,
			required: true,
		},
		direction: {
			type: String,
			required: false,
			default: "down",
		},
		reversed: {
			type: Boolean,
			required: false,
			default: false,
		},
		noGap: {
			type: Boolean,
			required: false,
			default: false,
		},
		noAutoupdate: {
			type: Boolean,
			required: false,
			default: false,
		},
		ad: {
			type: Boolean,
			required: false,
			default: false,
		},
	},

	setup(props, { slots, expose }) {
		function getDateText(time: string) {
			const date = new Date(time).getDate();
			const month = new Date(time).getMonth() + 1;
			return i18n.t("monthAndDay", {
				month: month.toString(),
				day: date.toString(),
			});
		}

		if (props.items.length === 0) return;

		let lastRenderedDate = ref(props.items[0].createdAt);
		let newPostsCount = 0;
		let lastTopPostId: null | string = null;

		const scrollToLastTopPost = (element: HTMLElement) => {
			if (lastTopPostId) {
				const closestTimeline = element.closest(".sqadhkmv");
				if (closestTimeline) {
					const elem = closestTimeline.querySelector(
						`[id="${lastTopPostId}"]`,
					);
					if (elem instanceof HTMLElement) {
						setTimeout(
							() => {
								let scrollContainer:
									| HTMLElement
									| Window
									| null = getScrollContainer(elem);
								let prop = "scrollTop";
								if (!scrollContainer) {
									scrollContainer = window;
									prop = "scrollY";
								}
								if (scrollContainer) {
									const top =
										elem.getBoundingClientRect().top +
										scrollContainer[prop] -
										80; /* minus 80 pixels to show part of lowest new post and so old post wouldn't end up under the header (probably scroll-margin/scroll-padding would be better) */
									scrollContainer.scrollTo({
										top,
									});
								}
							},
							defaultStore.state.animation ? 700 : 2,
						);
					}
				}
			}
		};

		const showNewPosts = (event: PointerEvent) => {
			lastRenderedDate.value = props.items[0].createdAt;
			if (
				defaultStore.state.preserveScroll &&
				event.target instanceof HTMLElement
			) {
				scrollToLastTopPost(event.target);
			}
		};

		const renderChildren = () => {
			newPostsCount = 0;
			lastTopPostId = null;
			let itemsToRender = props.items;
			if (props.noAutoupdate) {
				itemsToRender = itemsToRender.filter((item) => {
					const filtered = item.createdAt <= lastRenderedDate.value;
					if (!filtered) {
						newPostsCount += 1;
					}
					return filtered;
				});
			}
			const renderedItems = itemsToRender.map((item, i) => {
				if (!slots || !slots.default) return;

				const el = slots.default({
					item,
				})[0];
				if (el.key == null && item.id) el.key = item.id;
				if (!lastTopPostId) lastTopPostId = item.id;

				if (
					i !== props.items.length - 1 &&
					new Date(item.createdAt).getDate() !==
						new Date(props.items[i + 1].createdAt).getDate()
				) {
					const separator = h(
						"div",
						{
							class: "separator",
							key: item.id + ":separator",
						},
						h(
							"p",
							{
								class: "date",
							},
							[
								h("span", [
									h("i", {
										class: "ph-caret-up ph-bold ph-lg icon",
									}),
									getDateText(item.createdAt),
								]),
								h("span", [
									getDateText(props.items[i + 1].createdAt),
									h("i", {
										class: "ph-caret-down ph-bold ph-lg icon",
									}),
								]),
							],
						),
					);

					return [el, separator];
				} else {
					if (props.ad && item._shouldInsertAd_) {
						return [
							h(MkAd, {
								class: "a", // advertiseの意(ブロッカー対策)
								key: item.id + ":ad",
								prefer: ["inline", "inline-big"],
							}),
							el,
						];
					} else {
						return el;
					}
				}
			});
			if (newPostsCount) {
				renderedItems.unshift(
					h(
						MkButton,
						{
							primary: true,
							onClick: showNewPosts,
						},
						i18n.t("newNotesCount", {
							count: newPostsCount,
						}),
					),
				);
			}
			return renderedItems;
		};

		return () => {
			return h(
				defaultStore.state.animation ? TransitionGroup : "div",
				defaultStore.state.animation
					? {
							class: "sqadhkmv" + (props.noGap ? " noGap" : ""),
							name: "list",
							tag: "div",
							"data-direction": props.direction,
							"data-reversed": props.reversed ? "true" : "false",
					  }
					: {
							class: "sqadhkmv" + (props.noGap ? " noGap" : ""),
					  },
				{ default: renderChildren },
			);
		};
	},
});
</script>

<style lang="scss">
.sqadhkmv {
	> *:empty {
		display: none;
	}

	> *:not(:last-child) {
		margin-bottom: var(--margin);
	}

	> .list-move {
		transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
	}

	> .list-enter-active {
		transition:
			transform 0.7s cubic-bezier(0.23, 1, 0.32, 1),
			opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);
	}

	&[data-direction="up"] {
		> .list-enter-from {
			opacity: 0;
			transform: translateY(64px);
		}
	}

	&[data-direction="down"] {
		> .list-enter-from {
			opacity: 0;
			transform: translateY(-64px);
		}
	}

	> .separator {
		text-align: center;

		> .date {
			display: inline-block;
			position: relative;
			margin: 0;
			padding: 0 16px;
			line-height: 32px;
			text-align: center;
			font-size: 12px;
			color: var(--dateLabelFg);

			> span {
				&:first-child {
					margin-right: 8px;

					> .icon {
						margin-right: 8px;
					}
				}

				&:last-child {
					margin-left: 8px;

					> .icon {
						margin-left: 8px;
					}
				}
			}
		}
	}

	&.noGap {
		> * {
			margin: 0 !important;
			border: none;
			border-radius: 0;
			box-shadow: none;

			&:first-child {
				border-radius: var(--radius) var(--radius) 0 0;
			}
			&:last-child {
				border-radius: 0 0 var(--radius) var(--radius);
			}

			&:not(:last-child) {
				border-bottom: solid 0.5px var(--divider);
			}
		}
	}

	> ._button {
		margin-inline: auto;
	}
}
</style>
