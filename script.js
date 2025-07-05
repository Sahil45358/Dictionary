let currentMode = 'reverse';

let historyList = JSON.parse(localStorage.getItem("history")) || [];

let favoriteList = JSON.parse(localStorage.getItem('favorites')) || [];

function findWords() {
  const input = document.getElementById('description').value.trim();
  const pos = document.getElementById('partOfSpeech').value;
  const rel = document.getElementById('relationship').value || 'ml';
  const translateTo = document.getElementById('translateTo').value;

  const output = document.getElementById('results');
  const loading = document.getElementById('loading');
  
  output.innerHTML = "";
  if (!input) {
    output.innerHTML = "<p>Please enter something above.</p>";
    return;
  }

  if (currentMode === 'dictionary') {
    return lookupWord(input);
  }
  loading.classList.remove('hidden');

  if (!historyList.includes(input)) {
    historyList.push(input);
    updateHistory();
  }

  const baseURL = `https://api.datamuse.com/words?${rel}=${encodeURIComponent(input)}`;
  const query = pos ? `${baseURL}&topics=${pos}` : baseURL;

  fetch(query)
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

        if (translateTo) {
          translateWord(word, translateTo, card);
        }
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
      const firstEntry = data[0];
      const meaning = firstEntry?.meanings?.[0];
      const definition = meaning?.definitions?.[0]?.definition || "Definition not found.";
      const partOfSpeech = meaning?.partOfSpeech || "—";

      const cards = document.querySelectorAll(".result-card");
      cards.forEach(card => {
        if (card.innerHTML.includes(`<strong>${word}</strong>`)) {
          card.querySelector("em").innerHTML = `<strong>${partOfSpeech}</strong>: ${definition}`;
        }
      });
    })
    .catch(() => {
      const cards = document.querySelectorAll(".result-card");
      cards.forEach(card => {
        if (card.innerHTML.includes(`<strong>${word}</strong>`)) {
          card.querySelector("em").textContent = "No definition found.";
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
  localStorage.setItem("history", JSON.stringify(historyList));

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

function translateWord(word, lang, card) {
  fetch("https://translate.argosopentech.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: word,
      source: "en",
      target: lang,
      format: "text"
    })
  })
  .then(res => res.json())
  .then(data => {
    const translated = data.translatedText;
    const translationNode = document.createElement("div");
    translationNode.innerHTML = `<small><strong>Translated:</strong> ${translated}</small>`;
    card.appendChild(translationNode);
  })
  .catch(() => {
    const fallback = document.createElement("div");
    fallback.innerHTML = `<small style="color: #999;">Translation unavailable</small>`;
    card.appendChild(fallback);
  });
}

function setMode(mode) {
  currentMode = mode;
  const placeholder = mode === 'dictionary'
    ? "Enter a single word to look up..."
    : "Describe a concept or feeling...";
  document.getElementById("description").placeholder = placeholder;
  clearInput();
}

function lookupWord(word) {
  const output = document.getElementById('results');
  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => res.json())
    .then(data => {
      loading.classList.add('hidden');

      if (!data || data.title === "No Definitions Found") {
        output.innerHTML = `<div class="result-card">No definition found.</div>`;
        return;
      }

      const entry = data[0];
      const phonetics = entry.phonetics?.[0]?.text || "";
      const audio = entry.phonetics?.[0]?.audio || "";
      const card = document.createElement("div");
      card.className = "result-card";

      let content = `<strong>${word}</strong>`;
      if (phonetics) content += ` <small>(${phonetics})</small>`;
      if (audio) content += ` <audio controls src="${audio}"></audio>`;

entry.meanings.forEach(meaning => {
  const pos = meaning.partOfSpeech;
  const icon = getPOSIcon(pos);
  content += `<div><em><strong><span class="part-icon">${icon}</span>${pos}</strong></em><ul>`;
  meaning.definitions.slice(0, 2).forEach(def => {
    const highlighted = def.definition.replace(new RegExp(word, 'gi'), match => `<span class="highlight">${match}</span>`);
    content += `<li>${highlighted}`;
    if (def.example) content += `<br><small><em>Example: ${def.example}</em></small>`;
    content += `</li>`;
  });
  content += `</ul></div>`;
});


      card.innerHTML = content;
      output.appendChild(card);
    })
    .catch(() => {
      loading.classList.add('hidden');
      output.innerHTML = `<div class="result-card">Error fetching word.</div>`;
    });
}

function getPOSIcon(pos) {
  switch (pos) {
    case 'noun': return '📘';
    case 'verb': return '🛠';
    case 'adjective': return '🎨';
    case 'adverb': return '🏃';
    case 'interjection': return '❗';
    case 'pronoun': return '🙋';
    case 'conjunction': return '🔗';
    case 'preposition': return '📍';
    default: return '📄';
  }
}
