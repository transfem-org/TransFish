# All the changes to Calckey from stock Misskey

## Planned

- MFM button
- Better Messaging UI
- Classic mode make instance icon bring up new context menu
- Like/star button
- Option to publicize instance blocks
- Better intro/onboarding
- Fully revamp non-logged-in screen
- Personal notes for all accounts
- Admin custom CSS
- Non-nyaify cat mode
- Timeline filters
- "Bubble" timeline
- Filter notifications by user
- Remove NSFW/AI stuff
- [Rat mode?](https://stop.voring.me/notes/933fx97bmd)

## Work in progress

- Less cluttered notification summary
- Better timeline top bar

## Implemented

- Yarn 3
- Saner defaults
- Star as default reaction
- Rosé Pine by default (+ non-themable elements made Rosé Pine)
- Better sidebar/navbar
- Profile background as banner
- Mark as read from notifications widget
- Better welcome screen (not logged in)
- Ability to turn off "Connection lost" message
- Spinner instead of "Loading..."
- SearchX instead of Google
- Spacing on group items
- MOTD
- Reply limit bug fixed (somewhat)
- Custom assets
- [OAuth bearer token authentication](https://github.com/misskey-dev/misskey/pull/9021)
- [Styled Repair Tools](https://github.com/misskey-dev/misskey/pull/8956)
- [Option to make enter send message](https://github.com/misskey-dev/misskey/pull/8954)
- [Make showing ads optional](https://github.com/misskey-dev/misskey/pull/8996)
- [Autocomplete in messaging](https://github.com/misskey-dev/misskey/pull/8955)
- [Star is like](https://github.com/JakeMBauer/Misskey-Extras/blob/master/patches/star-is-like.patch)
- [Add additional background for acrylic popups if backdrop-filter is unsupported](https://github.com/misskey-dev/misskey/pull/8671)
- [Timeline page for non-login users](https://github.com/misskey-dev/misskey/pull/8927)
- [Add parameters to MFM rotate](https://github.com/misskey-dev/misskey/pull/8549)
- Many changes from [Foundkey](https://akkoma.dev/FoundKeyGang/Foundkey)
  - 0ece67b04c3f0365057624c1068808276ccab981: refactor pages/auth.form.vue to composition API
	- 0ece67b04c3f0365057624c1068808276ccab981: refactor pages/auth.form.vue to composition API
	- 4bc9610d8bf5af736b5e89e4782395705de45d7d: remove unnecessary joins
	- 9ee609d70082f7a6dc119a5d83c0e7c5e1208676: enhance privacy of notes
	- 0fec6e10477b1c1b95d9469fbaf4e249a3722f12: remove ms dependency
	- 46fff77accbe8bf0fd3cc88170d67b997bf2bdc3:  client uses new API for child notes depth
	- c35372a20d22cddb75e93a0b407f2b652cd7faf0:  pack children without detail
	- aca724e0bfff3e58b4d273f3ee744e3f3aa9c39b: enable to fetch replies recursively
	- 2fe64c11502fd8d89c126558cd715e095c83754e: Refactor components/page/page.textarea.vue to composition API
	- 6d3181f9835955e5b79bde5484c74bd70e7f9535: Refactor components/page/page.text.vue to composition API
	- b630cd7eacd695bb705e6748c87f38425ec4ed45:  refactor: add NoteReactions.packMany
	- 3fe351df6d4e21f7748c46adfa6ca165abd030c0: fix: catch errors from packing with detail
	- 63591da33e233b2ed0ab331ae6bb3c9eff5020ae: refactor: colours in queue chart
