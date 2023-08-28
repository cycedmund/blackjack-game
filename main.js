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
  win: "Nice 🥳 You won $",
  lose: "Sian 😢",
  push: "Heng ah 🤓 You got back your $",
  pbj: "Swee 🤪 You won $",
  dbj: "Damn Sian 😭",
  invalid: "Invalid amount! Try again!",
  insufficient: "Invalid bet amount!",
  defaultbj: "Blackjack 2️⃣1️⃣",
  defaultdeal: "Please place your bet.",
};

/*----- app's state (variables) -----*/
let shuffledDeck;
let bankroll = 500;
let chipAmount; //track for undo
let betAmount; //track total
let repeatBetAmount = 0; //track for repeat
let isDealingNow;
let playerBlackjack;
let playerHand;
let playerValue; //use for hit, stand and double
let dealerHand; //use for hit, stand and double
let dealerValue;
let gameOver;
let winnings; //for result -> if winnings is a number, it will show 0

/*----- cached element references -----*/
// deposit
const showBankroll = document.getElementById("bankroll-amount");
const depositInput = document.getElementById("deposit-input");
const depositButton = document.getElementById("deposit-button");
// pre-game
const showBetAmount = document.getElementById("bet-amount");
const chipBet = document.querySelector(".chip-field");
const undoButton = document.getElementById("undo-button");
const clearButton = document.getElementById("clear-button");
const repeatButton = document.getElementById("repeat-button");
const dealButton = document.getElementById("deal-button");
// in-game
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const doubleButton = document.getElementById("double-button");
const shuffledContainer = document.getElementById("shuffled-deck-container");
const dealerContainer = document.getElementById("dealer-hand-container");
const dealerCount = document.getElementById("dealer-count");
const mainContainer = document.getElementById("main-container");
const playerContainer = document.getElementById("player-hand-container");
const playerCount = document.getElementById("player-count");
const resultMessageEl = document.querySelector(".result-message");

const showDblBet = document.getElementById("dblbet-amount");

/*----- event listeners -----*/
chipBet.addEventListener("click", bet);
depositButton.addEventListener("click", deposit);
undoButton.addEventListener("click", undoBet);
clearButton.addEventListener("click", clearBet);
repeatButton.addEventListener("click", repeatBet);
dealButton.addEventListener("click", deal);
hitButton.addEventListener("click", hit);
standButton.addEventListener("click", stand);
doubleButton.addEventListener("click", double);

// Initialise/Start the game
init();

/*----- main functions -----*/
function init() {
  // Initial game state variables
  gameOver = false;
  playerHand = [];
  dealerHand = [];
  shuffledDeck = [];
  isDealingNow = false;
  playerBlackjack = false;
  winnings = "";
  betAmount = 0;
  chipAmount = 0;

  // Show deposit
  showBankroll.textContent = `$${bankroll}`;
  hideDepositField("visible");

  // Hide bet amount
  showBetAmount.style.visibility = "hidden";
  showDblBet.style.display = "none";

  // hide and disable in-game buttons
  hideInGameButtons();

  // show pre-game buttons
  // renderPreGameButtons(false, "visible");
  renderPreGameButtons(false, "flex");
}

function deal() {
  if (betAmount < 5) {
    printErrorMessage(messages.defaultdeal);
    return;
  }

  // Hide pre-game buttons
  renderPreGameButtons(true, "none");

  // Hide deposit box
  hideDepositField("hidden");

  // Deal cards
  isDealingNow = true;
  renderDeckIntoContainers();
  renderHandCount(playerHand, playerCount, playerContainer);
  // show dealer first card face up
  putCardsIntoContainer(dealerHand, dealerContainer);
  renderFaceCard([dealerHand[0]], dealerContainer);
  renderHandCount(dealerHand, dealerCount, dealerContainer);

  // Enable in-game buttons
  renderInGameButtons();

  // Check if anyone blackjack
  blackjackCheck();
}

/*----- other functions -----*/

//==========event listener functions for deposit==========
function deposit() {
  const depositValue = parseInt(depositInput.value);
  //The parseInt function converts its first argument to a string, parses that string, then returns an integer or NaN . If not NaN , the return value will be the integer that is the first argument taken as a number in the specified radix
  if (!isNaN(depositValue) && depositValue >= 5) {
    renderBankroll(depositValue);
    depositInput.value = "";
  } else {
    renderInvalidInputMessage();
  }
}

// ==========other functions for deposit==========
function renderInvalidInputMessage() {
  depositInput.value = "";
  printErrorMessage(messages.invalid);
}

function renderBankroll(amount) {
  bankroll += amount;
  showBankroll.textContent = `$${bankroll}`;
}

//==========event listener functions for bet==========
function bet(e) {
  //https://gomakethings.com/listening-for-events-on-multiple-elements-using-javascript-event-delegation
  if (isDealingNow) {
    return;
  } else if (e.target.matches(".bet-input")) {
    chipAmount = parseInt(e.target.value);
    //e.target.value returns a string -> console.log(typeof e.target.value)
    if (chipAmount <= bankroll) {
      enterBet(chipAmount);
    } else {
      renderInvalidBetMessage();
    }
  }
}

function undoBet() {
  if (isDealingNow) {
    return;
  } else if (betAmount > 0 && chipAmount <= betAmount) {
    enterBet(-chipAmount);
  }
}

function clearBet() {
  if (isDealingNow) {
    return;
  }
  enterBet(-betAmount);
}

function repeatBet() {
  if (isDealingNow) {
    return;
  } else if (bankroll >= repeatBetAmount && repeatBetAmount > 0) {
    enterBet(repeatBetAmount);
    deal();
  } else {
    renderInvalidBetMessage();
  }
}
//==========other functions for bet==========
function enterBet(amount) {
  betAmount += amount; //betAmount is my cumulative
  repeatBetAmount = betAmount; //can fix the rebet BUT when clear // undo i cannot press again because it assumes the chipamount
  renderBetAmount();
  renderBankroll(-amount);
}

function renderInvalidBetMessage() {
  printErrorMessage(messages.insufficient);
}

function renderBetAmount() {
  if (betAmount === 0) {
    showBetAmount.style.visibility = "hidden";
  } else {
    showBetAmount.style.visibility = "visible";
    showBetAmount.textContent = `$${betAmount}`;
  }
}

function printErrorMessage(message) {
  const newh1El = document.createElement("h1");
  newh1El.classList.add("error-message");
  newh1El.textContent = message;
  newh1El.style.color = "rgba(114, 4, 4, 0.858)";
  mainContainer.append(newh1El);
  setTimeout(() => (newh1El.textContent = ""), 1000); //prevent repeating
}

function hideDepositField(action) {
  const depositInput = document.getElementById("deposit-input");
  depositInput.style.visibility = action;
  depositButton.style.visibility = action;
}

//==========main functions for dealing==========

function renderDeckIntoContainers() {
  buildShuffledDeck();
  dealCards();
  // can put below as updatedeckincontainers but not intuitive
  putCardsIntoContainer(shuffledDeck, shuffledContainer);
  addClassToShuffledDeck();
  putCardsIntoContainer(playerHand, playerContainer);
  renderFaceCard(playerHand, playerContainer);
}

//==========other functions for dealing==========

function buildMainDeck() {
  const mainDeck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      mainDeck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjackCheck, not war
        value: Number(rank) || (rank === "A" ? 11 : 10),
      });
    });
  });
  return mainDeck;
}

function buildShuffledDeck() {
  const mainDeck = buildMainDeck();
  while (mainDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * mainDeck.length);
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    shuffledDeck.push(mainDeck.splice(rndIdx, 1)[0]);
  }
  return shuffledDeck;
}

function dealCards() {
  playerHand = [shuffledDeck.shift(), shuffledDeck.shift()];
  dealerHand = [shuffledDeck.shift(), shuffledDeck.shift()];
}

function putCardsIntoContainer(deck, container) {
  container.innerHTML = "";
  // Let's build the cards as a string of HTML
  let cardsHtml = "";
  deck.forEach(function () {
    cardsHtml += `<div class="card back-blue large"></div>`; //can consider map
  });
  // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup
  // const cardsHtml = deck.reduce(function(html, card) {
  //   return html + `<div class="card ${card.face}"></div>`;
  // }, '');
  container.innerHTML = cardsHtml;
}

function renderFaceCard(deck, container) {
  //classlist is on the element not the "card"
  const cards = container.querySelectorAll(".card");
  cards.forEach((div, index) => {
    if (deck[index]) {
      // if there is a div(card)
      div.classList.remove("back-blue");
      // div.classList.add("xlarge"); //can consider removing if can stack cards
      div.classList.add(`${deck[index].face}`);
    }
  });
  return cards;
}

//==========event listener functions for in-game==========
function hit() {
  doubleButton.disabled = true;
  playerValue = calculateHandValue(playerHand);
  if (shuffledDeck.length > 0 && playerValue < 21) {
    renderPlayerHitCards();

    if (playerValue < 12) {
      standButton.disabled = true;
    } else if (playerValue >= 12 && playerValue < 21) {
      standButton.disabled = false;
    } else if (playerValue === 21) {
      stand(); //inserrt time delay
    } else if (playerValue > 21) {
      //if more than 21
      renderResultsMessage(messages.lose);
    }
  }
}

function stand() {
  playerValue = calculateHandValue(playerHand); //need this,else if i dont press hit, playerValue = undefined
  dealerValue = calculateHandValue(dealerHand);
  while (dealerValue < 17) {
    renderDealerHitCards();
  }
  if (dealerValue > 21 || playerValue > dealerValue) {
    renderDealerFaceDownCard();
    payOut();
    renderResultsMessage(messages.win);
  } else if (playerValue < dealerValue) {
    renderDealerFaceDownCard();
    renderResultsMessage(messages.lose);
  } else if (playerValue === dealerValue) {
    renderDealerFaceDownCard();
    payOut();
    renderResultsMessage(messages.push);
  }
}

function double() {
  // if (bankroll )
  playerValue = calculateHandValue(playerHand);
  if (playerHand.length === 2 && playerValue < 21) {
    //if double, dont need minimum of 12
    // enterBet(betAmount);
    doubleBet();
    renderPlayerHitCards();
    doubleButton.disabled = true;

    if (playerValue <= 21) {
      setTimeout(stand, 800);
    } else if (playerValue > 21) {
      //if more than 21
      setTimeout(() => renderResultsMessage(messages.lose), 800);
    }
  }
}
// ==========other functions for in-game==========

function renderHitCards(hand) {
  const newCard = shuffledDeck.shift();
  hand.push(newCard);
}

function renderDealerFaceDownCard() {
  renderFaceCard(dealerHand, dealerContainer);
  renderHandCount(dealerHand, dealerCount, dealerContainer);
}

function renderPlayerHitCards() {
  renderHitCards(playerHand);
  updateDeckInContainers(playerHand, playerContainer);
  playerValue = calculateHandValue(playerHand);
  renderHandCount(playerHand, playerCount, playerContainer);
}

function renderDealerHitCards() {
  renderHitCards(dealerHand);
  updateDeckInContainers(dealerHand, dealerContainer);
  dealerValue = calculateHandValue(dealerHand);
  renderHandCount(dealerHand, dealerCount, dealerContainer);
}

function updateDeckInContainers(deck, container) {
  putCardsIntoContainer(deck, container);
  putCardsIntoContainer(shuffledDeck, shuffledContainer);
  addClassToShuffledDeck();
  renderFaceCard(deck, container);
}

function renderResultsMessage(message) {
  const result = message + winnings;
  gameOver = true;
  printResults(result);
  handleGameOver();
}

function calculateHandValue(hand) {
  let handValue = 0;
  let numOfAce = 0;
  hand.forEach((card) => {
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

function renderHandCount(hand, count, container) {
  const handValue = calculateHandValue(hand);
  const numOfAce = hand.filter((card) => card.value === 11).length;
  const checkIfBackClass = container.querySelectorAll(".back-blue").length > 0;
  if (
    numOfAce > 0 &&
    hand.length === 2 &&
    (hand[0].value === 10 || hand[1].value === 10)
  ) {
    count.textContent = messages.defaultbj;
  } else if (checkIfBackClass) {
    count.textContent = hand[0].value;
  } else {
    count.textContent = handValue;
  }

  //solve the softvalue count
  // else if (numOfAce === 1) {
  //   count.textContent = `${handValue - 10} / ${handValue}`;
  // }
}

function blackjackCheck() {
  playerValue = calculateHandValue(playerHand);
  dealerValue = calculateHandValue(dealerHand);

  if (playerValue === 21 && dealerValue === 21) {
    renderFaceCard(dealerHand, dealerContainer);
    renderHandCount(dealerHand, dealerCount, dealerContainer);
    payOut();
    renderResultsMessage(messages.push);
  } else if (playerValue === 21) {
    playerBlackjack = true;
    // renderFaceCard(dealerHand, dealerContainer); dont need to show hidden card
    renderHandCount(playerHand, playerCount, playerContainer);
    payOut();
    renderResultsMessage(messages.pbj);
  } else if (dealerValue === 21) {
    renderFaceCard(dealerHand, dealerContainer);
    renderHandCount(dealerHand, dealerCount, dealerContainer);
    renderResultsMessage(messages.dbj);
  }
}

// ==========functions for end-game==========

function printResults(result) {
  resultMessageEl.textContent = result;
  resultMessageEl.style.color = "white";
  resultMessageEl.style.backgroundColor = "black";
}

function removeResultMessage() {
  resultMessageEl.textContent = "";
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
  renderBankroll(wonAmount);
  return (winnings = wonAmount);
}

function handleGameOver() {
  if (gameOver) {
    hideInGameButtons();
    setTimeout(clearPage, 4000);
    setTimeout(init, 4000);
  }
}

function renderInGameButtons() {
  hitButton.disabled = false;
  if (!(calculateHandValue(playerHand) < 12)) {
    standButton.disabled = false;
  }
  if (bankroll >= betAmount) {
    doubleButton.disabled = false;
  }
  hitButton.style.visibility = "visible";
  standButton.style.visibility = "visible";
  doubleButton.style.visibility = "visible";
}

function hideInGameButtons() {
  hitButton.disabled = true;
  hitButton.style.visibility = "hidden";
  standButton.disabled = true;
  standButton.style.visibility = "hidden";
  doubleButton.disabled = true;
  doubleButton.style.visibility = "hidden";
}

// function renderPreGameButtons(bool, str) {
//   dealButton.disabled = bool;
//   undoButton.style.visibility = str;
//   clearButton.style.visibility = str;
//   dealButton.style.visibility = str;
//   repeatButton.style.visibility = str;
//   hideChips(str);
// }

function renderPreGameButtons(bool, str) {
  dealButton.disabled = bool;
  undoButton.style.display = str;
  clearButton.style.display = str;
  dealButton.style.display = str;
  repeatButton.style.display = str;
  hideChips(str);
}

function hideChips(str) {
  const chipEl = document.querySelector(".chip-field");
  chipEl.style.display = str;
}

function clearPage() {
  playerContainer.innerHTML = "";
  dealerContainer.innerHTML = "";
  shuffledContainer.innerHTML = "";
  playerCount.textContent = "";
  dealerCount.textContent = "";
  removeResultMessage();
}

//Test local storage~~~~~~~~~~~~~~~~~~~
// function saveBankroll() {
//   localStorage.setItem("bankroll", bankroll);
// }

// function getBankroll() {
//   const savedBankroll = localStorage.getItem("bankroll");
//   if (saveBankroll !== null) {
//     bankroll = parseInt(savedBankroll);
//     showBankroll.textContent = `$${bankroll}`;
//   }
// }

// to show visual of stacked

function addClassToShuffledDeck() {
  const cards = shuffledContainer.querySelectorAll(".card");
  cards.forEach((div) => {
    div.classList.add("stack");
  });
}

// to show visual of double

function doubleBet() {
  betAmount = betAmount * 2;
  const singleBetAmount = betAmount / 2;
  showDblBet.textContent = `$${singleBetAmount}`;
  renderDblBetAmount(singleBetAmount);
  renderBankroll(-singleBetAmount);
}

function renderDblBetAmount(amount) {
  if (betAmount === 0) {
    showDblBet.style.display = "none";
  } else {
    showDblBet.style.display = "flex";
    showDblBet.textContent = `$${amount}`;
  }
}

//================== even game, wager, next game, soft/hard display values
//================== local storage
// deposit -> wager -> play -> hit/stand -> checkresult -> restart -> use the current deck
//NEED TO DO

//show soft/hard displayer
//refine gameover function -> remove button click

// need a new game function
// insurance??

//MVC
//store deposit using localstorage
//credit jim Clark

//set time delay for dealing of cards?

//stack cards

//disable input field refresh

//maybe consider using calculatehandvalue as a constant

//if got time, go and add more decks -> use the same decks and move unti no decks left
// or add more players

//value is updated to soft BUT soft cannot be displayed

//set timer to bet?
//dont use multiple of 5? because like that 5 will get 0.5..

// show chip icon for double

//can use function expression for playervalue etc where i need the value

//bugs
//1. repeat bet -> cannot press undo/clear else repeat bet cannot work (solved)
//2. print error message -> can keep printing if keep spamming
//3. prevent deposit input from refreshing when pressing enter
//4. include soft and hard count
