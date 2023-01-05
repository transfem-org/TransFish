<template>
<header class="kkwtjztg">
	<MkAvatar class="avatar" :user="note.user"/>
	<div class="user-info">
		<div>
			<MkA v-user-preview="note.user.id" class="name" :to="userPage(note.user)">
				<MkUserName :user="note.user" class="mkusername">
					<span v-if="note.user.isBot" class="is-bot">bot</span>
				</MkUserName>
			</MkA>
			<div class="info">
				<MkA class="created-at" :to="notePage(note)">
					<MkTime :time="note.createdAt"/>
				</MkA>
				<MkVisibility :note="note"/>
			</div>
		</div>
		<div>
			<div class="username"><MkAcct :user="note.user"/></div>
			<MkInstanceTicker v-if="showTicker" class="ticker" :instance="note.user.instance"/>
		</div>
	</div>
</header>
</template>

<script lang="ts" setup>
import { } from 'vue';
import type * as misskey from 'calckey-js';
import { defaultStore, noteViewInterruptors } from '@/store';
import MkVisibility from '@/components/MkVisibility.vue';
import MkInstanceTicker from '@/components/MkInstanceTicker.vue';
import { notePage } from '@/filters/note';
import { userPage } from '@/filters/user';

const showTicker = (defaultStore.state.instanceTicker === 'always') || (defaultStore.state.instanceTicker === 'remote' && appearNote.user.instance);


defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
}>();
</script>

<style lang="scss" scoped>
.kkwtjztg {
	display: flex;
	align-items: center;
	white-space: nowrap;
	justify-self: flex-end;
	border-radius: 100px;
	font-size: .8em;
	text-shadow: 0 2px 2px var(--shadow);

	> .avatar {
		width: 3.7em;
		height: 3.7em;
		margin-right: 1em;
	}
	> .user-info {
		width: 0;
		flex-grow: 1;
		line-height: 1.5;
		> div {
			display: flex;
			align-items: center;
		}
		.name {
			flex: 1 1 0px;
			display: block;
			margin: 0 .5em 0 0;
			padding: 0;
			overflow: hidden;
			font-size: 1.2em;
			font-weight: bold;
			text-decoration: none;
			text-overflow: ellipsis;

			.mkusername >.is-bot {
				flex-shrink: 0;
				align-self: center;
				margin: 0 .5em 0 0;
				padding: 1px 6px;
				font-size: 80%;
				border: solid 0.5px var(--divider);
				border-radius: 3px;
			}

			&:hover {
				text-decoration: underline;
			}
		}

		.username {
			flex: 1 1 0px;
			margin: 0 .5em 0 0;
			overflow: hidden;
			text-overflow: ellipsis;
			align-self: flex-start;
		}

		.info {
			flex-shrink: 0;
			margin-left: auto;
			font-size: 0.9em;
		}
	}
}
</style>
