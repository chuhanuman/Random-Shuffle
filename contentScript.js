let youtubePlaylistControls, youtubePlayer;
let curPlaylistId = "";
let curPlaylistVideos = {};
let curPlaylist;

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
	
	const newPlaylist = {
		name: document.getElementsByClassName("title style-scope ytd-playlist-panel-renderer")[1].innerHTML,
		videos: curPlaylistVideos
	};

	chrome.storage.sync.set({
		[currentVideo]: JSON.stringify(newPlaylist)
	});
};

const onVideoLoad = async () => {
	const saveButtonExists = document.getElementsByClassName("save-btn")[0];
	console.log(saveButtonExists);
	
	if (!saveButtonExists) {
		const saveButton = document.createElement("img");

		saveButton.src = chrome.runtime.getURL("assets/save.png");
		saveButton.className = "save-btn";
		saveButton.title = "Click to save playlist";

		youtubePlaylistControls = document.getElementsByClassName("style-scope ytd-playlist-panel-renderer")[0].querySelector("#overflow-menu")​;
		youtubePlayer = document.getElementsByClassName('video-stream')[0];
		
		console.log(youtubePlayer);
		youtubePlaylistControls.appendChild(saveButton);
		saveButton.addEventListener("click", savePlaylistEventHandler);
	}
};

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	    console.log(request);
		const { type, playlistId } = request;
		
		if (type === "VIDEO") {
			curPlaylistId = playlistId;
			onVideoLoad();
		} else if (type === "PLAYLIST") {
			curPlaylistId = playlistId;
			onPlaylistLoad();
		} else if (type === "SHUFFLE") {
			curPlaylistId = playlistId;
			shuffle = true;
			startShuffle();
		} else if ( type === "DELETE") {
			currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
			chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
		}
		
		sendResponse(request);
	}
);

//vPlay.onended = function(){console.log(4);}