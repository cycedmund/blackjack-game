/*----- constants -----*/
const suits = ["s", "c", "d", "h"];
const ranks = [
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

// Build an 'original' deck of 'card' objects used to create shuffled decks
// renderDeckInContainer(
//   mainDeck,
//   document.getElementById("original-deck-container")
// );

/*----- app's state (variables) -----*/
let shuffledDeck;
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let depositedAmount = 0;
let betAmount = 0;
let playerBlackjack = false;
let dealInProgress = false;

/*----- cached element references -----*/
const dealButton = document.getElementById("deal-button");
const shuffledContainer = document.getElementById("shuffled-deck-container");
const playerContainer = document.getElementById("player-hand-container");
const dealerContainer = document.getElementById("dealer-hand-container");
const resultContainer = document.getElementById("result-container");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const showBetAmount = document.getElementById("bet-amount");
const depositButton = document.getElementById("deposit-button");
const showDepositedAmount = document.getElementById("deposit-amount");
const chipBet = document.querySelector(".chip-field");
let playerCount = document.getElementById("player-count");
let dealerCount = document.getElementById("dealer-count");
showDepositedAmount.textContent = depositedAmount;
showBetAmount.textContent = betAmount;

/*----- event listeners -----*/
chipBet.addEventListener("click", bet);
dealButton.addEventListener("click", deal);
hitButton.addEventListener("click", hit);
standButton.addEventListener("click", stand);
depositButton.addEventListener("click", deposit);

/*----- functions -----*/
function deposit() {
  const depositInput = document.getElementById("deposit-input");
  const depositValue = parseInt(depositInput.value);
  //The parseInt function converts its first argument to a string, parses that string, then returns an integer or NaN . If not NaN , the return value will be the integer that is the first argument taken as a number in the specified radix
  if (!isNaN(depositValue) && depositValue >= 5) {
    depositedAmount += depositValue;
    showDepositedAmount.textContent = `$${depositedAmount}`;
    depositInput.value = "";
  } else {
    showDepositedAmount.textContent = "Please enter a valid amount!";
    depositInput.value = "";
  }
}

function bet(e) {
  //https://gomakethings.com/listening-for-events-on-multiple-elements-using-javascript-event-delegation
  if (dealInProgress) {
    return;
  } else if (e.target.matches(".bet-input")) {
    if (betAmount < depositedAmount) {
      betAmount += parseInt(e.target.value);
      //e.target.value returns a string -> console.log(typeof e.target.value)
      showBetAmount.textContent = `$${betAmount}`;
      depositedAmount -= betAmount;
      showDepositedAmount.textContent = `$${depositedAmount}`;
    } else {
      showBetAmount.textContent = "Insufficient balance!";
    }
  }
}

function getNewShuffledDeck() {
  const mainDeck = buildMainDeck();
  const shuffledDeck = [];
  while (mainDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * mainDeck.length);
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    shuffledDeck.push(mainDeck.splice(rndIdx, 1)[0]);
  }
  return shuffledDeck;
}

function showCard(deck, container) {
  //classlist is on the element not the "card"
  const cards = container.querySelectorAll(".card");
  cards.forEach((div, index) => {
    if (deck[index]) {
      div.classList.remove("back-blue");
      div.classList.add("xlarge"); //can consider removing if can stack cards
      div.classList.add(`${deck[index].face}`);
    }
  });
  return cards;
}

function renderNewShuffledDeck() {
  // Create a copy of the mainDeck (leave mainDeck untouched!)
  shuffledDeck = getNewShuffledDeck();
  resultContainer.textContent = "";
  playerHand = [shuffledDeck.shift(), shuffledDeck.shift()];
  dealerHand = [shuffledDeck.shift(), shuffledDeck.shift()];
  renderDeckInContainer(shuffledDeck, shuffledContainer);
  renderDeckInContainer(playerHand, playerContainer);
  showCard(playerHand, playerContainer);

  // update values
  showBetAmount.textContent = `$${betAmount}`;
  showDepositedAmount.textContent = `$${depositedAmount}`;

  //Reset counts and show counts
  playerCount.textContent = "";
  dealerCount.textContent = "";
  displayHandCount(playerHand, playerCount, playerContainer);
}

function renderDeckInContainer(deck, container) {
  container.innerHTML = "";
  // Let's build the cards as a string of HTML
  let cardsHtml = "";
  deck.forEach(function (card) {
    cardsHtml += `<div class="card back-blue"></div>`;
  });
  // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup
  // const cardsHtml = deck.reduce(function(html, card) {
  //   return html + `<div class="card ${card.face}"></div>`;
  // }, '');
  container.innerHTML = cardsHtml;
}

function buildMainDeck() {
  const deck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjack, not war
        value: Number(rank) || (rank === "A" ? 11 : 10),
      });
    });
  });
  return deck;
}

function handleGameOver() {
  if (gameOver) {
    betAmount = 0;
    showBetAmount.textContent = 0;
    showBetAmount.textContent = `$${betAmount}`;
    //Disable hit and stand buttons (can change to show visibility?)
    hitButton.disabled = true;
    standButton.disabled = true;
    dealInProgress = false;
    dealButton.disabled = false;
  }
}

function hit() {
  let playerValue = calculateHandValue(playerHand);
  if (shuffledDeck.length > 0 && playerValue < 21) {
    const newCard = shuffledDeck.shift();
    playerHand.push(newCard);
    renderDeckInContainer(playerHand, playerContainer);
    renderDeckInContainer(shuffledDeck, shuffledContainer);
    showCard(playerHand, playerContainer);
    playerValue = calculateHandValue(playerHand);
    displayHandCount(playerHand, playerCount, playerContainer);
    displayHandCount(dealerHand, dealerCount, dealerContainer);
    if (playerValue > 12) {
      standButton.disabled = false;
    } else if (playerValue > 21) {
      const result = "Dealer Wins";
      gameOver = true;
      displayResult(result);
      handleGameOver();
    } else if (playerValue === 21) {
      shuffledContainer.textContent = "Win already still hit!";
    }
  }
}

function stand() {
  const playerValue = calculateHandValue(playerHand);
  let dealerValue = calculateHandValue(dealerHand);
  while (dealerValue < 17) {
    const newCard = shuffledDeck.shift();
    dealerHand.push(newCard);
    renderDeckInContainer(dealerHand, dealerContainer);
    renderDeckInContainer(shuffledDeck, shuffledContainer);
    showCard(dealerHand, dealerContainer);
    dealerValue = calculateHandValue(dealerHand);
  }
  displayHandCount(dealerHand, dealerCount, dealerContainer);
  displayHandCount(playerHand, playerCount, playerContainer);
  if (dealerValue > 21 || playerValue > dealerValue) {
    showCard(dealerHand, dealerContainer);
    const result = "Player Wins!";
    gameOver = true;
    payOut();
    displayResult(result);
  } else if (playerValue < dealerValue) {
    showCard(dealerHand, dealerContainer);
    const result = "Dealer Wins!";
    gameOver = true;
    displayResult(result);
  } else if (playerValue === dealerValue) {
    showCard(dealerHand, dealerContainer);
    const result = "Push!";
    gameOver = true;
    payOut();
    displayResult(result);
  }
  handleGameOver();
}

// 6/16
// Display Hand Count
function displayHandCount(deck, count, container) {
  const handValue = calculateHandValue(deck);
  const numOfAce = deck.filter((card) => card.value === 11).length;

  const backClassCheck =
    container.getElementsByClassName("back-blue").length > 0;
  if (
    numOfAce > 0 &&
    deck.length === 2 &&
    (deck[0].value === 10 || deck[1].value === 10)
  ) {
    count.textContent = "Blackjack!";
  } else if (backClassCheck) {
    count.textContent = deck[0].value;
  } else {
    count.textContent = handValue;
  }
}

function calculateHandValue(deck) {
  let handValue = 0;
  let numOfAce = 0;
  deck.forEach((card) => {
    if (card.value !== 11) {
      handValue += card.value;
    } else {
      numOfAce++;
      handValue += 11;
    }
  });
  while (numOfAce > 0 && handValue > 21) {
    handValue -= 10;
    numOfAce--;
  }
  return handValue;
}

function blackjack() {
  if (calculateHandValue(playerHand) === 21) {
    playerBlackjack = true;
    showCard(dealerHand, dealerContainer);
    payOut();
    displayResult(`Blackjack!! Player Wins!`);
    handleGameOver();
  } else if (
    (calculateHandValue(playerHand) === 21 &&
      calculateHandValue(dealerHand)) === 21
  ) {
    showCard(dealerHand, dealerContainer);
    payOut();
    displayResult(`Push!`);
    handleGameOver();
  } else if (calculateHandValue(dealerHand) === 21) {
    showCard(dealerHand, dealerContainer);
    displayResult(`Blackjack!! Dealer Wins!`);
    handleGameOver();
  }
}

// after blackjack, when i press Deal it doesnt show input bets!!!

function displayResult(result) {
  resultContainer.textContent = result;
}

function payOut() {
  let wonAmount = 0;
  if (playerBlackjack === true) {
    wonAmount = (betAmount * 3) / 2 + betAmount;
  } else if (
    calculateHandValue(playerHand) === calculateHandValue(dealerHand)
  ) {
    wonAmount = betAmount;
  } else {
    wonAmount = betAmount * 2;
  }
  depositedAmount += wonAmount;
  showDepositedAmount.textContent = `$${depositedAmount}`;
  return wonAmount;
}

//initialise the game
init();

//function
function init() {
  hitButton.disabled = true;
  standButton.disabled = true;
}

function deal() {
  if (betAmount < 5) {
    resultContainer.textContent = "Please enter your bet!";
    return;
  }
  //reset blackjack
  playerBlackjack = false;

  //deal cards
  renderNewShuffledDeck();
  dealInProgress = true;
  dealButton.disabled = true;

  //show dealer first card face up
  renderDeckInContainer(dealerHand, dealerContainer);
  showCard([dealerHand[0]], dealerContainer);
  displayHandCount(dealerHand, dealerCount, dealerContainer);

  //Enable buttons
  hitButton.disabled = false;
  if (!(calculateHandValue(playerHand) < 12)) {
    standButton.disabled = false;
  }

  blackjack();
}

//================== even game, wager, next game, soft/hard display values
//================== local storage
// deposit -> wager -> play -> hit/stand -> checkresult -> restart -> use the current deck
//NEED TO DO
// game logic for hit and stand -> placement of if (gameover) -> settle the count
//show soft/hard displayer
//refine gameover function -> remove button click
// repeat Bet and i need double also
// need a new game function
// insurance??
//immediately show black jack after deal (need to test)
// when i put a bet amount, i shouldnt be able to press hit before i deal -> can consider disabling button OR hide button
//MVC
// when player hit 21, disable hit button
// when player < 12 points, disable stand button
//store deposit using localstorage
//credit jim Clark

// add undo button for chipbet and clear button

//set time delay for dealing of cards?
//set time dealy to remove the text from the chat box
//stack cards
// one card cannot display A = 11 -> logic somewhere uses deck[0] / deck[1] Ace value to determine something -> need check -> after a few rounds, it cannot calcualate -> FOUND IT -> if the dealer hand has only two cards and only require two cards to win, the value would not increase after I PRESS STAND -> it will only calculate the first value
