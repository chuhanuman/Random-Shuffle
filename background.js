chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status == "complete" && (tab.url.includes("youtube.com/playlist") || tab.url.includes("youtube.com/watch"))) {
		const queryParameters = tab.url.split("?")[1];
		const urlParameters = new URLSearchParams(queryParameters);
		
		if (urlParameters.get("list") != null) {
			chrome.tabs.sendMessage(
				tabId,
				{
					type: "PLAYLIST",
					value: urlParameters.get("list")
				},
				function(response) {console.log(response);}
			);
		} else if (tab.url.includes("youtube.com/watch") && tab.url.includes("#shuffle=")) {
			chrome.tabs.sendMessage(
				tabId,
				{
					type: "SHUFFLE",
					value: tab.url.substring(tab.url.indexOf("#shuffle=")+9)
				},
				function(response) {console.log(response);}
			);
		}
	}
});