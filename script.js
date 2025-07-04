function findWords() {
  const description = document.getElementById('description').value.trim().toLowerCase();
  const output = document.getElementById('results');

  if (!description) {
    output.innerHTML = "<p>Please enter a description.</p>";
    return;
  }

  const mockDatabase = {
    "comfort in a storm": ["serenity", "resilience", "sanctuary"],
    "beauty in sadness": ["melancholy", "bittersweet", "elegy"],
    "fear of being forgotten": ["oblivion", "limerence", "athanasy"],
    "longing for a distant place": ["wanderlust", "saudade", "fernweh"],
  };

  let matches = [];

  for (let key in mockDatabase) {
    if (description.includes(key)) {
      matches = mockDatabase[key];
      break;
    }
  }

  if (matches.length === 0) {
    matches = ["No exact match found. Try rephrasing your description."];
  }

  output.innerHTML = `
    <h3>Suggested Words:</h3>
    <ul>${matches.map(word => `<li>${word}</li>`).join('')}</ul>
  `;
}
