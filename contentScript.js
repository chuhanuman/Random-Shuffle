console.log("Good?");
(() => {
	let youtubePlaylistControls, youtubePlayer;
	let currentPlaylist = "";
	let savedPlayists = [];

	const fetchBookmarks = () => {
		return new Promise((resolve) => {
			chrome.storage.sync.get([currentVideo], (obj) => {
				resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
			});
		});
	};

	const addNewBookmarkEventHandler = async () => {
		const currentTime = youtubePlayer.currentTime;
		const newBookmark = {
			time: currentTime,
			desc: "Bookmark at " + getTime(currentTime),
		};

		currentVideoBookmarks = await fetchBookmarks();

		chrome.storage.sync.set({
			[currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
		});
	};

	const newVideoLoaded = async () => {
		const saveButtonExists = document.getElementsByClassName("save-btn")[0];

		currentVideoBookmarks = await fetchBookmarks();
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

	chrome.runtime.onMessageExternal.addListener((obj, sender, response) => {
		console.log(2);
		response();
		console.log(obj);
		const { type, value, videoId } = obj;
		console.log(type);
		
		if (type === "NEW") {
			currentVideo = videoId;
			newVideoLoaded();
		} else if (type === "PLAY") {
			youtubePlayer.currentTime = value;
		} else if ( type === "DELETE") {
			currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
			chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

			response(currentVideoBookmarks);
		}
	});

	newVideoLoaded();
})();

const getTime = t => {
	var date = new Date(0);
	date.setSeconds(t);

	return date.toISOString().substr(11, 8);
};
