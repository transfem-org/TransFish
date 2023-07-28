# Contribution guide
We're glad you're interested in contributing Firefish! In this document you will find the information you need to contribute to the project.

## Translation (i18n)
Firefish uses [Weblate](hhttps://hosted.weblate.org/engage/firefish/) for translation and internationalization management.

If your language is not listed in Weblate, please open an issue.

You can contribute without knowing how to code by helping translate here:

[![Translation status](https://hosted.weblate.org/widgets/firefish/-/287x66-grey.png)](https://hosted.weblate.org/engage/firefish/)

[![Translation bars](https://hosted.weblate.org/widgets/firefish/-/multi-auto.svg)](https://hosted.weblate.org/engage/firefish/)

## Roadmap
See [FIREFISH.md](./FIREFISH.md)

## Issues
Before creating an issue, please check the following:
- To avoid duplication, please search for similar issues before creating a new issue.
- Do not use Issues to ask questions or troubleshooting.
	- Issues should only be used to feature requests, suggestions, and bug tracking.
	- Please ask questions or troubleshooting in the [Matrix room](https://matrix.to/#/#firefish:matrix.fedibird.com).

> **Warning**
> Do not close issues that are about to be resolved. It should remain open until a commit that actually resolves it is merged.

## Before implementation
When you want to add a feature or fix a bug, **first have the design and policy reviewed in an Issue** (if it is not there, please make one). Without this step, there is a high possibility that the PR will not be merged even if it is implemented.

At this point, you also need to clarify the goals of the PR you will create, and make sure that the other members of the team are aware of them.
PRs that do not have a clear set of do's and don'ts tend to be bloated and difficult to review.

Also, when you start implementation, assign yourself to the Issue (if you cannot do it yourself, ask another member to assign you). By expressing your intention to work the Issue, you can prevent conflicts in the work.

## Well-known branches
- The **`main`** branch is tracking the latest release and used for production purposes.
- The **`develop`** branch is where we work for the next release.
	- When you create a PR, basically target it to this branch. **But create a different branch**
- The **`l10n_develop`** branch is reserved for localization management.
- **`feature/*`** branches are reserved for the development of a specific feature

## Creating a PR
Thank you for your PR! Before creating a PR, please check the following:
- If possible, prefix the title with a keyword that identifies the type of this PR, as shown below.
  - `fix` / `refactor` / `feat` / `enhance` / `perf` / `chore` etc. You are also welcome to use gitmoji. This is important as we use these to A) easier read the git history and B) generate our changelog. Without propper prefixing it is possible that your PR is rejected.
  - Also, make sure that the granularity of this PR is appropriate. Please do not include more than one type of change or interest in a single PR.
- If there is an Issue which will be resolved by this PR, please include a reference to the Issue in the text. Good examples include `Closing: #21` or `Resolves: #21`
- Check if there are any documents that need to be created or updated due to this change.
- If you have added a feature or fixed a bug, please add a test case if possible.
- Please make sure that formatting, tests and Lint are passed in advance.
  - You can run it with `pnpm run format`, `pnpm run test` and `pnpm run lint`. [See more info](#testing)
- If this PR includes UI changes, please attach a screenshot in the text.

Thanks for your cooperation 🤗

## Reviewers guide
Be willing to comment on the good points and not just the things you want fixed 💯

### Review perspective
- Scope
  - Are the goals of the PR clear?
  - Is the granularity of the PR appropriate?
- Security
	- Does merging this PR create a vulnerability?
- Performance
	- Will merging this PR cause unexpected performance degradation?
	- Is there a more efficient way?
- Testing
	- Does the test ensure the expected behavior?
	- Are there any omissions or gaps?
	- Does it check for anomalies?

## Deploy (SOON)
The `/deploy` command by issue comment can be used to deploy the contents of a PR to the preview environment.
```
/deploy sha=<commit hash>
```
An actual domain will be assigned so you can test the federation.

## Merge

## Release
### Release Instructions
1. Commit version changes in the `develop` branch ([package.json](https://github.com/misskey-dev/misskey/blob/develop/package.json))
2. Create a release PR.
	- Into `master` from `develop` branch.
	- The title must be in the format `Release: x.y.z`.
		- `x.y.z` is the new version you are trying to release.
3. Deploy and perform a simple QA check. Also verify that the tests passed.
4. Merge it.
5. Create a [release of GitHub](https://github.com/misskey-dev/misskey/releases)
	- The target branch must be `master`
	- The tag name must be the version

## Development
During development, it is useful to use the `yarn dev` command.
This command monitors the server-side and client-side source files and automatically builds them if they are modified.
In addition, it will also automatically start the Misskey server process.


# THE FOLLOWING IS OUTDATED:

## Testing
- Test codes are located in [`/test`](/test).

### Run test
Create a config file.
```
cp test/test.yml .config/
```
Prepare DB/Redis for testing.
```
docker-compose -f test/docker-compose.yml up
```
Alternatively, prepare an empty (data can be erased) DB and edit `.config/test.yml`. 

Run all test.
```
yarn test
```

#### Run specify test
```
TS_NODE_FILES=true TS_NODE_TRANSPILE_ONLY=true TS_NODE_PROJECT="./test/tsconfig.json" yarn dlx mocha test/foo.ts --require ts-node/register
```

### e2e tests
TODO

## Continuous integration
Misskey uses GitHub Actions for executing automated tests.
Configuration files are located in [`/.github/workflows`](/.github/workflows).

## Vue
Misskey uses Vue(v3) as its front-end framework.
- Use TypeScript.
- **When creating a new component, please use the Composition API (with [setup sugar](https://v3.vuejs.org/api/sfc-script-setup.html) and [ref sugar](https://github.com/vuejs/rfcs/discussions/369)) instead of the Options API.**
	- Some of the existing components are implemented in the Options API, but it is an old implementation. Refactors that migrate those components to the Composition API are also welcome.

## nirax
niraxは、Misskeyで使用しているオリジナルのフロントエンドルーティングシステムです。
**vue-routerから影響を多大に受けているので、まずはvue-routerについて学ぶことをお勧めします。**

### ルート定義
ルート定義は、以下の形式のオブジェクトの配列です。

``` ts
{
	name?: string;
	path: string;
	component: Component;
	query?: Record<string, string>;
	loginRequired?: boolean;
	hash?: string;
	globalCacheKey?: string;
	children?: RouteDef[];
}
```

> **Warning**
> 現状、ルートは定義された順に評価されます。
> たとえば、`/foo/:id`ルート定義の次に`/foo/bar`ルート定義がされていた場合、後者がマッチすることはありません。

### 複数のルーター
vue-routerとの最大の違いは、niraxは複数のルーターが存在することを許可している点です。
これにより、アプリ内ウィンドウでブラウザとは個別にルーティングすることなどが可能になります。

## Notes
### How to resolve conflictions occurred at yarn.lock?

Just execute `yarn` to fix it.

### INSERTするときにはsaveではなくinsertを使用する
#6441

### placeholder
SQLをクエリビルダで組み立てる際、使用するプレースホルダは重複してはならない
例えば
``` ts
query.andWhere(new Brackets(qb => {
	for (const type of ps.fileType) {
		qb.orWhere(`:type = ANY(note.attachedFileTypes)`, { type: type });
	}
}));
```
と書くと、ループ中で`type`というプレースホルダが複数回使われてしまいおかしくなる
だから次のようにする必要がある
```ts
query.andWhere(new Brackets(qb => {
	for (const type of ps.fileType) {
		const i = ps.fileType.indexOf(type);
		qb.orWhere(`:type${i} = ANY(note.attachedFileTypes)`, { [`type${i}`]: type });
	}
}));
```

### Not `null` in TypeORM
```ts
const foo = await Foos.findOne({
	bar: Not(null)
});
```
のようなクエリ(`bar`が`null`ではない)は期待通りに動作しない。
次のようにします:
```ts
const foo = await Foos.findOne({
	bar: Not(IsNull())
});
```

### `null` in SQL
SQLを発行する際、パラメータが`null`になる可能性のある場合はSQL文を出し分けなければならない
例えば
``` ts
query.where('file.folderId = :folderId', { folderId: ps.folderId });
```
という処理で、`ps.folderId`が`null`だと結果的に`file.folderId = null`のようなクエリが発行されてしまい、これは正しいSQLではないので期待した結果が得られない
だから次のようにする必要がある
``` ts
if (ps.folderId) {
	query.where('file.folderId = :folderId', { folderId: ps.folderId });
} else {
	query.where('file.folderId IS NULL');
}
```

### `[]` in SQL
SQLを発行する際、`IN`のパラメータが`[]`(空の配列)になる可能性のある場合はSQL文を出し分けなければならない
例えば
``` ts
const users = await Users.find({
	id: In(userIds)
});
```
という処理で、`userIds`が`[]`だと結果的に`user.id IN ()`のようなクエリが発行されてしまい、これは正しいSQLではないので期待した結果が得られない
だから次のようにする必要がある
``` ts
const users = userIds.length > 0 ? await Users.find({
	id: In(userIds)
}) : [];
```

### 配列のインデックス in SQL
SQLでは配列のインデックスは**1始まり**。
`[a, b, c]`の `a`にアクセスしたいなら`[0]`ではなく`[1]`と書く

### null IN
nullが含まれる可能性のあるカラムにINするときは、そのままだとおかしくなるのでORなどでnullのハンドリングをしよう。

### `undefined`にご用心
MongoDBの時とは違い、findOneでレコードを取得する時に対象レコードが存在しない場合 **`undefined`** が返ってくるので注意。
MongoDBは`null`で返してきてたので、その感覚で`if (x === null)`とか書くとバグる。代わりに`if (x == null)`と書いてください

### Migration作成方法
packages/backendで:
```sh
pnpm dlx typeorm migration:generate -d ormconfig.js -o <migration name>
```

- 生成後、ファイルをmigration下に移してください
- 作成されたスクリプトは不必要な変更を含むため除去してください

### コネクションには`markRaw`せよ
**Vueのコンポーネントのdataオプションとして**misskey.jsのコネクションを設定するとき、必ず`markRaw`でラップしてください。インスタンスが不必要にリアクティブ化されることで、misskey.js内の処理で不具合が発生するとともに、パフォーマンス上の問題にも繋がる。なお、Composition APIを使う場合はこの限りではない(リアクティブ化はマニュアルなため)。

### JSONのimportに気を付けよう
TypeScriptでjsonをimportすると、tscでコンパイルするときにそのjsonファイルも一緒にdistディレクトリに吐き出されてしまう。この挙動により、意図せずファイルの書き換えが発生することがあるので、jsonをimportするときは書き換えられても良いものかどうか確認すること。書き換えされて欲しくない場合は、importで読み込むのではなく、`fs.readFileSync`などの関数を使って読み込むようにすればよい。

### コンポーネントのスタイル定義でmarginを持たせない
コンポーネント自身がmarginを設定するのは問題の元となることはよく知られている
marginはそのコンポーネントを使う側が設定する

## その他
### HTMLのクラス名で follow という単語は使わない
広告ブロッカーで誤ってブロックされる
