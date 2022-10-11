chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status == "complete" && (tab.url.includes("youtube.com/playlist") || tab.url.includes("youtube.com/watch"))) {
		const queryParameters = tab.url.split("?")[1];
		const urlParameters = new URLSearchParams(queryParameters);
		
		if (urlParameters.get("list") != null) {
			chrome.runtime.sendMessage(
				chrome.runtime.id,
				{
					type: "NEW",
					playlistId: urlParameters.get("list")
				}
			);
			console.log(1);
		}
	}
});
