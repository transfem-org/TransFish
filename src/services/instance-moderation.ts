import Instance from '../models/instance';
import { getServerSubscriber } from '../services/server-subscriber';
import { toApHost } from '../misc/convert-host';

let blockedHosts: Set<string>;
let closedHosts: Set<string>;

export async function isBlockedHost(host: string | null) {
	if (host == null) return false;
	if (!blockedHosts) await Update();
	return blockedHosts?.has(toApHost(host));
}

export async function isClosedHost(host: string | null) {
	if (host == null) return false;
	if (!closedHosts) await Update();
	return closedHosts?.has(toApHost(host));
}

async function Update() {
	const blocked = await Instance.find({
		isBlocked: true
	});
	blockedHosts = new Set(blocked.map(x => toApHost(x.host)));

	const closed = await Instance.find({
		isMarkedAsClosed: true
	});
	closedHosts = new Set(closed.map(x => toApHost(x.host)));
}

// 初回アップデート
Update();

// 一定時間ごとにアップデート
setInterval(() => {
	Update();
}, 300 * 1000);

// イベントでアップデート
const ev = getServerSubscriber();

ev.on('serverEvent', (data: any) => {
	if (data.type === 'instanceModUpdated') {
		Update();
	}
});
