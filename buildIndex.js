const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const copyFile = util.promisify(fs.copyFile);

async function generateHtml() {
	await copyFile('./CNAME', './cdnFiles/CNAME');
	await generateHtmlForFolder('./cdnFiles');
}


async function generateHtmlForFolder(folder) {
	let fileLists = [];
	
    const allFiles = fs.readdirSync(folder, { withFileTypes: true });
    for (const dirent of allFiles) {
        if (dirent.isDirectory()) {
			fileLists.push(getLink(0, dirent.name));
			await generateHtmlForFolder(`${folder}/${dirent.name}`, `./${dirent.name}/`);
			continue;
		}
        if (dirent.name[0] == ".") continue;
        if (dirent.name[0] == "_") continue;
			fileLists.push(getLink(1, dirent.name));
    }
	
	fileLists.sort();
	
    let htmlString = `
<!DOCTYPE html>
<html>
<head>
	<style>
		ul li a {
			text-decoration: none;
		}
	</style>
</head>
<body>

	<h1>AssistantNMS - CDN</h1>
	
	<hr />
	
	<ul>
	${fileLists.join('\n\t')}
	</ul>

</body>
</html>
	`;
    fs.writeFile(`${folder}/index.html`, htmlString, ['utf8'], () => { });
}

function getLink(type, name) {
	let emoji = '❓';
	if (type == 0) emoji = '📁';
	if (type == 1) emoji = '📄';
	return `<li data-sort="${type}-${name.toLowerCase()}"><a href="./${name}">${emoji}&nbsp;${name}</a></li>`;
}

generateHtml();