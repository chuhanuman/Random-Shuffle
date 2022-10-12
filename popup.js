import { getActiveTabURL } from "./utils.js";

//TODO: view playlist
const addNewPlaylist = (playlists, playlist) => {
	console.log("HERE");
	console.log(playlist);
	const playlistTitleElement = document.createElement("div");
	const controlsElement = document.createElement("div");
	const newPlaylistElement = document.createElement("div");

	playlistTitleElement.textContent = playlist.name;
	playlistTitleElement.className = "playlist-title";
	controlsElement.className = "playlist-controls";

	setPlaylistAttributes("shuffle", onShuffle, controlsElement);
	setPlaylistAttributes("delete", onDelete, controlsElement);

	newPlaylistElement.id = "playlist-" + playlist.id;
	newPlaylistElement.className = "playlist";
	newPlaylistElement.setAttribute("playlistId", playlist.id);

	newPlaylistElement.appendChild(playlistTitleElement);
	newPlaylistElement.appendChild(controlsElement);
	playlists.appendChild(newPlaylistElement);
};

const viewPlaylists = (playlists = []) => {
	const playlistsElement = document.getElementById("playlists");
	playlistsElement.innerHTML = "";
	
	console.log(playlists);
	if (playlists.length > 0) {
		for (let i = 0; i < playlists.length; i++) {
			const playlist = playlists[i];
			addNewPlaylist(playlistsElement, playlist);
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
		for (var key in playlistIds) {
			curPlaylist = await new Promise((resolve) => {
				chrome.storage.sync.get([playlistIds.at(key)], (obj) => {
					console.log(obj[playlistIds.at(key)]);
					resolve(JSON.parse(obj[playlistIds.at(key)]));
				});
			});
			playlists.push(curPlaylist);
		}
		
		viewPlaylists(playlists);
	} else {
		const container = document.getElementsByClassName("container")[0];

		container.innerHTML = '<div class="title">This is not a youtube page.</div>';
	}
});

