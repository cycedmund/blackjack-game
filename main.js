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
  insufficient: "Insufficient funds in your bankroll!",
  defaultbj: "Blackjack 2️⃣1️⃣",
  defaultdeal: "Please place your bet.",
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

// Initialise/Start the game
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
  //The parseInt function converts its first argument to a string, parses that string, then returns an integer or NaN . If not NaN , the return value will be the integer that is the first argument taken as a number in the specified radix
  if (!isNaN(depositValue) && depositValue >= 5) {
    renderBankroll(depositValue);
    depositEl.input.value = "";
  } else {
    renderInvalidInputMessage();
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
  if (gamestate.dealingNow) {
    return;
  } else if (e.target.matches(".bet-input")) {
    stakes.chipAmt = parseInt(e.target.value);
    //e.target.value returns a string -> console.log(typeof e.target.value)
    if (stakes.chipAmt <= stakes.bankroll) {
      inputBet(stakes.chipAmt);
    } else {
      renderInvalidBetMessage();
    }
  }
}

function undoBet() {
  if (gamestate.dealingNow) {
    return;
  }
  if (stakes.chipAmt <= stakes.betAmt) {
    inputBet(-stakes.chipAmt);
  }
}

function clearBet() {
  if (gamestate.dealingNow) {
    return;
  }
  inputBet(-stakes.betAmt);
}

function repeatBet() {
  if (gamestate.dealingNow) {
    return;
  } else if (
    stakes.bankroll >= stakes.initialBetAmt &&
    stakes.initialBetAmt > 0
  ) {
    clearBet();
    inputBet(stakes.initialBetAmt);
    deal();
  } else {
    renderInvalidBetMessage();
  }
}

function deal() {
  if (stakes.betAmt < 5) {
    displayErrorMessage(messages.defaultdeal);
    return;
  }
  gamestate.dealingNow = true;
  stakes.initialBetAmt = stakes.betAmt;
  displayPreGameBtns(true, "none");
  displayDepositField("hidden");
  renderPlayerHand();
  // dealBlackjack();
  renderHalfDealerHand();
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
    doubleBet();
    renderPlayerHitCards();
    gameEl.double.disabled = true;

    if (handvalue.player.hard <= 21) {
      setTimeout(stand, 800);
    } else if (handvalue.player.hard > 21) {
      setTimeout(() => renderResultsMessage(messages.lose), 800);
    }
  }
}

/*----- other functions -----*/
function initialiseGameStates() {
  gamestate.gameover = false;
  carddeck.player = [];
  carddeck.dealer = [];
  carddeck.shoe = [];
  gamestate.dealingNow = false;
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
  if (stakes.initialBetAmt !== 0) {
    betEl.repeatBtn.style.display = str;
  } else {
    betEl.repeatBtn.style.display = "none";
  }
}

function hideChips(str) {
  const chipEl = document.querySelector(".chip-field");
  chipEl.style.display = str;
}

function renderBankroll(amount) {
  stakes.bankroll += amount;
  depositEl.bankroll.textContent = `$${stakes.bankroll}`;
}

function renderInvalidInputMessage() {
  depositEl.input.value = "";
  displayErrorMessage(messages.invalid);
}

function displayErrorMessage(message) {
  const errorMessageExist = document.querySelector(".error-message");

  if (errorMessageExist) {
    return;
  }
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
  stakes.betAmt += amount; //stakes.betAmt is my cumulative from chipamt
  renderBetAmount();
  renderBankroll(-amount);
}

function renderBetAmount() {
  if (stakes.betAmt === 0) {
    betEl.betAmt.style.visibility = "hidden";
  } else {
    betEl.betAmt.style.visibility = "visible";
    betEl.betAmt.textContent = `$${stakes.betAmt}`;
  }
}

function renderInvalidBetMessage() {
  displayErrorMessage(messages.insufficient);
}

function renderPlayerHand() {
  buildShuffledShoe();
  dealCards();
  // can put below as updatedeckincontainers but not intuitive
  putCardsIntoContainer(carddeck.shoe, deckEl.shuffled);
  addClassToShuffledDeck();
  putCardsIntoContainer(carddeck.player, deckEl.player);
  renderFaceCard(carddeck.player, deckEl.player);
  renderHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
}

function renderHalfDealerHand() {
  putCardsIntoContainer(carddeck.dealer, deckEl.dealer);
  renderFaceCard([carddeck.dealer[0]], deckEl.dealer);
  renderHandCount(carddeck.dealer, stateEl.dealerCount, deckEl.dealer);
}

function buildMainDeck() {
  const mainDeck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      mainDeck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of displayBlackjack, not war
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
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    carddeck.shoe.push(mainDeck.splice(rndIdx, 1)[0]);
  }
  return carddeck.shoe;
}

function dealCards() {
  carddeck.player = [carddeck.shoe.shift(), carddeck.shoe.shift()];
  carddeck.dealer = [carddeck.shoe.shift(), carddeck.shoe.shift()];
}

function putCardsIntoContainer(deck, container) {
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
  putCardsIntoContainer(deck, container);
  putCardsIntoContainer(carddeck.shoe, deckEl.shuffled);
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
  if (stakes.betAmt === 0) {
    betEl.double.style.display = "none";
  } else {
    betEl.double.style.display = "flex";
    betEl.double.textContent = `$${amount}`;
  }
}

function doubleBet() {
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

function removeResultMessage() {
  stateEl.results.textContent = "";
}

function clearPage() {
  deckEl.player.innerHTML = "";
  deckEl.dealer.innerHTML = "";
  deckEl.shuffled.innerHTML = "";
  stateEl.playerCount.textContent = "";
  stateEl.dealerCount.textContent = "";
  removeResultMessage();
}

// ==========Get Blackjack Test==========
// function getBlackjackCards() {
//   // const getCards = deckEl.shuffled.querySelectorAll(".card");
//   // const myCards = [...getCards];
//   const card1 = carddeck.shoe.find((card) => {
//     return card.value === 11;
//   });
//   const card2 = carddeck.shoe.find((card) => {
//     return card.value === 10;
//   });
//   return (carddeck.player = [card1, card2]);
// }

// function dealBlackjack() {
//   getBlackjackCards();
//   putCardsIntoContainer(carddeck.player, deckEl.player);
//   renderFaceCard(carddeck.player, deckEl.player);
//   renderHandCount(carddeck.player, stateEl.playerCount, deckEl.player);
// }

//==========NEED TO DO

// need a new game function
// insurance??
//credit jim Clark

//set time delay for dealing of cards?

//if got time, go and add more decks -> use the same decks and move unti no decks left
// or add more players

//set timer to bet?
//dont use multiple of 5? because like that 5 will get 0.5..

//can use function expression for playervalue etc where i need the value

//bugs
//1. repeat bet -> cannot press undo/clear else repeat bet cannot work -> solved
// - save the initialbetamount in deal() -> can use it to access
//2. print error message -> can keep printing if keep spamming -> solve
//3. prevent deposit input from refreshing when pressing enter -> solve
// - need create another event listener
//4. include soft and hard count -> solve
// - edited renderhandcount and calculate hand value
