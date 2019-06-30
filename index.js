const fs = require('fs');
const youtubedl = require('youtube-dl');
const args = process.argv.slice(2);

if (args[0] == undefined) {
	console.log('please provide a youtube link');
	return;
}

if (args[0] == "--help" || args[0] == "-H" || args[0] == "-h") {
	console.log(`
=== Node Youtube Downloader ===

node index.js <youtube-url (required)> <file name (optional)>

Provide a valid youtube URL as the first argument to download it to disk, if no second argument
is provided then the youtube video name is used as the file name. Otherwise, provide your
own file name (including the extension) to save it as!
`);
	return;
}

const video = youtubedl(args[0],
['--format=18'],
{ cwd: __dirname  })

let name;
let progress;

video.on('info', function(info){
	console.log('Download started');
	const formattedSize = Math.floor(info.size / 1024 / 1024);
	console.log('Size: ' + info.size + ' / ' + formattedSize + 'MB');
	name = (args[1]) ? args[1] : info._filename;
	console.log('Saving to disk as: ' + name);

	let rotateInt = 0;
	progress = setInterval(function(){
		const fileStat = fs.statSync('pendingDownload' + hash);
		const fileSize = fileStat.size;
		const percentage = Math.floor((fileSize / info.size) * 100);
		const amountOfBars = Math.floor(percentage / 5);
		let bars = '|';
		for (let i = 0; i < 20; i++) {
			if (amountOfBars > i) {
				bars += '=';
			} else if (amountOfBars == i) {
				bars += '>';
			} else {
				bars += '-';
			}
		}
		bars += '|';

		if (rotateInt++ == 3) {
			rotateInt = 0;
		}
		let spinner;
		if (rotateInt == 0) {
			spinner = '|';
		} else if (rotateInt == 1) {
			spinner = '/';
		} else if (rotateInt == 2) {
			spinner = '-';
		} else if (rotateInt == 3) {
			spinner = '\\';
		}
		process.stdout.write('\r\x1b[K' + spinner + ' Downloaded: ' + fileSize + ' out of ' + info.size + ' (' + percentage + '%) ' + bars);
	}, 100);
});

const hash = Math.random();
video.pipe(fs.createWriteStream('pendingDownload' + hash));

video.on('end', function(info) {
	fs.rename('pendingDownload' + hash, name, function (err){
		if (err) {
			console.log(err);
		}
	});	
	process.stdout.write('\r\x1b[KDownloaded: (100%)');
	console.log("");
	console.log("Complete!");
	clearInterval(progress);
});

