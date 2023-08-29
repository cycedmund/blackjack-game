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
  undo: "Your undo too high la! Try clear bet.",
  unable: "Don't play, no bet how to clear?",
  win: "Nice 🥳 You won $",
  lose: "Sian 😢",
  push: "Heng ah 🤓 You got back your $",
  pbj: "Swee 🤪 You won $",
  dbj: "Damn Sian 😭",
  invalid: "Put number la! $5 - $1000 take your pick.",
  insufficient: "Oi! No money still want bet so big!",
  defaultbj: "Blackjack 2️⃣1️⃣",
  defaultdeal: "Eh bro and sis, place bet leh!",
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
  displayBetAmt("hidden", "none");
  hideInGameButtons();
  displayPreGameBtns(false, "flex");
}

/*----- event listener functions -----*/
function deposit() {
  const depositValue = parseInt(depositEl.input.value);
  if (!isNaN(depositValue) && depositValue >= 5 && depositValue <= 1000) {
    renderBankroll(depositValue);
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

function bet(e) {
  //https://gomakethings.com/listening-for-events-on-multiple-elements-using-javascript-event-delegation
  if (e.target.matches(".bet-input")) {
    stakes.chipAmt = parseInt(e.target.value);
    //e.target.value returns a string -> console.log(typeof e.target.value)
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
  renderPlayerHand();
  // dealBlackjack(carddeck.player, stateEl.playerCount, deckEl.player);
  renderHalfDealerHand();
  // dealBlackjack(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
  displayInGameBtns();
  displayBlackjack();
}

function hit() {
  gameEl.double.disabled = true;
  handvalue.player = calculateHandValue(carddeck.player);
  if (carddeck.shoe.length > 0 && handvalue.player.hard < 21) {
    renderPlayerHitCards();
    if (handvalue.player.hard >= 12 && handvalue.player.hard < 21) {
      gameEl.stand.disabled = false;
    } else if (handvalue.player.hard === 21) {
      stand();
    } else if (handvalue.player.hard > 21) {
      renderResultsMessage(messages.lose);
    }
  }
}

function stand() {
  handvalue.player = calculateHandValue(carddeck.player);
  handvalue.dealer = calculateHandValue(carddeck.dealer);
  while (handvalue.dealer.hard < 17) {
    renderDealerHitCards();
  }
  if (
    handvalue.dealer.hard > 21 ||
    handvalue.player.hard > handvalue.dealer.hard
  ) {
    renderDealerFaceDownCard();
    payOut();
    renderResultsMessage(messages.win);
  } else if (handvalue.player.hard < handvalue.dealer.hard) {
    renderDealerFaceDownCard();
    renderResultsMessage(messages.lose);
  } else if (handvalue.player.hard === handvalue.dealer.hard) {
    renderDealerFaceDownCard();
    payOut();
    renderResultsMessage(messages.push);
  }
}

function double() {
  handvalue.player = calculateHandValue(carddeck.player);
  if (carddeck.player.length === 2 && handvalue.player.hard < 21) {
    displayDoubleBetChip();
    renderPlayerHitCards();
    hideInGameButtons();

    setTimeout(
      handvalue.player.hard <= 21
        ? stand
        : () => renderResultsMessage(messages.lose),
      800
    );
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

function displayBetAmt(visibility, display) {
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

function renderBankroll(amount) {
  stakes.bankroll += amount;
  depositEl.bankroll.textContent = `$${stakes.bankroll}`;
}

function displayErrorMessage(message) {
  const errorMessageExist = document.querySelector(".error-message");
  if (errorMessageExist) return;
  createTempMsg(message);
}

function createTempMsg(message) {
  const newh1El = document.createElement("h1");
  newh1El.classList.add("error-message");
  newh1El.textContent = message;
  newh1El.style.color = "rgba(114, 4, 4, 0.858)";
  deckEl.main.append(newh1El);
  setTimeout(() => newh1El.remove(), 1000);
}

function inputBet(amount) {
  stakes.betAmt += amount; //betAmt is my cumulative from chipamt
  renderBetAmount();
  renderBankroll(-amount);
}

function renderBetAmount() {
  stakes.betAmt === 0
    ? (betEl.betAmt.style.visibility = "hidden")
    : (betEl.betAmt.style.visibility = "visible"),
    (betEl.betAmt.textContent = `$${stakes.betAmt}`);
}

function renderPlayerHand() {
  buildShuffledShoe();
  dealCards();
  // can put below as updatedeckincontainers but not intuitive
  renderInitialCards(carddeck.shoe, deckEl.shuffled);
  addClassToShuffledDeck();
  renderInitialCards(carddeck.player, deckEl.player);
  renderFaceCard(carddeck.player, deckEl.player);
  renderHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
}

function renderHalfDealerHand() {
  renderInitialCards(carddeck.dealer, deckEl.dealer);
  renderFaceCard([carddeck.dealer[0]], deckEl.dealer);
  renderHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
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

function dealCards() {
  carddeck.player = [carddeck.shoe.shift(), carddeck.shoe.shift()];
  carddeck.dealer = [carddeck.shoe.shift(), carddeck.shoe.shift()];
}

function renderInitialCards(deck, container) {
  container.innerHTML = "";
  let cardsHtml = "";
  deck.forEach(function () {
    cardsHtml += `<div class="card back-blue large"></div>`;
  });
  container.innerHTML = cardsHtml;
}

function renderFaceCard(deck, container) {
  const cards = container.querySelectorAll(".card");
  cards.forEach((div, index) => {
    if (deck[index]) {
      div.classList.remove("back-blue");
      div.classList.add(`${deck[index].face}`);
    }
  });
  return cards;
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
    renderFaceCard(carddeck.dealer, deckEl.dealer);
    renderHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
    payOut();
    renderResultsMessage(messages.push);
  } else if (handvalue.player.hard === 21) {
    gamestate.playerblackjack = true;
    // renderFaceCard(carddeck.dealer, deckEl.dealer);
    renderHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
    payOut();
    renderResultsMessage(messages.pbj);
  } else if (handvalue.dealer.hard === 21) {
    renderFaceCard(carddeck.dealer, deckEl.dealer);
    renderHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
    renderResultsMessage(messages.dbj);
  }
}

function hitCards(hand) {
  const newCard = carddeck.shoe.shift();
  hand.push(newCard);
}

function renderPlayerHitCards() {
  hitCards(carddeck.player);
  updateHandAfterHit(carddeck.player, deckEl.player);
  handvalue.player = calculateHandValue(carddeck.player);
  renderHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
}

function renderDealerHitCards() {
  hitCards(carddeck.dealer);
  updateHandAfterHit(carddeck.dealer, deckEl.dealer);
  handvalue.dealer = calculateHandValue(carddeck.dealer);
  renderHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
}

function renderDealerFaceDownCard() {
  renderFaceCard(carddeck.dealer, deckEl.dealer);
  renderHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
}

function updateHandAfterHit(deck, container) {
  renderInitialCards(deck, container);
  renderInitialCards(carddeck.shoe, deckEl.shuffled);
  addClassToShuffledDeck();
  renderFaceCard(deck, container);
}

function addClassToShuffledDeck() {
  const cards = deckEl.shuffled.querySelectorAll(".card");
  cards.forEach((div) => {
    div.classList.add("stack");
  });
}

function renderDblBetAmount(amount) {
  stakes.betAmt === 0
    ? (betEl.double.style.display = "none")
    : (betEl.double.style.display = "flex"),
    (betEl.double.textContent = `$${amount}`);
}

function displayDoubleBetChip() {
  stakes.betAmt = stakes.betAmt * 2;
  betEl.double.textContent = `$${stakes.initialBetAmt}`;
  renderDblBetAmount(stakes.initialBetAmt);
  renderBankroll(-stakes.initialBetAmt);
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

function renderHandCount(hand, count, container) {
  const { soft, hard } = calculateHandValue(hand);
  const numOfAce = hand.filter((card) => card.value === 11).length;
  const checkIfBackClass = container.querySelectorAll(".back-blue").length > 0;

  if (numOfAce === 1 && hand.length === 2 && hard === 21) {
    count.textContent = messages.defaultbj;
  } else if (checkIfBackClass) {
    count.textContent = hand[0].value;
  } else if (numOfAce >= 1 && soft <= 11 && soft !== hard) {
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
  renderBankroll(wonAmount);
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

function renderResultsMessage(message) {
  const result = message + messages.profits;
  gamestate.gameover = true;
  styleResults(result);
  handleGameOver();
}

function styleResults(result) {
  stateEl.results.textContent = result;
  stateEl.results.style.color = "white";
  stateEl.results.style.backgroundColor = "black";
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
//   // https://stackoverflow.com/questions/1348178/a-better-way-to-splice-an-array-into-an-array-in-javascript -> mutate original array
//   deck.splice(0, deck.length, ...specificCards);
//   renderInitialCards(deck, container);
//   renderFaceCard(deck, container);
//   renderHandCount(deck, count, container);
// }
