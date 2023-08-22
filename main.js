/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];

// Build an 'original' deck of 'card' objects used to create shuffled decks
const originalDeck = buildOriginalDeck();
renderDeckInContainer(originalDeck, document.getElementById('original-deck-container'));

/*----- app's state (variables) -----*/
let shuffledDeck;
let playerHand = [];
let dealerHand = [];
let gameOver = false;

/*----- cached element references -----*/
const shuffledContainer = document.getElementById('shuffled-deck-container');
const playerContainer = document.getElementById('player-hand-container');
const dealerContainer = document.getElementById('dealer-hand-container');
const resultContainer = document.getElementById('result-container');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');

/*----- event listeners -----*/
document.querySelector('button').addEventListener('click', renderNewShuffledDeck);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);

/*----- functions -----*/
function getNewShuffledDeck() {
  // Create a copy of the originalDeck (leave originalDeck untouched!)
  const tempDeck = [...originalDeck];
  const newShuffledDeck = [];
  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length);
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
  }
  return newShuffledDeck;
}

function renderNewShuffledDeck() {
  // Create a copy of the originalDeck (leave originalDeck untouched!)
  shuffledDeck = getNewShuffledDeck();
  resultContainer.textContent = "";
  playerHand = [shuffledDeck.shift(), shuffledDeck.shift()];
  dealerHand = [shuffledDeck.shift(), shuffledDeck.shift()];
  renderDeckInContainer(shuffledDeck, shuffledContainer);
  renderDeckInContainer(playerHand, playerContainer);
  renderDeckInContainer(dealerHand, dealerContainer);
}

function renderDeckInContainer(deck, container) {
  container.innerHTML = '';
  // Let's build the cards as a string of HTML
  let cardsHtml = '';
  deck.forEach(function(card) {
    cardsHtml += `<div class="card ${card.face}"></div>`;
  });
  // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup 
  // const cardsHtml = deck.reduce(function(html, card) {
  //   return html + `<div class="card ${card.face}"></div>`;
  // }, '');
  container.innerHTML = cardsHtml;
}

function buildOriginalDeck() {
  const deck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function(suit) {
    ranks.forEach(function(rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjack, not war
        value: Number(rank) || (rank === 'A' ? 11 : 10)
      });
    });
  });
  return deck;
}

function hit(){
  let playerValue = calculateHandValue(playerHand);
  if (shuffledDeck.length > 0 && playerValue < 21) {
  const newCard = shuffledDeck.shift();
  playerHand.push(newCard);
  renderDeckInContainer(playerHand, playerContainer);
  renderDeckInContainer(shuffledDeck, shuffledContainer);
  playerValue = calculateHandValue(playerHand);
  if (playerValue > 21) {
      const result = "Dealer Wins"
      gameOver = true;
      displayResult(result);
      // add in gameover
  }
  else if (playerValue === 21) {
    shuffledContainer.textContent = "Win already still hit!";
  }
} 
console.log(playerValue);
  if (gameOver) {
    if (gameOver) {
      setTimeout(renderNewShuffledDeck, 2000);
    }
  }
}

function stand(){
  //determine winner
  const playerValue = calculateHandValue(playerHand);
  if (playerValue < 12) {
    return shuffledContainer.textContent = "eh hit la"
  }

  let dealerValue = calculateHandValue(dealerHand);
  while(dealerValue < 17) {
    const newCard = shuffledDeck.shift();
    dealerHand.push(newCard);
    renderDeckInContainer(dealerHand, dealerContainer);
    renderDeckInContainer(shuffledDeck, shuffledContainer);
    dealerValue = calculateHandValue(dealerHand);
  }
  console.log(dealerValue);//test
  if (dealerValue > 21 || playerValue > dealerValue) {
    const result = "Player Wins";
    gameOver = true;
    displayResult(result);
  } else if (playerValue < dealerValue) {
    const result = "Dealer Wins!";
    gameOver = true;
    displayResult(result);
  } else if (playerValue === dealerValue) {
    const result = "Push!"
    gameOver = true;
    displayResult(result);
  }
  if (gameOver) {
    setTimeout(renderNewShuffledDeck, 2000);
  }
}

function calculateHandValue(deck) {
  let handValue = 0;
  let aceCount = 0;
  deck.forEach((card) => {
    if(card.value !== 11){
  handValue += card.value;
} else {
  aceCount++;
}
});

if (aceCount === 2){
  handValue += 2;
} else if (aceCount === 1 && handValue > 10) {
  handValue +=1;
} else if (aceCount === 1 && handValue <= 10) {
  handValue +=11;
} else if (aceCount > 2) {
  handValue += aceCount - 1;
}
return handValue;
}

function blackJack (deck, name) {
  if ((deck[0].value === 10 && deck[1].value === 11) || (deck[0].value === 11 && deck[1].value === 10)) {
    displayResult(`${name} wins!`)
  }
}
//================== even game, wager, next game, soft/hard display values
// deposit -> wager -> play -> actions -> checkresult -> restart

function displayResult(result) {
  resultContainer.textContent = result;
}


//initialise the game
renderNewShuffledDeck();