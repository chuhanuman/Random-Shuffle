let youtubePlaylistControls, youtubePlayer;
let curPlaylistId = "";
let curPlaylistVideos = {};
let curPageType = "";

const fetchPlaylists = () => {
	return new Promise((resolve) => {
		chrome.storage.sync.get([curPlaylistId], (obj) => {
			resolve(obj[curPlaylistId] ? JSON.parse(obj[curPlaylistId]) : []);
		});
	});
};

const startShuffle = async () => {
	curPlaylistVideos = await fetchPlaylists().videos;
}

const savePlaylistEventHandler = async () => {
	curPlaylistVideos = {};
	
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

		if (curPageType == "video") {
			youtubePlaylistControls = document.getElementById("columns").querySelector(".style-scope ytd-playlist-panel-renderer").querySelector("#overflow-menu");
		} else {
			youtubePlaylistControls = document.getElementById("page-manager").querySelector(".style-scope ytd-playlist-sidebar-primary-info-renderer").querySelector("#menu");
		}
		youtubePlayer = document.getElementsByClassName('video-stream')[0];
		
		console.log(youtubePlayer);
		youtubePlaylistControls.appendChild(saveButton);
		saveButton.addEventListener("click", savePlaylistEventHandler);
	}
};

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	    console.log(request);
		const { type, value } = request;
		sendResponse(type);
		
		if (type === "VIDEO") {
			curPlaylistId = value;
			curPageType = "video";
			onPlaylistLoad();
		} else if (type === "PLAYLIST") {
			curPlaylistId = value;
			curPageType = "playlist";
			onPlaylistLoad();
		} else if (type === "SHUFFLE") {
			curPlaylistId = value;
			shuffle = true;
			startShuffle();
		} else if ( type === "DELETE") {
			chrome.storage.sync.remove(value);
		}
	}
);

document.addEventListener("DOMContentLoaded", async () => {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		if (tab.url.includes("youtube.com/playlist") || tab.url.includes("youtube.com/watch")) {
			const queryParameters = tab.url.split("?")[1];
			const urlParameters = new URLSearchParams(queryParameters);
			
			if (urlParameters.get("list") != null) {
				chrome.tabs.sendMessage(
					tabId,
					{
						type: tab.url.includes("youtube.com/playlist") ? "PLAYLIST" : "VIDEO",
						playlistId: urlParameters.get("list")
					},
					function(response) {console.log(response);}
				);
			}
		}
	});
});

//vPlay.onended = function(){console.log(4);}