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
const originalDeck = buildOriginalDeck();
renderDeckInContainer(
  originalDeck,
  document.getElementById("original-deck-container")
);

/*----- app's state (variables) -----*/
let shuffledDeck;
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let depositedAmount = 0;
let betAmount = 0;
let playerBlackjack = false;

/*----- cached element references -----*/
const dealButton = document.getElementById("deal-button");
const shuffledContainer = document.getElementById("shuffled-deck-container");
const playerContainer = document.getElementById("player-hand-container");
const dealerContainer = document.getElementById("dealer-hand-container");
const resultContainer = document.getElementById("result-container");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
// const formTag = document.getElementById("form-tag");
const betButton = document.getElementById("bet-button");
const showBetAmount = document.getElementById("bet-amount");
const depositButton = document.getElementById("deposit-button");
const showDepositedAmount = document.getElementById("deposit-amount");
let playerCount = document.getElementById("player-count");
let dealerCount = document.getElementById("dealer-count");
showDepositedAmount.textContent = depositedAmount;
showBetAmount.textContent = betAmount;

/*----- event listeners -----*/
dealButton.addEventListener("click", deal);
document
  .querySelector("button")
  .addEventListener("click", renderNewShuffledDeck);
hitButton.addEventListener("click", hit);
standButton.addEventListener("click", stand);
// formTag.addEventListener("submit", submit);
depositButton.addEventListener("click", deposit);
betButton.addEventListener("click", bet);

/*----- functions -----*/
// function submit(e) {
//   e.preventDefault();
//   deposit();
//   bet();
// }
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

function bet() {
  const betInput = document.getElementById("bet-input");
  const betValue = parseInt(betInput.value);
  if (!isNaN(betValue) && betValue >= 5 && betValue <= depositedAmount) {
    betAmount += betValue;
    showBetAmount.textContent = `$${betAmount}`;
    betInput.value = "";
    depositedAmount -= betValue;
    showDepositedAmount.textContent = `$${depositedAmount}`;
  } else {
    showBetAmount.textContent = "Insufficient balance!";
    betInput.value = "";
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

  //Reset bet amount and update values
  // betAmount = 0;
  showBetAmount.textContent = `$${betAmount}`;
  showDepositedAmount.textContent = `$${depositedAmount}`;

  //Enable buttons
  hitButton.disabled = false;
  standButton.disabled = false;

  //Reset counts and show counts
  playerCount.textContent = "";
  dealerCount.textContent = "";
  displayHandCount(playerHand, playerCount);
  displayHandCount(dealerHand, dealerCount);
}

function renderDeckInContainer(deck, container) {
  container.innerHTML = "";
  // Let's build the cards as a string of HTML
  let cardsHtml = "";
  deck.forEach(function (card) {
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
    betButton.disabled = false;
    dealButton.disabled = false;
  }
}

function hit() {
  if (betAmount < 5) {
    //can remove if bet amount, same for stand
    resultContainer.textContent = "Please enter your bet!";
  } else {
    resultContainer.textContent = "";
    blackjack(playerHand, "Player");
    blackjack(dealerHand, "Dealer");
    let playerValue = calculateHandValue(playerHand);
    if (shuffledDeck.length > 0 && playerValue < 21) {
      const newCard = shuffledDeck.shift();
      playerHand.push(newCard);
      renderDeckInContainer(playerHand, playerContainer);
      renderDeckInContainer(shuffledDeck, shuffledContainer);
      playerValue = calculateHandValue(playerHand);
      displayHandCount(playerHand, playerCount);
      displayHandCount(dealerHand, dealerCount);
      if (playerValue > 21) {
        const result = "Dealer Wins";
        gameOver = true;
        displayResult(result);
        handleGameOver();
      } else if (playerValue === 21) {
        shuffledContainer.textContent = "Win already still hit!";
      }
    }
  }
}

function stand() {
  if (betAmount < 5) {
    resultContainer.textContent = "Please enter your bet!";
  } else {
    resultContainer.textContent = "";
    blackjack(playerHand, "Player");
    blackjack(dealerHand, "Dealer");
    //determine winner
    const playerValue = calculateHandValue(playerHand);
    if (playerValue < 12) {
      return (shuffledContainer.textContent = "eh hit la");
    }

    let dealerValue = calculateHandValue(dealerHand);
    while (dealerValue < 17) {
      const newCard = shuffledDeck.shift();
      dealerHand.push(newCard);
      renderDeckInContainer(dealerHand, dealerContainer);
      renderDeckInContainer(shuffledDeck, shuffledContainer);
      dealerValue = calculateHandValue(dealerHand);
    }
    displayHandCount(dealerHand, dealerCount);
    displayHandCount(playerHand, playerCount); //my bet amount nvr reset to 0 only visually
    console.log(dealerValue); //test
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
      const result = "Push!";
      gameOver = true;
      payOut();
      displayResult(result);
    }
    handleGameOver();
  }
}

// 6/16
// Display Hand Count
function displayHandCount(deck, count) {
  const handValue = calculateHandValue(deck);
  const numOfAce = deck.filter((card) => card.value === 11).length;
  // const numOfAceIsOne = calculateHandValue(deck)[1];

  if (
    numOfAce > 0 &&
    deck.length === 2 &&
    (deck[0].value === 10 || deck[1].value === 10)
  ) {
    count.textContent = "Blackjack!";
  } else {
    count.textContent = handValue;
  }
}

function calculateHandValue(deck) {
  let handValue = 0;
  let numOfAce = 0;
  // let oneAceIsEleven = false;
  // let handValueArr = [handValue, aceValueIsOne];
  deck.forEach((card) => {
    if (card.value !== 11) {
      handValue += card.value;
    } else {
      numOfAce++;
      // oneAceIsEleven = true;
    }
  });
  // while (numOfAce > 0 && handValue + 10 <= 21) {
  //   handValue += 10;
  //   numOfAce--;
  // }
  if (numOfAce === 1) {
    //If I have 8 9 A -> Ace must be 1
    //If I have 9 A -> Ace can be 11
    if (handValue + 11 <= 21) {
      handValue += 11;
    } else {
      handValue += 1;
    }
  } else if (numOfAce === 2) {
    //If I have 10 A A -> Ace must be 1
    //If I have 9 A A -> 1 Ace must be 11 and the other is 1
    //If I have A A -> 1 Ace must be 11 and the other is 1
    if (handValue + 12 <= 21) {
      handValue += 12;
    } else {
      handValue += 2;
    }
  } else if (numOfAce === 3) {
    //If I have 10 A A A -> Ace must be 1
    //If I have 9 A A A -> Ace must be 1
    //If I have 8 A A A -> 1 Ace must be 11 and others are 1
    //If I have A A A -> 1 Ace must be 11 and the others are 1
    if (handValue + 13 <= 21) {
      handValue += 13;
    } else {
      handValue += 3;
    }
  } else if (numOfAce === 4) {
    if (handValue + 14 <= 21) {
      handValue += 14;
    } else {
      handValue += 4;
    }
  }
  return handValue;
}

function blackjack(deck, name) {
  if (
    (deck[0].value === 10 && deck[1].value === 11) ||
    (deck[0].value === 11 && deck[1].value === 10)
  ) {
    if (deck !== dealerHand) {
      playerBlackjack = true;
      payOut();
      displayResult(`Blackjack!! ${name} Wins!`);
      handleGameOver();
    } else {
      displayResult(`Blackjack!! ${name} Wins!`);
      handleGameOver();
    }
  }
}

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
function deal() {
  if (betAmount < 5) {
    resultContainer.textContent = "Please enter your bet!";
    return;
  }
  renderNewShuffledDeck();
  betButton.disabled = true;
  dealButton.disabled = true;
}

//================== even game, wager, next game, soft/hard display values
//================== local storage
// deposit -> wager -> play -> hit/stand -> checkresult -> restart -> use the current deck
//NEED TO DO
// game logic for hit and stand -> placement of if (gameover) -> settle the count
//show soft/hard displayer
//use current deck
//refine gameover function -> remove button click
// repeat Bet and i need double also
// need a new game function
// count -> not following Ace rules (done)
// my tie is not returning me my money (done)
// insurance??
