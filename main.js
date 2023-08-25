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
  pbj: "Hoseh 🤪 You won $",
  dbj: "Damn Sian 😭",
  deposit: "Please enter a valid amount",
  bet: "Insufficient balance",
  defaultbj: "Blackjack 2️⃣1️⃣",
  defaultdeal: "Please place your bet",
  defaultHTMLMessage:
    "<h1>BLACKJACK PAYS 3 TO 2</h1><h3>Dealer must stand on a 17 and draw to 16</h3>",
};

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
let repeatBetAmount = 0; //track for repeatbet
let winnings = ""; //for result //if winnings is a number, it will show 0

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
const repeatButton = document.getElementById("repeat-button");
const doubleButton = document.getElementById("double-button");
showBankroll.textContent = `$${bankroll}`;
showBetAmount.textContent = `$${betAmount}`;

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
      showBankroll.textContent = `$${bankroll}`;
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
        showBetAmount.textContent = `$${betAmount}`; //buggy
      }, 1000);
    }
  }
}

function enterBet(amount) {
  repeatBetAmount = amount; //can fix the rebet BUT when clear // undo i cannot press again because it assumes the chipamount
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

function repeatBet() {
  if (dealingNow) {
    return;
  } else if (bankroll >= repeatBetAmount && repeatBetAmount > 0) {
    enterBet(repeatBetAmount);
    deal();
  } else {
    resultContainer.textContent = messages.bet;
    setTimeout(() => {
      resultContainer.innerHTML = messages.defaultHTMLMessage;
    }, 1000);
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
    doubleButton.disabled = true;
    dealingNow = false;
    dealButton.disabled = false;
    hideDepositField("visible");
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
    payOut();
    renderWin(messages.win);
  } else if (playerValue < dealerValue) {
    renderDealerHiddenCard();
    renderWin(messages.lose);
  } else if (playerValue === dealerValue) {
    renderDealerHiddenCard();
    payOut();
    renderWin(messages.push);
  }
}
function updateDoubleBetAmount() {
  enterBet(betAmount);
  showBetAmount.textContent = `$${betAmount}`;
}
//if i repeatbet here

function double() {
  // if (bankroll )
  let playerValue = calculateHandValue(playerHand);
  if (playerHand.length === 2 && playerValue < 21) {
    //if double, dont need minimum of 12
    updateDoubleBetAmount();
    renderHitCards(playerHand);
    updateContainers(playerHand, playerContainer);
    playerValue = calculateHandValue(playerHand);
    displayHandCount(playerHand, playerCount, playerContainer);

    if (playerValue <= 21) {
      setTimeout(() => {
        stand();
      }, 800);
    } else if (playerValue > 21) {
      //if more than 21
      setTimeout(() => {
        renderWin(messages.lose);
      }, 800);
    }
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

function renderWin(message) {
  const result = message + winnings;
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

function hideDepositField(action) {
  const depositInput = document.getElementById("deposit-input");
  depositInput.style.visibility = action;
  depositButton.style.visibility = action;
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
  updateDeposit(wonAmount);
  return (winnings = wonAmount);
}

//initialise the game
init();

//function
function init() {
  updateDeposit(500);
  hitButton.disabled = true;
  standButton.disabled = true;
  doubleButton.disabled = true;
}

function deal() {
  if (betAmount < 5) {
    resultContainer.textContent = messages.defaultdeal;
    setTimeout(() => {
      resultContainer.innerHTML = messages.defaultHTMLMessage;
    }, 1000);
    return;
  }

  //remove deposit box
  hideDepositField("hidden");

  //reset state
  gameOver = false;
  playerBlackjack = false;
  winnings = "";

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
  if (bankroll >= betAmount) {
    doubleButton.disabled = false;
  }

  blackjack();
}

//TESTING~~~~~~~~~~~~~~~~~~~
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
//repeat bet wont work fully -> if i press the chips it will go back to 0 and my repeatbet wont work
//set timer to bet?
//dont use multiple of 5? because like that 5 will get 0.5..
//dont remove text content in the center
//hide buttons?
//add stack cards
