chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveNote",
        title: "Save selection to Simple Notepad",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "saveNote") {
        chrome.storage.local.get("notes", (data) => {
            const notes = data.notes || [];
            notes.unshift({ title: "From Web", content: info.selectionText });
            chrome.storage.local.set({ notes }, () => {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: chrome.runtime.getURL("src/icons/icon48.png"),
                    title: "Simple Notepad",
                    message: "Note saved!",
                    silent: true
                }, (notificationId) => {
                    setTimeout(() => {
                        chrome.notifications.clear(notificationId);
                    }, 3500);
                });
            });
        });
    }
});
