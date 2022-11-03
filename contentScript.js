let youtubePlaylistControls, youtubePlayer;
let curPlaylist;
let curPlaylistId = "";
let curPlaylistVideos;

const fetchPlaylist = () => {
	return new Promise((resolve) => {
		chrome.storage.sync.get([curPlaylistId], (obj) => {
			resolve(obj[curPlaylistId] ? JSON.parse(obj[curPlaylistId]) : []);
		});
	});
};

const fetchVideos = async () => {
	curPlaylist = await fetchPlaylist();
	curPlaylistVideos = curPlaylist.videos;
	console.log("1");
	return new Promise((resolve) => {resolve()});
}

const playNext = async () => {
	console.log("0 or 1.5");
	if (curPlaylistVideos == null) {
		await fetchVideos();
	}
	console.log("2");
	window.location.href = "https://youtube.com/watch?v=" + curPlaylistVideos[Math.floor(Math.random()*curPlaylistVideos.length)] + "#shuffle=" + curPlaylistId;
}

const savePlaylistEventHandler = async () => {
	curPlaylistVideos = [];
	
	var lastNumVideos = 0, curNumVideos = 0;
	do {
		lastNumVideos = curNumVideos;
		curNumVideos = await new Promise (response => {
			window.scrollTo(0,(window.pageYOffset+12000));
			response(document.querySelectorAll(".style-scope ytd-playlist-video-renderer").length);
		});
	} while (lastNumVideos < curNumVideos && document.readyState == "loaded")
	for (let i=0;i<curNumVideos;i++) {
		if (document.querySelectorAll("a.ytd-thumbnail")[i].href.indexOf("&list=") != -1) {
			curPlaylistVideos.push(document.querySelectorAll("a.ytd-thumbnail")[i].href.split("?v=")[1].split("&")[0]);
		}
	}
	
	console.log(curPlaylistVideos);
	
	var playlistName = document.title.substring(0,document.title.indexOf("YouTube")-3);
	if (playlistName[0] == "(") {
		playlistName = playlistName.substring(playlistName.indexOf(")")+2)
	}
	
	const newPlaylist = {
		id: curPlaylistId,
		name: playlistName,
		videos: curPlaylistVideos
	};

	chrome.storage.sync.set({[curPlaylistId]: JSON.stringify(newPlaylist)}, () => {
		console.log(newPlaylist);
	});
};

const onPlaylistLoad = async () => {
	var saveButtonExists = document.getElementsByClassName("save-btn")[0];
	
	if (!saveButtonExists) {
		const saveButton = document.createElement("img");

		saveButton.src = chrome.runtime.getURL("assets/save.png");
		saveButton.className = "save-btn";
		saveButton.title = "Click to save playlist";
		saveButton.width = 24;
		saveButton.height = 24;
		
		var readyStateCheckInterval = setInterval(function() {
			let youtubePlaylistControls;
			if (curPlaylistId == "WL") {
				youtubePlaylistControls = document.getElementById("page-manager").querySelector(".style-scope ytd-playlist-sidebar-primary-info-renderer").querySelector("#menu");
			} else {
				youtubePlaylistControls = document.getElementsByClassName("metadata-buttons-wrapper style-scope ytd-playlist-header-renderer")[0];
			}
			if (youtubePlaylistControls) {
				console.log("Found playlist controls.")
				clearInterval(readyStateCheckInterval);
				saveButtonExists = document.getElementsByClassName("save-btn")[0];
				if (!saveButtonExists) {
					youtubePlaylistControls.appendChild(saveButton);
					saveButton.addEventListener("click", savePlaylistEventHandler);
				}
			}
		}, 1000);
	}
};

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	    console.log(request);
		const { type, value } = request;
		sendResponse(type);
		
		if (type === "PLAYLIST") {
			curPlaylistId = value;
			onPlaylistLoad();
		} else if (type === "STARTSHUFFLE") {
			curPlaylistId = value;
			console.log(curPlaylistId);
			playNext();
		} else if (type === "SHUFFLE") {
			curPlaylistId = value;
			var readyStateCheckInterval = setInterval(function() {
				youtubePlayer = document.getElementsByClassName('video-stream')[0];
				if (youtubePlayer) {
					console.log("Found youtube player.")
					clearInterval(readyStateCheckInterval);
					fetchVideos();
					youtubePlayer.onended = playNext;
				}
			}, 1000);
		} else if (type === "DELETE") {
			chrome.storage.sync.remove(value);
		}
	}
);