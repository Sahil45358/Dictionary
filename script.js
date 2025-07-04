let historyList = [];
let favoriteList = JSON.parse(localStorage.getItem('favorites')) || [];

function findWords() {
  const input = document.getElementById('description').value.trim();
  const output = document.getElementById('results');
  const loading = document.getElementById('loading');

  output.innerHTML = "";
  if (!input) {
    output.innerHTML = "<p>Please enter a description above.</p>";
    return;
  }

  loading.classList.remove('hidden');

  if (!historyList.includes(input)) {
    historyList.push(input);
    updateHistory();
  }

  // Use Datamuse to find related words
  fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(input)}`)
    .then(res => res.json())
    .then(words => {
      loading.classList.add('hidden');
      if (!words.length) {
        output.innerHTML = `<div class="result-card">No suggestions found. Try rephrasing.</div>`;
        return;
      }

      words.slice(0, 10).forEach(wordObj => {
        const word = wordObj.word;
        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
          <strong>${word}</strong><br>
          <em>Loading definition...</em>
          <span class="fav" onclick="toggleFavorite('${word}')">❤️</span>
        `;
        output.appendChild(card);
        fetchDefinition(word);
      });
    })
    .catch(() => {
      loading.classList.add('hidden');
      output.innerHTML = `<div class="result-card">Error loading suggestions.</div>`;
    });
}

function fetchDefinition(word) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => res.json())
    .then(data => {
      const def = data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found.";
      const cards = document.querySelectorAll(".result-card");
      cards.forEach(card => {
        if (card.innerHTML.includes(`<strong>${word}</strong>`)) {
          card.querySelector("em").textContent = def;
        }
      });
    });
}

function clearInput() {
  document.getElementById('description').value = "";
  document.getElementById('results').innerHTML = "";
}

function updateHistory() {
  const list = document.getElementById('history');
  list.innerHTML = "";
  historyList.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => {
      document.getElementById('description').value = item;
      findWords();
    };
    list.appendChild(li);
  });
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  const button = document.getElementById("darkToggle");
  button.textContent = isDark ? "☀️" : "🌙";
}


function toggleFavorite(word) {
  if (favoriteList.includes(word)) {
    favoriteList = favoriteList.filter(w => w !== word);
  } else {
    favoriteList.push(word);
  }
  localStorage.setItem("favorites", JSON.stringify(favoriteList));
  updateFavorites();
}

function updateFavorites() {
  const favContainer = document.getElementById("favorites");
  favContainer.innerHTML = "";
  favoriteList.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    li.onclick = () => {
      document.getElementById('description').value = word;
      findWords();
    };
    favContainer.appendChild(li);
  });
}

function submitWord(event) {
  event.preventDefault();
  const word = document.getElementById("userWord").value.trim();
  const meaning = document.getElementById("userDescription").value.trim();
  if (!word || !meaning) return;

  document.getElementById("submissionStatus").textContent = "✅ Thank you! Your word was submitted.";
  document.getElementById("submitForm").reset();

  // This is just UI — no actual backend.
  setTimeout(() => {
    document.getElementById("submissionStatus").textContent = "";
  }, 3000);
}

function toggleHistory() {
  const historyList = document.getElementById("history");
  const icon = document.getElementById("toggleIcon");
  const isCollapsed = historyList.classList.toggle("collapsed");
  icon.textContent = isCollapsed ? "▼" : "▲";
}
updateHistory();
updateFavorites();
