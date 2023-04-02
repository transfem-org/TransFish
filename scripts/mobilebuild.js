const fs = require('fs');
const path = require("path")

async function copyDir(source, destination) {
	fs.mkdirSync(destination, { recursive: true });
    
    fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

			if (sourcePath.endsWith('assets')) return;

      entry.isDirectory()
        ? copyDir(sourcePath, destinationPath)
        : fs.copyFileSync(sourcePath, destinationPath);
    });
}

(async () => {

	fs.mkdirSync(`${__dirname}/../built/_client_dist_/assets`, { recursive: true });
	copyDir(`${__dirname}/../built/_client_dist_`, `${__dirname}/../built/_client_dist_/assets`)

})();
