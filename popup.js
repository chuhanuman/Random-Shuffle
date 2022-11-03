import { getActiveTabURL } from "./utils.js";
let allPlaylists;

//TODO: view playlist
const addNewPlaylist = (playlists, playlist, index) => {
	console.log(playlist);
	const playlistTitleElement = document.createElement("div");
	const controlsElement = document.createElement("div");
	const newPlaylistElement = document.createElement("div");

	playlistTitleElement.textContent = playlist.name;
	playlistTitleElement.className = "playlist-title";
	playlistTitleElement.addEventListener("click", viewPlaylist);
	controlsElement.className = "playlist-controls";

	setPlaylistAttributes("shuffle", onShuffle, controlsElement);
	setPlaylistAttributes("delete", onDelete, controlsElement);

	newPlaylistElement.id = "playlist-" + playlist.id;
	newPlaylistElement.className = "playlist";
	newPlaylistElement.setAttribute("playlistId", playlist.id);
	newPlaylistElement.setAttribute("playlistIndex", index);

	newPlaylistElement.appendChild(playlistTitleElement);
	newPlaylistElement.appendChild(controlsElement);
	playlists.appendChild(newPlaylistElement);
};

const addNewVideo = (videos,video) => {
	const videoTitleElement = document.createElement("div");
	const newVideoElement = document.createElement("div");

	playlistTitleElement.textContent = video;
	playlistTitleElement.className = "video-title";

	newPlaylistElement.id = "video-" + video;
	newPlaylistElement.className = "video";
	newPlaylistElement.setAttribute("videoId", video);

	newPlaylistElement.appendChild(playlistTitleElement);
	videos.appendChild(newPlaylistElement);
}

const viewPlaylist = async e => {
	console.log(e.target.parentNode.parentNode.parentNode);
	var index = e.target.parentNode.parentNode.parentNode.getAttribute("playlistIndex");
	document.getElementsByClassName("title")[0].innerHTML = e.target.parentNode.parentNode.textContent;
	const videosElement = document.getElementById("items");
	videosElement.innerHTML = "";
	
	console.log(allPlaylists);
	console.log(index);
	videos = allPlaylists[index].videos;
	console.log(videos);
	if (videos.length > 0) {
		for (let i = 0; i < videos.length; i++) {
			const video = videos[i];
			addNewPlaylist(videosElement, video);
		}
	} else {
		videosElement.innerHTML = '<i class="row">This playlist has no videos.</i>';
	}
}

const viewPlaylists = (playlists = []) => {
	document.getElementsByClassName("title")[0].innerHTML = "Your playlists";
	const playlistsElement = document.getElementById("items");
	playlistsElement.innerHTML = "";
	
	console.log(playlists);
	if (playlists.length > 0) {
		for (let i = 0; i < playlists.length; i++) {
			const playlist = playlists[i];
			addNewPlaylist(playlistsElement, playlist, i);
		}
	} else {
		playlistsElement.innerHTML = '<i class="row">You have no playlists.</i>';
	}

	return;
};

const onShuffle = async e => {
	const playlistId = e.target.parentNode.parentNode.getAttribute("playlistId");
	const activeTab = await getActiveTabURL();

	chrome.tabs.sendMessage(activeTab.id, {
		type: "STARTSHUFFLE",
		value: playlistId,
	});
};

const onDelete = async e => {
	const activeTab = await getActiveTabURL();
	const playlistId = e.target.parentNode.parentNode.getAttribute("playlistId");
	const playlistElementToDelete = document.getElementById("playlist-" + playlistId);

	playlistElementToDelete.parentNode.removeChild(playlistElementToDelete);

	chrome.tabs.sendMessage(activeTab.id, {
		type: "DELETE",
		value: playlistId,
	}, window.location.reload);
};

const setPlaylistAttributes = (src, eventListener, controlParentElement) => {
	const controlElement = document.createElement("img");

	controlElement.src = "assets/" + src + ".png";
	controlElement.title = src;
	controlElement.addEventListener("click", eventListener);
	controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
	const activeTab = await getActiveTabURL();

	if (activeTab.url.includes("youtube.com")) {
		var playlistIds = await new Promise((resolve) => {
			chrome.storage.sync.get(null, (playlistIds) => {
				resolve(Object.keys(playlistIds));
			});
		});
		
		var playlists = [], curPlaylist;
		allPlaylists = [];
		for (var key in playlistIds) {
			curPlaylist = await new Promise((resolve) => {
				chrome.storage.sync.get([playlistIds.at(key)], (obj) => {
					console.log(obj[playlistIds.at(key)]);
					resolve(JSON.parse(obj[playlistIds.at(key)]));
				});
			});
			playlists.push(curPlaylist);
			allPlaylists.push(curPlaylist);
		}
		
		viewPlaylists(playlists);
	} else {
		const container = document.getElementsByClassName("container")[0];

		container.innerHTML = '<div class="title">This is not a youtube page.</div>';
	}
});

