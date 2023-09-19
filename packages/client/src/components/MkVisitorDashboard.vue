<template>
    <div v-if="meta" :class="$style.root">
        <div :class="[$style.main, $style.panel]">
            <img :src="$instance.iconUrl || $instance.faviconUrl || '/favicon.ico'" alt="" :class="$style.mainIcon"/>
            <button class="_button _acrylic" :class="$style.mainMenu" @click="showMenu"><i class="ph-dots-three-outline ph-bold ph-lg"></i></button>
            <div :class="$style.mainFg">
                <h1 :class="$style.mainTitle">
                    <!-- 背景色によってはロゴが見えなくなるのでとりあえず無効に -->
                    <!-- <img class="logo" v-if="meta.logoImageUrl" :src="meta.logoImageUrl"><span v-else class="text">{{ instanceName }}</span> -->
                    <span>{{ instanceName }}</span>
                </h1>
                <div :class="$style.mainAbout">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div v-html="meta.description || i18n.ts.headlineMisskey"></div>
                </div>
                <div class="_gaps_s" :class="$style.mainActions">
                    <MkButton :class="$style.mainAction" full rounded gradate data-cy-signup style="margin-right: 12px;" @click="signup()">{{ i18n.ts.signup }}</MkButton>
                    <MkButton :class="$style.mainAction" full rounded data-cy-signin @click="signin()">{{ i18n.ts.login }}</MkButton>
                    <MkButton :class="$style.mainAction" full rounded onclick="window.location.href='/explore'">Explore</MkButton>
                </div>
            </div>
        </div>
        <div v-if="stats" :class="$style.stats">
            <div :class="[$style.statsItem, $style.panel]">
                <div :class="$style.statsItemLabel">{{ i18n.ts.users }}</div>
                <div :class="$style.statsItemCount"><MkNumber :value="stats.originalUsersCount"/></div>
            </div>
            <div :class="[$style.statsItem, $style.panel]">
                <div :class="$style.statsItemLabel">{{ i18n.ts.notes }}</div>
                <div :class="$style.statsItemCount"><MkNumber :value="stats.originalNotesCount"/></div>
            </div>
        </div>
        <div :class="[$style.tl, $style.panel]">
            <div :class="$style.tlHeader">Have a look at the timeline</div>
            <div :class="$style.tlBody">
                <MkTimeline src="local"/>
            </div>
        </div>
        <div :class="$style.panel">
		    <XActiveUsersChart/>
	    </div>
    </div>
</template>
    
<script lang="ts" setup>
    import { ref } from "vue";
    
    import XSigninDialog from "@/components/MkSigninDialog.vue";
    import XSignupDialog from "@/components/MkSignupDialog.vue";
    import MkButton from "@/components/MkButton.vue";
    import MkNumber from "@/components/MkNumber.vue";
    import MkTimeline from "@/components/MkTimeline.vue";
    import XActiveUsersChart from '@/components/MkVisitorDashboard.ActiveUsersChart.vue';

    import { instanceName } from "@/config";
    import * as os from "@/os";
    import { i18n } from "@/i18n";
    
    const meta = ref();
    const stats = ref();
    const tags = ref();
    const onlineUsersCount = ref();
    const instances = ref();
    
    os.api("meta", { detail: true }).then((_meta) => {
        meta.value = _meta;
    });
    
    os.api("stats").then((_stats) => {
        stats.value = _stats;
    });
    
    os.api("get-online-users-count").then((res) => {
        onlineUsersCount.value = res.count;
    });
    
    os.api("hashtags/list", {
        sort: "+mentionedLocalUsers",
        limit: 8,
    }).then((_tags) => {
        tags.value = _tags;
    });
    
    os.api("federation/instances", {
        sort: "+pubSub",
        limit: 20,
    }).then((_instances) => {
        instances.value = _instances;
    });
    
    function signin() {
        os.popup(
            XSigninDialog,
            {
                autoSet: true,
            },
            {},
            "closed",
        );
    }
    
    function signup() {
        os.popup(
            XSignupDialog,
            {
                autoSet: true,
            },
            {},
            "closed",
        );
    }
    
    function showMenu(ev) {
        os.popupMenu(
            [
                {
                    text: i18n.ts.instanceInfo,
                    icon: "ph-info ph-bold ph-lg",
                    action: () => {
                        os.pageWindow("/about");
                    },
                },
                {
                    text: i18n.ts.aboutFirefish,
                    icon: "ph-info ph-bold ph-lg",
                    action: () => {
                        os.pageWindow("/about-firefish");
                    },
                },
            ],
            ev.currentTarget ?? ev.target,
        );
    }
</script>
    
<style lang="scss" module>
    .root {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 32px 0 0 0;
    }
    
    .panel {
        position: relative;
        background: var(--panel);
        border-radius: var(--radius);
        box-shadow: 0 12px 32px rgb(0 0 0 / 25%);
    }
    
    .main {
        text-align: center;
    }
    
    .mainIcon {
        width: 85px;
        margin-top: -47px;
        vertical-align: bottom;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
    }
    
    .mainMenu {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        font-size: 18px;
    }
    
    .mainFg {
        position: relative;
        z-index: 1;
    }
    
    .mainTitle {
        display: block;
        margin: 0;
        padding: 16px 32px 24px 32px;
        font-size: 1.4em;
    }
    
    .mainLogo {
        vertical-align: bottom;
        max-height: 120px;
        max-width: min(100%, 300px);
    }
    
    .mainAbout {
        padding: 0 32px;
    }
    
    .mainWarn {
        padding: 32px 32px 0 32px;
    }
    
    .mainActions {
        padding: 32px;
    }
    
    .mainAction {
        line-height: 28px;
    }
    
    .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 16px;
    }
    
    .statsItem {
        overflow: clip;
        padding: 16px 20px;
    }
    
    .statsItemLabel {
        color: var(--fgTransparentWeak);
        font-size: 0.9em;
    }
    
    .statsItemCount {
        font-weight: bold;
        font-size: 1.2em;
        color: var(--accent);
    }
    
    .tl {
        overflow: clip;
    }
    
    .tlHeader {
        padding: 12px 16px;
        border-bottom: solid 1px var(--divider);
    }
    
    .tlBody {
        height: 350px;
        overflow: auto;
    }
</style>