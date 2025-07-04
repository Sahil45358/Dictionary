function findWords() {
  const input = document.getElementById('description').value.trim().toLowerCase();
  const output = document.getElementById('results');
  const loading = document.getElementById('loading');

  output.innerHTML = "";
  if (!input) {
    output.innerHTML = "<p>Please enter a description above.</p>";
    return;
  }

  loading.classList.remove('hidden');

  setTimeout(() => {
    loading.classList.add('hidden');

    const database = {
      "comfort": ["serenity", "resilience", "sanctuary"],
      "sadness": ["melancholy", "bittersweet", "elegy"],
      "forgotten": ["oblivion", "limerence", "athanasy"],
      "longing": ["wanderlust", "saudade", "fernweh"],
      "peace": ["tranquility", "calm", "nirvana"],
      "fear": ["anxiety", "trepidation", "angst"]
    };

    let matches = [];

    Object.entries(database).forEach(([keyword, words]) => {
      if (input.includes(keyword)) {
        matches.push(...words);
      }
    });

    if (matches.length === 0) {
      output.innerHTML = `<div class="result-card">No strong matches found. Try rephrasing or using simpler terms.</div>`;
    } else {
      output.innerHTML = matches
        .map(word => `<div class="result-card">${word}</div>`)
        .join('');
    }
  }, 800);
}

function clearInput() {
  document.getElementById('description').value = "";
  document.getElementById('results').innerHTML = "";
}
