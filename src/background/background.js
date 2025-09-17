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
            notes.unshift({
                title: "From Web",
                content: info.selectionText,
                lastSaved: Date.now()
            });
            chrome.storage.local.set({ notes }, () => {
                chrome.runtime.sendMessage({ type: "NOTE_SAVED" }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn("Popup not open, skipping NOTE_SAVED message.");
                    }
                });
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
