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
let depositedAmount = 0;
let betAmount = 0;
let playerBlackjack = false;


/*----- cached element references -----*/
const shuffledContainer = document.getElementById('shuffled-deck-container');
const playerContainer = document.getElementById('player-hand-container');
const dealerContainer = document.getElementById('dealer-hand-container');
const resultContainer = document.getElementById('result-container');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const betButton = document.getElementById('bet-button');
const showBetAmount = document.getElementById('bet-amount');
const depositButton = document.getElementById('deposit-button');
const showDepositedAmount = document.getElementById('deposit-amount');
let playerCount = document.getElementById('player-count');
let dealerCount = document.getElementById('dealer-count');
showDepositedAmount.textContent = depositedAmount;
showBetAmount.textContent = betAmount;

/*----- event listeners -----*/
document.querySelector('button').addEventListener('click', renderNewShuffledDeck);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
depositButton.addEventListener('click', deposit);
betButton.addEventListener('click', bet);

/*----- functions -----*/
function deposit(e){
  e.preventDefault();
  const depositInput = document.getElementById('deposit-input');
  const depositValue = parseInt(depositInput.value);
  if(!isNaN(depositValue) && depositValue >=5){
    depositedAmount += depositValue;
    showDepositedAmount.textContent = `$${depositedAmount}`;
    depositInput.value = '';
  } else {
    showDepositedAmount.textContent = "Please enter a valid amount!";
    depositInput.value = '';
  }
};

function bet(e) {
  e.preventDefault();
  const betInput = document.getElementById('bet-input');
  const betValue = parseInt(betInput.value);
  if (!isNaN(betValue) && betValue >= 5 && betValue <= depositedAmount) {
    betAmount += betValue;
    showBetAmount.textContent = `$${betAmount}`;
    betInput.value = '';
    depositedAmount -= betValue;
    showDepositedAmount.textContent = `$${depositedAmount}`;
  } else {
    showBetAmount.textContent = 'Insufficient balance!'
    betInput.value = '';
  }
}

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

function count(){
  let totalCount = 0
  playerHand.forEach((card) => {
    totalCount += card.value;
  });
  playerCount.textContent = totalCount;
}

function hit(){
  if (betAmount < 5){
    resultContainer.textContent = "Please enter your bet!"
  } else {
  blackJack(playerHand, "Player");
  blackJack(dealerHand, "Computer");
  let playerValue = calculateHandValue(playerHand);
  if (shuffledDeck.length > 0 && playerValue < 21) {
  const newCard = shuffledDeck.shift();
  playerHand.push(newCard);
  renderDeckInContainer(playerHand, playerContainer);
  renderDeckInContainer(shuffledDeck, shuffledContainer);
  playerValue = calculateHandValue(playerHand);
  count();
  if (playerValue > 21) {
      const result = "Dealer Wins"
      gameOver = true;
      displayResult(result);
  }
  else if (playerValue === 21) {
    shuffledContainer.textContent = "Win already still hit!";
  }
}
}
if (gameOver) { //CHANGE TO DISABLE CLICK EVENT
  setTimeout(renderNewShuffledDeck, 2000);
  showBetAmount.textContent = 0;
}
}

function stand(){
  if (betAmount < 5){
    resultContainer.textContent = "Please enter your bet!"
  } else {
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
    const result = "Player Wins!";
    gameOver = true;
    payOut();
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
}
if (gameOver) { //CHANGE TO DISABLE CLICK
  setTimeout(renderNewShuffledDeck, 2000);
  showBetAmount.textContent = 0;
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
    playerBlackjack = true;
    payOut();
    displayResult(`Blackjack!! ${name} Wins!`);
  }
}

function displayResult(result) {
  resultContainer.textContent = result;
}

function payOut(){
  let wonAmount = 0
  if (playerBlackjack === true) {
    wonAmount = (betAmount * 3 / 2) + betAmount
    depositedAmount += wonAmount;
    showDepositedAmount.textContent = `$${depositedAmount}`;
    return wonAmount;
  } else {
    wonAmount = betAmount * 2
    depositedAmount += wonAmount;
    showDepositedAmount.textContent = `$${depositedAmount}`;
    return wonAmount;
  }
}


//initialise the game
renderNewShuffledDeck();

//================== even game, wager, next game, soft/hard display values
//================== local storage
// deposit -> wager -> play -> hit/stand -> checkresult -> restart -> use the current deck
//NEED TO DO
// game logic for hit and stand -> placement of if (gameover) -> settle the count
//show soft/hard displayer
//use current deck
//refine gameover function -> remove button click