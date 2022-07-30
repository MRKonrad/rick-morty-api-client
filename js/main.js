// DOM
const search = document.getElementById('search');
const searchStats = document.getElementById('search-stats');
const characterList = document.getElementById('character-list');
const characterDetails = document.getElementById('character-details');
let PREV = null
let NEXT = null

// queries
const apiUrl = 'https://rickandmortyapi.com/graphql';
const characterListQuery = 
`query ($inputName: String, $page: Int) {
    characters(page: $page, filter: { name: $inputName }) {
      info {
        count,
        pages,
        prev,
        next,
      }
      results {
        id,
        name,
      }
    }
  }`;
const characterDetailsQuery = 
`query ($inputId: ID!){
    character(id: $inputId ) {
        name,
        status,
        species,
        type,
        gender,
        origin {name},
        location {name},
        image,
      }
    }`;

// funtions
const searchCharacters = async (inputName, page) => {
    if (inputName.length === 0 || page === null) {
        displayCharacterList([])
        return
    }
    const { characters, info } = await characterListFetch(inputName, page)
    info.page = page
    PREV = info.prev;
    NEXT = info.next;
    displayCharacterList(characters, info)
    displayCharacterDetails("");
}

const searchKeyPressFeedback = async (event, inputName) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const characters = await characterListFetch(inputName);
        const id = characters.length > 0 ? characters[0].id : "";
        displayCharacterDetails(id);
    }
}

const characterDetailsFetch = async inputId => {
    if (inputId === "") {
        return [];
    }
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: characterDetailsQuery,
            variables: { inputId }
        })
    });
    const result = await res.json();
    const character = result.data.character;
    return character;
}

const characterListFetch = async (inputName, page) => {
    if (inputName === "") {
        return [];
    }
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: characterListQuery,
            variables: { inputName, page }
        })
    })
    const result = await res.json();
    const characters = result.data.characters.results;
    const info = result.data.characters.info;
    return { characters, info };
}

const displayCharacterList = async (characters, info) => {
    if (characters.length < 1) {
        characterList.innerHTML = ""
        searchStats.innerHTML = ""
        return
    }
    const html = characters.map(character =>
        `<button 
            class="btn w-100 text-start btn-outline-dark" 
            onfocus="displayCharacterDetails(${character.id})">    
        <small>${character.name}</small>
        </button>
        `).join('')
    searchStats.innerHTML = info.page + "/" + info.pages
    characterList.innerHTML = html
}

function previousPage() {
    searchCharacters(search.value, PREV);
}

function nextPage() {
    searchCharacters(search.value, NEXT);
}

const displayCharacterDetails = async id => {
    if (id === "") {
        characterDetails.innerHTML = "";
        return;
    }
    const character = await characterDetailsFetch(id);
    const html =
        `<div class="card">
            <h3 class="card-header">${character.name}</h3>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Status: ${character.status}</li>
                    <li class="list-group-item">Origin: ${character.origin.name}</li>
                    <li class="list-group-item">Species: ${character.species}</li>
                    <li class="list-group-item">Gender: ${character.gender}</li>
                </ul>
            </div>
            <div class="card-body text-center">
                <img src="${character.image}" class="img-fluid rounded" alt="${character.name}">
            </div>
            <div class="card-footer text-muted">
                Last known location: ${character.location.name}
            </div>
        </div>`;
    characterDetails.innerHTML = html;
}

// events
search.addEventListener('input', () => searchCharacters(search.value, 1));
search.addEventListener('keypress', (e) => searchKeyPressFeedback(e, search.value));
