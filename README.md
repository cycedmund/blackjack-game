# Blackjack Game

## Table of Contents

- [Description](##Description)
- [How To Play](##How-To-Play)
- [Screenshots](##Screenshots)
- [Technologies Used](##Technologies-Used)
- [Getting Started](##Getting-Started)
- [Next Steps](##Next-Steps)
- [Credit Resources](##Credit-Resources)

## Description

Blackjack is a card game that is widely popular across the globe. In casinos, it is recognised as a game that has the lowest house edge, which makes it a crowd favourite. I decided to recreate this game as my first project because I would like to provide a platform for beginners to hone their card counting and perfect their basic strategy.

The goal of the game is to beat the dealer by having a hand value as close to 21 as possible without going over. At the moment, this implementation of Blackjack features a single deck and does not allow splitting or insurance.

## How To Play

1. Gameplay: The game involves the player competing against the dealer. The player is dealt two cards face up, and the dealer is dealt one card face up and one card face down (the hole card).

2. Hand Value: Each card has a value. Number cards are worth their face value, face cards (Jacks, Queens, Kings) are worth 10, and Aces can be worth 1 or 11, depending on which value benefits the player.

3. Pre-Game: The player is given $500 at the start of the game, and can choose to deposit more money(any amount between $5 and $1000 inclusive). The player must place a bet (with the chips) before starting the round (with the "DEAL" button).

4. Determine Blackjack: After the cards are dealt, the hand value for the player and dealer is calculated to determine if there is any blackjack. If either the player or dealer is dealt a blackjack, the game will end.

5. Player's Turn: The player can choose to draw another card (with the "HIT" button) or keep the current hand (with the "STAND" button). The aim is to achieve a hand value as close to 21 as possible without exceeding it. If the hand value exceeds 21, the player will bust and the game will end with the dealer as the winner.

6. Dealer's Turn: Once the player decides to "STAND", the dealer will reveal the hole card. The dealer must draw cards to obtain a hand value of at least 17, not exceeding 21. If the dealer's hand value exceeds 21, the player will be declared the winner and will be paid accordingly.

7. Payout: All winning bets are paid even money (1 to 1), except for Blackjack, which pays one-and-a-half times the bet (3 to 2).

8. Other Rules: Player can only stand on a hand value of at least 12, but is able to double at any hand value on the initial two cards.

## Screenshots

### Pre-Game

![Screenshot of Pre-Game](/css/img/Before.png)

### In-Game

![Screenshot of In-Game](/css/img/After.png)

## Technologies Used

- HTML
- CSS
- JavaScript
- Git & GitHub
- ViteJS

## Getting Started

The game is deployed on Vercel App, you can view and play the game here:
https://blackjack-game-project.vercel.app/

## Next Steps

- Implement Splitting and Insurance, to emulate the casinos' environment for Blackjack games.

- Increase the number of decks used to 6-8 and increase the number of hands/players. These implementation will provide the right environment for the players to hone their card counting strategies.

- Add audio for an enhanced gaming experience.

- Include card counter for practising card counting.

- Include Basic Strategy chart as a Modal for reference. Else, automate the perfect strategy.

- Decrease the odds of players to discourage gambling.

## Credit Resources

### Research

1. **How To Play Blackjack**: Article on [Blackjack Apprenticeship](https://www.blackjackapprenticeship.com/how-to-play-blackjack/) and [Wikipedia](https://en.wikipedia.org/wiki/Blackjack#:~:text=A%20blackjack%20beats%20any%20hand,in%20single%2Ddeck%20blackjack%20games)

2. **MBS's Blackjack Rules**: PDF Document on [Gambling Regulatory Authority](https://www.gra.gov.sg/docs/default-source/game-rules/mbs/blackjack-pontoon-games/blackjack-pontoon---gra-website/mbs-blackjack-game-rules-version-63c8994ee-f3e8-4bfd-8398-dee76aa466ee.pdf)

### HTML

1. **Card Containers**: Jim Clark's CSS Card Library [index.html](https://replit.com/@SEIStudent/How-to-Use-CSS-Card-Library#index.html)

2. **Implement Input Step**: Stackoverflow's [Input Step](https://stackoverflow.com/questions/26003148/change-the-increment-value-of-html-number-input-decimals)

### CSS

1. **Playing Cards**: Jim Clark's CSS Card Library [cardstarter.css](https://replit.com/@SEIStudent/How-to-Use-CSS-Card-Library#css/card-library/css/cardstarter.css)

2. **Stacking Cards**: Phước Nguyễn's [CSS Layout Stacked Cards](https://phuoc.ng/collection/css-layout/stacked-cards/)

3. **Buttons**: Button-30's [CSS Scan](https://getcssscan.com/css-buttons-examples)

4. **Input Field**: Rocketcrew.space's [Copy Paste CSS](https://copy-paste-css.com/form-input-text)

### Javascript

1. **Build Deck and Shuffle Deck**: Jim Clark's CSS Card Library [main.js](https://replit.com/@SEIStudent/How-to-Use-CSS-Card-Library#js/main.js)

2. **Event Delegation's Multiple Events**: Article on [Go Make Things](https://gomakethings.com/listening-for-events-on-multiple-elements-using-javascript-event-delegation/)

3. **Prevent Default Enter Key**: Tutorial on [StackDiary](https://stackdiary.com/tutorials/prevent-form-submission-on-pressing-enter-with-javascript/)
