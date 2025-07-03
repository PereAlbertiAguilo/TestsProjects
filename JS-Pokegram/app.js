const thumbnail = document.getElementById("card-thumbnail");
const username = document.getElementById("card-username");
const footerUsername = document.getElementById("card-footer-username");
const image = document.getElementById("card-img");
const likes = document.getElementById("card-likes");
const coments = document.getElementById("card-coments");
const shares = document.getElementById("card-shares");
const audio = document.getElementById("audio");
const coment = document.getElementById("card-footer-coment");
const pokemonInput = document.getElementById("pokemon-input");
const suggestionsBox = document.getElementById("suggestions");

let canPlaySound = true;

// Pokeapi URL
const URL = "https://pokeapi.co/api/v2/pokemon/";

let pokemon;
let pokemonList = [];

window.onload = start;

// Gets a list of all avalible pokemons form the API and
// sets "Pikachu" as the initial displayed pokemon
async function start() {
  fetchPokemonList();
  pokemon = await getPokemon("pikachu");
  displayData();
}

// Gets a list of all avalible pokemons form the API
async function fetchPokemonList() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1302");
  const data = await response.json();
  pokemonList = data.results.map((p) => p.name);
}

// Fetches a pokemon from a form element and displays its data
async function fetchPokemon(event) {
  event.preventDefault();
  if (!pokemonList.includes(pokemonInput.value)) return;
  try {
    pokemon = await getPokemon(pokemonInput.value);
    displayData();
  } catch (error) {
    console.error(error);
  }
}

// Gets a specific pokemon object from the API
async function getPokemon(pokemon) {
  return await fetch(URL + pokemon)
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

// Gets an flavour text object form the current pokemon data
async function getFlavorTexts() {
  return await fetch(pokemon.species.url)
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

// Gets a random flavor text depending on a specific
// language from the current pokemon falvour text object
async function getSpecificLanguageFlavourText(language) {
  const flavorTexts = await getFlavorTexts()
    .then((data) => {
      return data.flavor_text_entries;
    })
    .catch((error) => console.error(error));
  const filteredFlavourTexts = flavorTexts.filter((entrie) => {
    return entrie.language.name === String(language);
  });
  const randomTextIndex = Math.floor(
    Math.random() * (filteredFlavourTexts.length - 1)
  );

  return filteredFlavourTexts[randomTextIndex].flavor_text;
}

// Displays the API data to its corresponding HTML element
async function displayData() {
  console.log(pokemon);

  const thumbnailSrc = pokemon.sprites.front_default;
  const imageSrc = pokemon.sprites.other["official-artwork"].front_default;
  const capitalizedName = capitalize(pokemon.name);
  const flavourText = await getSpecificLanguageFlavourText("en");

  thumbnail.setAttribute("src", thumbnailSrc || imageSrc);
  getAverageColor(thumbnailSrc || imageSrc).then(
    (rgb) => (thumbnail.style.backgroundColor = rgb)
  );
  image.setAttribute("src", imageSrc || thumbnailSrc);
  getAverageColor(imageSrc || thumbnailSrc, true).then(
    (rgb) => (image.style.backgroundColor = rgb)
  );

  username.textContent = capitalizedName;
  footerUsername.textContent = capitalizedName;
  coment.textContent = flavourText;

  likes.textContent = "" + pokemon.base_experience + " xp";
  coments.textContent = "" + pokemon.height / 10 + "m";
  shares.textContent = "" + pokemon.weight / 10 + "kg";
}

// Gets the current pokemon cry audio track ".OGG"
async function getPokemonSound() {
  return await fetch(pokemon.cries.latest)
    .then((response) => {
      return response.url;
    })
    .catch((error) => console.error(error));
}

// Plays the current pokemon cry audio
async function playPokemonCry() {
  if (!canPlaySound) return;
  const audio = await getPokemonSound();
  let cry = new Audio(audio);
  cry.onloadedmetadata = () => {
    canPlaySound = false;
    cry.volume = 0.1;
    cry.play();
    setTimeout(() => {
      canPlaySound = true;
    }, cry.duration * 1000);
  };
}

// Utility function to capitalize a string
function capitalize(string) {
  return String(string).charAt(0).toUpperCase() + String(string).slice(1);
}

// Function that gets the average color of a source
// img by reducing its resolution to a single pixel
// and returns that pixel color as an RGB value
// (normal or inverted)
function getAverageColor(src, inverted = false) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;

    const img = new Image();
    img.crossOrigin = "";
    img.src = src;

    img.onload = function () {
      context.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;

      const invertedR = 255 - r;
      const invertedG = 255 - g;
      const invertedB = 255 - b;

      resolve(
        `rgb(${inverted ? invertedR : r}, ${inverted ? invertedG : g}, ${
          inverted ? invertedB : b
        })`
      );
    };

    img.onerror = function () {
      resolve(`rgb(255, 255, 255)`);
    };
  });
}

// Event Listeners

// Audio player
audio.addEventListener("click", playPokemonCry);

// Creates a suggestion box depending on the current
// value of an input element
pokemonInput.addEventListener("input", () => {
  const input = pokemonInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";
  suggestionsBox.classList.add("display");

  if (input.length === 0) return;
  suggestionsBox.classList.remove("display");

  const filtered = pokemonList
    .filter((name) => name.startsWith(input))
    .slice(0, 10);

  filtered.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => {
      pokemonInput.value = name;
      suggestionsBox.classList.add("display");
      pokemonInput.focus();
    });
    suggestionsBox.appendChild(li);
  });
});

// Closes the suggestion box if you click clicked
// anywhere except the input element or suggestion box
document.addEventListener("click", (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== pokemonInput) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("display");
  }
});
