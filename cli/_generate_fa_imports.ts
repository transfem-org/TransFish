import * as fs from 'fs';
//import { inspect } from 'util';
import { concat } from '../src/prelude/array';

// TODO: unique, auto generate r/s
const importRegex = new RegExp(/import\s+\{([^}]+)\}\s+from\s+'@fortawesome\/free-(\w+)-svg-icons';/g, 'gs');

function main() {
	const content = fs.readFileSync(`${__dirname}/../src/client/app/init.ts`, 'utf-8');

	const fais = getFaImports(content);

	const toAddLib: string[][] = [];

	for (const fai of fais) {
		console.log(`// Imports for Font Awesome ${fai.name}`)
		console.log(formatFaImport(fai));

		toAddLib.push(fai.imports.map(x => x.as || x.name));
	}

	console.log(`library.add(\n\t${concat(toAddLib).join(',\n\t')}\n);`);
}

function getFaImports(s: string): FaImport[] {
	const faImports: FaImport[] = [];

	let a1: RegExpExecArray | null
	while ((a1 = importRegex.exec(s)) !== null) {
		const name = a1[2];
		const imp = a1[1];
		const ps = splitComma(imp);
		const imports = ps.map(p => parseImport(p));

		const fai = {
			name,
			imports: sortImportsByName(imports)
		} as FaImport;

		faImports.push(fai);
	}

	return faImports;
}

function formatFaImport(fai: FaImport): string {
	const imports = fai.imports.map(f => f.as ? `${f.name} as ${f.as}` : f.name).join(',\n\t');
	return `import {\n\t${imports}\n} from '@fortawesome/free-${fai.name}-svg-icons';`
}

function splitComma(s: string): string[] {
	return s.trim().split(/[\s\n]*,[\s\n]*/).filter(x => x);
}

type FaImport = {
	name: string;
	imports: Import[];
};

type Import = {
	name: string;
	as?: string;
};

function parseImport(s: string): Import {
	const matchAs = s.match(/^(\w+)\s+as\s+(\w+)$/);
	if (matchAs) {
		return { name: matchAs[1], as: matchAs[2] }
	} else {
		return { name: s, as: undefined }
	}
}

function sortImportsByName(is: Import[]): Import[] {
	return is.sort((a, b) => a.name.localeCompare(b.name))
}

main();
