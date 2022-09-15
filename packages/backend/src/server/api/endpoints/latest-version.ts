export async function getLatestVersion(): Promise<string> {
	let tag_name = 'v12.119.0-calc';
	fetch('https://codeberg.org/api/v1/repos/thatonecalculator/calckey/releases?draft=false&pre-release=false&page=1&limit=1')
		.then((response) => response.json())
		.then((data) => { tag_name = data[0].tag_name; });
	return tag_name;
}
