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
const messages = {
  win: "Nice 🥳",
  lose: "Sian 😢",
  push: "Heng ah 🤓",
  pbj: "Hoseh 🤪",
  dbj: "Damn Sian 😭",
  deposit: "Please enter a valid amount",
  bet: "Insufficient balance",
  defaultbj: "Blackjack 2️⃣1️⃣",
  defaultdeal: "Please place your bet",
};

// Build an 'original' deck of 'card' objects used to create shuffled decks
// renderDeckInContainer(
//   mainDeck,
//   document.getElementById("original-deck-container")
// );

/*----- app's state (variables) -----*/
let shuffledDeck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let playerBlackjack = false;
let dealingNow = false;
let bankroll = 0;
let betAmount = 0; //track total bet
let chipAmount = 0; //track for undobet

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
const showBankroll = document.getElementById("deposit-amount");
const chipBet = document.querySelector(".chip-field");
const playerCount = document.getElementById("player-count");
const dealerCount = document.getElementById("dealer-count");
const undoButton = document.getElementById("undo-button");
const clearButton = document.getElementById("clear-button");
showBankroll.textContent = `$${bankroll}`;
showBetAmount.textContent = `$${betAmount}`;

/*----- event listeners -----*/
chipBet.addEventListener("click", bet);
dealButton.addEventListener("click", deal);
hitButton.addEventListener("click", hit);
standButton.addEventListener("click", stand);
depositButton.addEventListener("click", deposit);
undoButton.addEventListener("click", undoBet);
clearButton.addEventListener("click", clearBet);

/*----- functions -----*/
function deposit() {
  const depositInput = document.getElementById("deposit-input");
  const depositValue = parseInt(depositInput.value);
  //The parseInt function converts its first argument to a string, parses that string, then returns an integer or NaN . If not NaN , the return value will be the integer that is the first argument taken as a number in the specified radix
  if (!isNaN(depositValue) && depositValue >= 5) {
    updateDeposit(depositValue);
    depositInput.value = "";
  } else {
    showBankroll.textContent = messages.deposit;
    depositInput.value = "";
    //Reset message
    setTimeout(() => {
      updateDeposit(bankroll);
    }, 1000);
  }
}

function bet(e) {
  //https://gomakethings.com/listening-for-events-on-multiple-elements-using-javascript-event-delegation
  if (dealingNow) {
    return;
  } else if (e.target.matches(".bet-input")) {
    chipAmount = parseInt(e.target.value);
    //e.target.value returns a string -> console.log(typeof e.target.value)
    if (chipAmount <= bankroll) {
      enterBet(chipAmount);
    } else {
      showBetAmount.textContent = messages.bet;
      setTimeout(() => {
        enterBet(betAmount);
      }, 1000);
    }
  }
}

function enterBet(amount) {
  betAmount += amount; //betAmount is my cumulative
  showBetAmount.textContent = `$${betAmount}`;
  updateDeposit(-amount);
}

function updateDeposit(amount) {
  bankroll += amount;
  showBankroll.textContent = `$${bankroll}`;
}

function undoBet() {
  if (dealingNow) {
    return;
  } else if (betAmount > 0 && chipAmount <= betAmount) {
    enterBet(-chipAmount);
  }
}

function clearBet() {
  if (dealingNow) {
    return;
  }
  enterBet(-betAmount);
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
  showBankroll.textContent = `$${bankroll}`;

  //Reset counts and show counts
  playerCount.textContent = "";
  dealerCount.textContent = "";
  displayHandCount(playerHand, playerCount, playerContainer);
}

function renderDeckInContainer(deck, container) {
  container.innerHTML = "";
  // Let's build the cards as a string of HTML
  let cardsHtml = "";
  deck.forEach(function () {
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
    showBetAmount.textContent = `$${betAmount}`;
    hitButton.disabled = true;
    standButton.disabled = true;
    dealingNow = false;
    dealButton.disabled = false;
  }
}

function hit() {
  let playerValue = calculateHandValue(playerHand);
  if (shuffledDeck.length > 0 && playerValue < 21) {
    renderHitCards(playerHand);
    updateContainers(playerHand, playerContainer);
    playerValue = calculateHandValue(playerHand);
    displayHandCount(playerHand, playerCount, playerContainer);

    if (playerValue < 12) {
      standButton.disabled = true;
    } else if (playerValue >= 12 && playerValue < 21) {
      standButton.disabled = false;
    } else if (playerValue === 21) {
      stand();
    } else if (playerValue > 21) {
      //if more than 21
      renderWin(messages.lose);
    }
  }
}

function stand() {
  const playerValue = calculateHandValue(playerHand);
  let dealerValue = calculateHandValue(dealerHand);
  while (dealerValue < 17) {
    renderHitCards(dealerHand);
    updateContainers(dealerHand, dealerContainer);
    dealerValue = calculateHandValue(dealerHand);
    displayHandCount(dealerHand, dealerCount, dealerContainer);
  }
  if (dealerValue > 21 || playerValue > dealerValue) {
    renderDealerHiddenCard();
    renderWin(messages.win);
    payOut();
  } else if (playerValue < dealerValue) {
    renderDealerHiddenCard();
    renderWin(messages.lose);
  } else if (playerValue === dealerValue) {
    renderDealerHiddenCard();
    renderWin(messages.push);
    payOut();
  }
}
//small functions for hit / stand part ===============
function updateContainers(deck, container) {
  renderDeckInContainer(deck, container);
  renderDeckInContainer(shuffledDeck, shuffledContainer);
  showCard(deck, container);
}

function renderHitCards(deck) {
  const newCard = shuffledDeck.shift();
  deck.push(newCard);
}

function renderDealerHiddenCard() {
  showCard(dealerHand, dealerContainer);
  displayHandCount(dealerHand, dealerCount, dealerContainer);
}
//======can shorten==========
function renderWin(message) {
  const result = message;
  gameOver = true;
  displayResult(result);
  handleGameOver();
}

//end of hit /stand part ===================

// 6/16 //cannot use blackjack because it should be an isolated function
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
    count.textContent = messages.defaultbj;
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
// function renderPlayerWin() {
//   const result = "Player Wins!";
//   gameOver = true;
//   payOut();
//   displayResult(result);
//   handleGameOver();
// }
function blackjack() {
  if (calculateHandValue(playerHand) === 21) {
    playerBlackjack = true;
    // showCard(dealerHand, dealerContainer); dont need to show hidden card
    displayHandCount(playerHand, playerCount, playerContainer);
    payOut();
    renderWin(messages.pbj);
  } else if (
    (calculateHandValue(playerHand) === 21 &&
      calculateHandValue(dealerHand)) === 21
  ) {
    showCard(dealerHand, dealerContainer); //display hand count required??
    displayHandCount(dealerHand, dealerCount, dealerContainer);
    payOut();
    renderWin(messages.push);
  } else if (calculateHandValue(dealerHand) === 21) {
    showCard(dealerHand, dealerContainer);
    displayHandCount(dealerHand, dealerCount, dealerContainer);
    renderWin(messages.dbj);
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
  bankroll += wonAmount;
  showBankroll.textContent = `$${bankroll}`;
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
    resultContainer.textContent = messages.defaultdeal;
    return;
  }
  //reset state
  gameOver = false;
  playerBlackjack = false;

  //deal cards
  renderNewShuffledDeck();
  dealButton.disabled = true;
  dealingNow = true;

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

//MVC
//store deposit using localstorage
//credit jim Clark

//set time delay for dealing of cards?
//set time dealy to remove the text from the chat box
//stack cards

//disable input field refresh

//maybe consider using calculatehandvalue as a constant
//repeat bet
