const textarea = document.getElementById("note");
const clearBtn = document.getElementById("clear");
const modal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const toggleTheme = document.getElementById("toggleTheme");
const themeIcon = document.getElementById("themeIcon");
const exportBtn = document.getElementById("export");

// Load saved note
chrome.storage.local.get("myNote", (data) => {
  if (data.myNote) {
    textarea.value = data.myNote;
  }
});

// Auto-save while typing
textarea.addEventListener("input", () => {
  const note = textarea.value;
  chrome.storage.local.set({ myNote: note }, () => {
    console.log("Note saved:", note);
  });
});

// Open modal on Clear
clearBtn.addEventListener("click", () => {
  if (textarea.value.trim() === "") {
    console.log("Notepad is empty");
  } else {
    modal.style.display = "flex";
  }
});

// Confirm delete
confirmYes.addEventListener("click", () => {
  chrome.storage.local.remove("myNote", () => {
    textarea.value = "";
    console.log("Note deleted");
    modal.style.display = "none";
  });
});

// Cancel delete
confirmNo.addEventListener("click", () => {
  console.log("Delete canceled");
  modal.style.display = "none";
});

// Toggle theme
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  // Change icon
  themeIcon.src = isDark ? "assets/darkMode.svg" : "assets/lightMode.svg";

  // Save preference
  chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
});

// Load saved theme
chrome.storage.local.get("theme", (data) => {
  if (data.theme === "dark") {
    document.body.classList.add("dark");
    themeIcon.src = "assets/darkMode.svg"; // show moon if dark
  } else {
    themeIcon.src = "assets/lightMode.svg"; // show sun if light
  }
});

exportBtn.addEventListener("click", () => {
  const note = textarea.value;

  if (!note.trim()) {
    console.log("Nothing to export");
    return;
  }

  // Create a blob with the note content
  const blob = new Blob([note], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Create a hidden link and click it
  const a = document.createElement("a");
  a.href = url;
  a.download = "note.txt";
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);

  console.log("Note exported as note.txt");
});
