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
  undo: "Undo chip value too high la! Try clear bet.",
  unable: "Don't play, no bet how to clear?",
  win: "Nice 🥳 You won $",
  lose: "Sian 😢",
  push: "Heng ah 🤓 You got back your $",
  pbj: "Swee 🤪 You won $",
  dbj: "Damn Sian 😭",
  invalid: "Put number la! $5 - $1000 take your pick.",
  insufficient: "Oi! No money still want bet so big!",
  defaultbj: "BLACKJACK 2️⃣1️⃣",
  defaultdeal: "Eh bros and sises, place bet leh!",
};

/*----- app's state (variables) -----*/
const stakes = {
  bankroll: 500,
  initialBetAmt: 0,
};
const carddeck = {};
const gamestate = {};
const handvalue = {};

/*----- cached element references -----*/
const depositEl = {
  bankroll: document.getElementById("bankroll-amount"),
  input: document.getElementById("deposit-input"),
  button: document.getElementById("deposit-button"),
};

const betEl = {
  betAmt: document.getElementById("bet-amount"),
  chip: document.querySelector(".chip-field"),
  undoBtn: document.getElementById("undo-button"),
  clearBtn: document.getElementById("clear-button"),
  repeatBtn: document.getElementById("repeat-button"),
  dealBtn: document.getElementById("deal-button"),
  double: document.getElementById("dblbet-amount"),
};

const gameEl = {
  hit: document.getElementById("hit-button"),
  stand: document.getElementById("stand-button"),
  double: document.getElementById("double-button"),
};

const deckEl = {
  main: document.getElementById("main-container"),
  shuffled: document.getElementById("shuffled-deck-container"),
  dealer: document.getElementById("dealer-hand-container"),
  player: document.getElementById("player-hand-container"),
};

const stateEl = {
  dealerCount: document.getElementById("dealer-count"),
  playerCount: document.getElementById("player-count"),
  results: document.querySelector(".result-message"),
};

/*----- event listeners -----*/
depositEl.button.addEventListener("click", deposit);
depositEl.input.addEventListener("keypress", depositWithEnterKey);
betEl.chip.addEventListener("click", bet);
betEl.undoBtn.addEventListener("click", undoBet);
betEl.clearBtn.addEventListener("click", clearBet);
betEl.repeatBtn.addEventListener("click", repeatBet);
betEl.dealBtn.addEventListener("click", deal);
gameEl.hit.addEventListener("click", hit);
gameEl.stand.addEventListener("click", stand);
gameEl.double.addEventListener("click", double);

/*----- start game -----*/
init();

/*----- main function -----*/
function init() {
  initialiseGameStates();
  getBankrollFromLocalStorage();
  displayDepositField("visible");
  displayChipBetImg("hidden", "none");
  hideInGameButtons();
  displayPreGameBtns(false, "flex");
}

/*----- event listener functions -----*/
function deposit() {
  const depositValue = parseInt(depositEl.input.value);
  if (!isNaN(depositValue) && depositValue >= 5 && depositValue <= 1000) {
    displayBankroll(depositValue);
    depositEl.input.value = "";
  } else {
    depositEl.input.value = "";
    displayErrorMessage(messages.invalid);
  }
}

function depositWithEnterKey(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    deposit();
  }
}

//https://stackoverflow.com/questions/58372977/what-is-the-difference-between-element-classlist-contains-and-element-matches
function bet(e) {
  if (e.target.matches(".bet-input")) {
    stakes.chipAmt = parseInt(e.target.value);
    if (stakes.chipAmt <= stakes.bankroll) {
      inputBet(stakes.chipAmt);
    } else {
      displayErrorMessage(messages.insufficient);
    }
  }
}

function undoBet() {
  if (stakes.betAmt === 0) {
    displayErrorMessage(messages.unable);
  } else if (stakes.chipAmt > stakes.betAmt) {
    displayErrorMessage(messages.undo);
  } else {
    inputBet(-stakes.chipAmt);
  }
}

function clearBet() {
  stakes.betAmt > 0
    ? inputBet(-stakes.betAmt)
    : displayErrorMessage(messages.unable);
}

function repeatBet() {
  if (stakes.bankroll >= stakes.initialBetAmt && stakes.initialBetAmt > 0) {
    inputBet(stakes.initialBetAmt);
    deal();
  } else {
    displayErrorMessage(messages.insufficient);
  }
}

function deal() {
  if (stakes.betAmt < 5) {
    displayErrorMessage(messages.defaultdeal);
    return;
  }
  stakes.initialBetAmt = stakes.betAmt;
  displayPreGameBtns(true, "none");
  displayDepositField("hidden");
  displayPlayerHand();
  // dealBlackjack(carddeck.player, stateEl.playerCount, deckEl.player);
  displayDealerFirstCard();
  // dealBlackjack(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
  displayInGameBtns();
  displayBlackjack();
}

function hit() {
  gameEl.double.disabled = true;
  handvalue.player = calculateHandValue(carddeck.player);
  if (handvalue.player.hard < 21) {
    displayPlayerHitCards();
    if (handvalue.player.hard >= 12 && handvalue.player.hard < 21) {
      gameEl.stand.disabled = false;
    } else if (handvalue.player.hard === 21) {
      stand();
    } else if (handvalue.player.hard > 21) {
      displayResultsMessage(messages.lose);
    }
  }
}

function stand() {
  handvalue.player = calculateHandValue(carddeck.player);
  handvalue.dealer = calculateHandValue(carddeck.dealer);
  while (handvalue.dealer.hard < 17) {
    displayDealerHitCards();
  }
  if (
    handvalue.dealer.hard > 21 ||
    handvalue.player.hard > handvalue.dealer.hard
  ) {
    displayDealerSecondCard();
    payOut();
    displayResultsMessage(messages.win);
  } else if (handvalue.player.hard < handvalue.dealer.hard) {
    displayDealerSecondCard();
    displayResultsMessage(messages.lose);
  } else if (handvalue.player.hard === handvalue.dealer.hard) {
    displayDealerSecondCard();
    payOut();
    displayResultsMessage(messages.push);
  }
}

function double() {
  handvalue.player = calculateHandValue(carddeck.player);
  if (carddeck.player.length === 2 && handvalue.player.hard < 21) {
    displayDoubleBetChip();
    displayPlayerHitCards();
    hideInGameButtons();

    if (handvalue.player.hard <= 21) {
      stand();
    } else {
      displayResultsMessage(messages.lose);
    }
  }
}

/*----- other functions -----*/
function initialiseGameStates() {
  gamestate.gameover = false;
  carddeck.player = [];
  carddeck.dealer = [];
  carddeck.shoe = [];
  gamestate.playerblackjack = false;
  messages.profits = "";
  stakes.betAmt = 0;
  stakes.chipAmt = 0;
}

function getBankrollFromLocalStorage() {
  const storedBankroll = localStorage.getItem("stakes.bankroll");
  if (storedBankroll !== null) {
    stakes.bankroll = parseInt(storedBankroll);
    depositEl.bankroll.textContent = `$${stakes.bankroll}`;
  }
}

function displayDepositField(visibility) {
  depositEl.bankroll.textContent = `$${stakes.bankroll}`;
  depositEl.input.style.visibility = visibility;
  depositEl.button.style.visibility = visibility;
}

function displayChipBetImg(visibility, display) {
  betEl.betAmt.style.visibility = visibility;
  betEl.double.style.display = display;
}

function hideInGameButtons() {
  gameEl.hit.disabled = true;
  gameEl.hit.style.visibility = "hidden";
  gameEl.stand.disabled = true;
  gameEl.stand.style.visibility = "hidden";
  gameEl.double.disabled = true;
  gameEl.double.style.visibility = "hidden";
}

function displayPreGameBtns(bool, str) {
  betEl.dealBtn.disabled = bool;
  betEl.undoBtn.style.display = str;
  betEl.clearBtn.style.display = str;
  betEl.dealBtn.style.display = str;
  hideChips(str);
  stakes.initialBetAmt !== 0
    ? (betEl.repeatBtn.style.display = str)
    : (betEl.repeatBtn.style.display = "none");
}

function hideChips(str) {
  const chipEl = document.querySelector(".chip-field");
  chipEl.style.display = str;
}

function displayBankroll(amount) {
  stakes.bankroll += amount;
  depositEl.bankroll.textContent = `$${stakes.bankroll}`;
}

function displayErrorMessage(message) {
  const errorMessageExist = document.querySelector(".error-message");
  if (errorMessageExist) return;
  createErrorMsg(message);
}

function createErrorMsg(message) {
  const newh1El = document.createElement("h1");
  newh1El.classList.add("error-message");
  newh1El.textContent = message;
  newh1El.style.color = "rgba(114, 4, 4, 0.858)";
  deckEl.main.append(newh1El);
  setTimeout(() => newh1El.remove(), 1000);
}

function inputBet(amount) {
  stakes.betAmt += amount; //betAmt is my cumulative from chipamt
  renderBetAmt();
  displayBankroll(-amount);
}

function renderBetAmt() {
  stakes.betAmt === 0
    ? (betEl.betAmt.style.visibility = "hidden")
    : (betEl.betAmt.style.visibility = "visible"),
    (betEl.betAmt.textContent = `$${stakes.betAmt}`);
}

function displayPlayerHand() {
  buildShuffledShoe();
  addCardsToHand();
  renderBackBlueCards(carddeck.shoe, deckEl.shuffled);
  addClassToShuffledDeck();
  renderBackBlueCards(carddeck.player, deckEl.player);
  renderFaceCard(carddeck.player, deckEl.player);
  displayHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
}

function displayDealerFirstCard() {
  renderBackBlueCards(carddeck.dealer, deckEl.dealer);
  renderFaceCard([carddeck.dealer[0]], deckEl.dealer);
  displayHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
}

// https://replit.com/@SEIStudent/How-to-Use-CSS-Card-Library#js/main.js
function buildMainDeck() {
  const mainDeck = [];
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      mainDeck.push({
        face: `${suit}${rank}`,
        value: Number(rank) || (rank === "A" ? 11 : 10),
      });
    });
  });
  return mainDeck;
}

function buildShuffledShoe() {
  const mainDeck = buildMainDeck();
  while (mainDeck.length) {
    const rndIdx = Math.floor(Math.random() * mainDeck.length);
    carddeck.shoe.push(mainDeck.splice(rndIdx, 1)[0]);
  }
  return carddeck.shoe;
}

function addCardsToHand() {
  carddeck.player = [carddeck.shoe.shift(), carddeck.shoe.shift()];
  carddeck.dealer = [carddeck.shoe.shift(), carddeck.shoe.shift()];
}

function renderBackBlueCards(deck, container) {
  container.innerHTML = "";
  let cardsHtml = "";
  deck.forEach(function () {
    cardsHtml += `<div class="card back-blue large"></div>`;
  });
  container.innerHTML = cardsHtml;
}

function renderFaceCard(deck, container) {
  const cardsDivEl = container.querySelectorAll(".card");
  cardsDivEl.forEach((div, index) => {
    if (deck[index]) {
      div.classList.remove("back-blue");
      div.classList.add(`${deck[index].face}`);
    }
  });
  return cardsDivEl;
}

function displayInGameBtns() {
  handvalue.player = calculateHandValue(carddeck.player);
  gameEl.hit.disabled = false;
  if (handvalue.player.hard >= 12) {
    gameEl.stand.disabled = false;
  }
  if (stakes.bankroll >= stakes.betAmt) {
    gameEl.double.disabled = false;
  }
  gameEl.hit.style.visibility = "visible";
  gameEl.stand.style.visibility = "visible";
  gameEl.double.style.visibility = "visible";
}

function displayBlackjack() {
  handvalue.player = calculateHandValue(carddeck.player);
  handvalue.dealer = calculateHandValue(carddeck.dealer);

  if (handvalue.player.hard === 21 && handvalue.dealer.hard === 21) {
    displayDealerSecondCard();
    payOut();
    displayResultsMessage(messages.push);
  } else if (handvalue.player.hard === 21) {
    gamestate.playerblackjack = true;
    // displayDealerSecondCard();
    payOut();
    displayResultsMessage(messages.pbj);
  } else if (handvalue.dealer.hard === 21) {
    displayDealerSecondCard();
    displayResultsMessage(messages.dbj);
  }
}

function hitCards(hand) {
  const newCard = carddeck.shoe.shift();
  hand.push(newCard);
}

function displayPlayerHitCards() {
  hitCards(carddeck.player);
  renderHitCards(carddeck.player, deckEl.player);
  handvalue.player = calculateHandValue(carddeck.player);
  displayHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
}

function displayDealerHitCards() {
  hitCards(carddeck.dealer);
  renderHitCards(carddeck.dealer, deckEl.dealer);
  handvalue.dealer = calculateHandValue(carddeck.dealer);
  displayHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
}

function displayDealerSecondCard() {
  renderFaceCard(carddeck.dealer, deckEl.dealer);
  displayHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
}

function renderHitCards(deck, container) {
  renderBackBlueCards(deck, container);
  renderBackBlueCards(carddeck.shoe, deckEl.shuffled);
  addClassToShuffledDeck();
  renderFaceCard(deck, container);
}

function addClassToShuffledDeck() {
  const cards = deckEl.shuffled.querySelectorAll(".card");
  cards.forEach((div) => {
    div.classList.add("stack");
  });
}

function renderDblBetAmt(amount) {
  stakes.betAmt === 0
    ? (betEl.double.style.display = "none")
    : (betEl.double.style.display = "flex"),
    (betEl.double.textContent = `$${amount}`);
}

function displayDoubleBetChip() {
  stakes.betAmt = stakes.betAmt * 2;
  betEl.double.textContent = `$${stakes.initialBetAmt}`;
  renderDblBetAmt(stakes.initialBetAmt);
  displayBankroll(-stakes.initialBetAmt);
}

function calculateHandValue(hand) {
  let hard = 0;
  let soft = 0;
  let numOfAce = 0;
  hand.forEach((card) => {
    if (card.value !== 11) {
      hard += card.value;
      soft += card.value;
    } else {
      numOfAce++;
      hard += 11;
      soft += 1;
    }
  });
  while (numOfAce > 0 && hard > 21) {
    hard -= 10;
    numOfAce--;
  }

  return { soft, hard };
}

function displayHandCount(hand, count, container) {
  const { soft, hard } = calculateHandValue(hand);
  const backBlueClass = container.querySelectorAll(".back-blue").length > 0;

  if (hand.length === 2 && hard === 21) {
    count.textContent = messages.defaultbj;
  } else if (backBlueClass) {
    count.textContent = hand[0].value;
  } else if (soft <= 11 && soft !== hard) {
    count.textContent = `${soft} / ${hard}`;
  } else {
    count.textContent = hard;
  }
}

function payOut() {
  handvalue.player = calculateHandValue(carddeck.player);
  handvalue.dealer = calculateHandValue(carddeck.dealer);
  let wonAmount = 0;
  if (gamestate.playerblackjack === true) {
    wonAmount = (stakes.betAmt * 3) / 2 + stakes.betAmt;
  } else if (handvalue.player.hard === handvalue.dealer.hard) {
    wonAmount = stakes.betAmt;
  } else {
    wonAmount = stakes.betAmt * 2;
  }
  displayBankroll(wonAmount);
  return (messages.profits = wonAmount);
}

function handleGameOver() {
  if (gamestate.gameover) {
    hideInGameButtons();
    saveBankrollInLocalStorage();
    setTimeout(clearPage, 3500);
    setTimeout(init, 3500);
  }
}

function saveBankrollInLocalStorage() {
  localStorage.setItem("stakes.bankroll", stakes.bankroll);
}

function displayResultsMessage(message) {
  const result = message + messages.profits;
  gamestate.gameover = true;
  stateEl.results.textContent = result;
  handleGameOver();
}

function clearPage() {
  deckEl.player.innerHTML = "";
  deckEl.dealer.innerHTML = "";
  deckEl.shuffled.innerHTML = "";
  stateEl.playerCount.textContent = "";
  stateEl.dealerCount.textContent = "";
  stateEl.results.textContent = "";
}

// ==========Get Blackjack Test==========
// function getSpecificCards() {
//   const card1 = carddeck.shoe.find((card) => {
//     return card.value === 11;
//   });
//   const card2 = carddeck.shoe.find((card) => {
//     return card.value === 10;
//   });
//   return [card1, card2];
// }

// function dealBlackjack(deck, count, container) {
//   const specificCards = getSpecificCards();
//   deck.splice(0, deck.length, ...specificCards);
//   renderBackBlueCards(deck, container);
//   renderFaceCard(deck, container);
//   displayHandCount(deck, count, container);
// }

// https://stackoverflow.com/questions/1348178/a-better-way-to-splice-an-array-into-an-array-in-javascript -> mutate original array
