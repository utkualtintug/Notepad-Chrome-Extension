const textarea = document.getElementById("note");
const toggleTheme = document.getElementById("toggleTheme");
const themeIcon = document.getElementById("themeIcon");
const exportBtn = document.getElementById("export");
const exportAllBtn = document.getElementById("exportAll");
const lastSaved = document.getElementById("lastSaved");
const wordCount = document.getElementById("wordCount");
const noteList = document.getElementById("noteList");
const newNoteBtn = document.getElementById("newNote");

let notes = [];
let currentNoteId = null;

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

// --- render note list ---
function renderNotes() {
  noteList.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "note-item";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = note.title || `Note ${index + 1}`;
    titleSpan.className = "note-title";
    titleSpan.addEventListener("click", () => loadNote(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e;
      notes.splice(index, 1);
      if (currentNoteId === index) {
        textarea.value = "";
        currentNoteId = null;
      }
      saveNotes();
      renderNotes();
    });

    div.appendChild(titleSpan);
    div.appendChild(deleteBtn);

    if (index === currentNoteId) {
      div.classList.add("active");
    }

    noteList.appendChild(div);
  });
}

// --- load note ---
function loadNote(index) {
  currentNoteId = index;
  textarea.value = notes[index].content;
  updateWordCount();
  renderNotes();
}

// --- save notes ---
function saveNotes() {
  chrome.storage.local.set({ notes }, () => {
    console.log("Notes saved:", notes);
  });
}

// --- new note ---
newNoteBtn.addEventListener("click", () => {
  const newNote = { title: "Untitled", content: "" };
  notes.unshift(newNote);
  currentNoteId = 0;
  textarea.value = "";
  renderNotes();
  saveNotes();
});

// --- input handler (save + timestamp + word count) ---
textarea.addEventListener("input", () => {
  if (notes.length === 0) {
    const newNote = { title: "Untitled", content: "" };
    notes.push(newNote);
    currentNoteId = 0;
  }

  if (currentNoteId !== null) {
    notes[currentNoteId].content = textarea.value;
    notes[currentNoteId].title = textarea.value.split("\n")[0].slice(0, 20);

    saveNotes();
    updateTimestamp();
    updateWordCount();
    renderNotes();
  }
});

// --- load saved notes + timestamp ---
chrome.storage.local.get(["notes", "lastSaved"], (data) => {
  if (data.notes && data.notes.length > 0) {
    notes = data.notes;
    currentNoteId = 0; // ilk notu aç
    textarea.value = notes[0].content;
    updateWordCount();
  } else {
    const newNote = { title: "Untitled", content: "" };
    notes.push(newNote);
    currentNoteId = 0;
    textarea.value = "";
    saveNotes();
  }

  renderNotes();

  if (data.lastSaved) {
    lastSaved.textContent = "Last saved: " + formatTimestamp(data.lastSaved);
  }
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
exportAllBtn.addEventListener("click", () => {
  if (!notes.length) {
    alert("No notes to export");
    return;
  }

  const allText = notes
    .map((n, i) => `# Note ${i + 1}: ${n.title}\n${n.content}`)
    .join("\n\n---\n\n");

  const blob = new Blob([allText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "notes.txt";
  a.click();

  URL.revokeObjectURL(url);
  console.log("Notes exported as notes.txt");
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
