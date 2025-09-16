const textarea = document.getElementById("note");
const clearBtn = document.getElementById("clear");
const modal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const toggleTheme = document.getElementById("toggleTheme");
const themeIcon = document.getElementById("themeIcon");
const exportBtn = document.getElementById("export");
const lastSaved = document.getElementById("lastSaved");
const wordCount = document.getElementById("wordCount");

// --- format helper for timestamp ---
function formatTimestamp(savedTime) {
  const savedDate = new Date(savedTime);
  const now = new Date();

  const sameDay = savedDate.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (sameDay) {
    return (
      "Today " +
      savedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  } else if (savedDate.toDateString() === yesterday.toDateString()) {
    return (
      "Yesterday " +
      savedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  } else {
    return (
      savedDate.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      savedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  }
}

// --- update timestamp ---
function updateTimestamp() {
  const now = Date.now();
  lastSaved.textContent = "Last saved: " + formatTimestamp(now);

  chrome.storage.local.set({ lastSaved: now }, () => {
    if (chrome.runtime.lastError) {
      console.error("Timestamp save failed:", chrome.runtime.lastError);
    }
  });
}

// --- update word count ---
function updateWordCount() {
  const text = textarea.value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  wordCount.textContent = "Words: " + words;
}

// --- input handler (save + timestamp + word count) ---
textarea.addEventListener("input", () => {
  const note = textarea.value;

  chrome.storage.local.set({ myNote: note }, () => {
    if (chrome.runtime.lastError) {
      console.error("Save failed:", chrome.runtime.lastError);
      alert("Save failed: " + chrome.runtime.lastError.message);
    } else {
      console.log("Note saved:", note);
      updateTimestamp();
    }
  });

  updateWordCount();
});

// --- load saved note + timestamp ---
chrome.storage.local.get(["myNote", "lastSaved"], (data) => {
  if (data.myNote) {
    textarea.value = data.myNote;
    updateWordCount();
  }
  if (data.lastSaved) {
    lastSaved.textContent = "Last saved: " + formatTimestamp(data.lastSaved);
  }
});

// --- clear modal logic ---
clearBtn.addEventListener("click", () => {
  if (textarea.value.trim() === "") {
    console.log("Notepad is empty");
  } else {
    modal.style.display = "flex";
  }
});

confirmYes.addEventListener("click", () => {
  chrome.storage.local.remove("myNote", () => {
    textarea.value = "";
    updateWordCount();
    console.log("Note deleted");
    modal.style.display = "none";
  });
});

confirmNo.addEventListener("click", () => {
  console.log("Delete canceled");
  modal.style.display = "none";
});

// --- theme toggle ---
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  themeIcon.src = isDark ? "assets/darkMode.svg" : "assets/lightMode.svg";

  chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
});

chrome.storage.local.get("theme", (data) => {
  if (data.theme === "dark") {
    document.body.classList.add("dark");
    themeIcon.src = "assets/darkMode.svg";
  } else {
    themeIcon.src = "assets/lightMode.svg";
  }
});

// --- export button ---
exportBtn.addEventListener("click", () => {
  const note = textarea.value;
  if (!note.trim()) {
    console.log("Nothing to export");
    return;
  }

  const blob = new Blob([note], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "note.txt";
  a.click();

  URL.revokeObjectURL(url);
  console.log("Note exported as note.txt");
});
