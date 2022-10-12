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
	return new Promise((resolve) => {});
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
	} while (lastNumVideos < curNumVideos)
	for (let i=1;i<curNumVideos;i++) {
		curPlaylistVideos.push(document.querySelectorAll("a.ytd-thumbnail")[i].href.split("?v=")[1].split("&")[0]);
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
	const saveButtonExists = document.getElementsByClassName("save-btn")[0];
	
	if (!saveButtonExists) {
		const saveButton = document.createElement("img");

		saveButton.src = chrome.runtime.getURL("assets/save.png");
		saveButton.className = "save-btn";
		saveButton.title = "Click to save playlist";
		saveButton.width = 24;
		saveButton.height = 24;

		youtubePlaylistControls = document.getElementById("page-manager").querySelector(".style-scope ytd-playlist-sidebar-primary-info-renderer").querySelector("#menu");
		
		youtubePlaylistControls.appendChild(saveButton);
		saveButton.addEventListener("click", savePlaylistEventHandler);
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
			youtubePlayer = document.getElementsByClassName('video-stream')[0];
			fetchVideos();
			youtubePlayer.onended = playNext;
		} else if (type === "DELETE") {
			chrome.storage.sync.remove(value);
		}
	}
);

document.addEventListener("DOMContentLoaded", async () => {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		if (tabs[0].url.includes("youtube.com/playlist")) {
			const queryParameters = tabs[0].url.split("?")[1];
			const urlParameters = new URLSearchParams(queryParameters);
			
			if (urlParameters.get("list") != null) {
				chrome.tabs.sendMessage(
					tabs[0].id,
					{
						type: "PLAYLIST",
						playlistId: urlParameters.get("list")
					},
					function(response) {console.log(response);}
				);
			}
		} else if (tabs[0].url.includes("youtube.com/watch") && tabs[0].url.includes("#shuffle=")) {
			youtubePlayer = document.getElementsByClassName('video-stream')[0];
			console.log(youtubePlayer);
			curPlaylistId = tabs[0].url.substring(tabs[0].url.indexOf("#shuffle=")+9);
			console.log(curPlaylistId);
			fetchVideos();
			
			youtubePlayer.onended = playNext;
		}
	});
});

window.addEventListener('load', (event) => {
	if (window.location.href.includes("youtube.com/playlist")) {
		const queryParameters = window.location.href.split("?")[1];
		const urlParameters = new URLSearchParams(queryParameters);
		
		if (urlParameters.get("list") != null) {
			curPlaylistId = urlParameters.get("list");
			onPlaylistLoad();
		}
	} else if (window.location.href.includes("youtube.com/watch") && window.location.href.includes("#shuffle=")) {
		youtubePlayer = document.getElementsByClassName('video-stream')[0];
		console.log(youtubePlayer);
		curPlaylistId = window.location.href.substring(window.location.href.indexOf("#shuffle=")+9);
		console.log(curPlaylistId);
		fetchVideos();
		
		youtubePlayer.onended = playNext;
	}
});