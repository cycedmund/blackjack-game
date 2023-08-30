# Blackjack Game

## Table of Contents

- [Description](#Description)
- [How To Play](#How-To-Play)
- [Screenshots](#Screenshots)
- [Technologies Used](#Technologies-Used)
- [Getting Started](#Getting-Started)
- [Next Steps](#Next-Steps)
- [Credit Resources](#Credit-Resources)

## Description

Blackjack is a widely popular card game. In the realm of casinos, it stands out as a game with the lowest house edge, making it a favorite among players. I chose to recreate this classic game, aiming to provide a platform for beginners to practise their card-counting skills and master the basic strategy.

The objective of this game is to outscore the dealer by obtaining a hand value as close to 21 as possible without exceeding it. In this implementation, a single deck is used, and features such as splitting or insurance are not yet incorporated.

## How To Play

1. Gameplay:
   The game involves the player competing against the dealer. The player is dealt two cards face up, and the dealer is dealt one card face up and one card face down (the hole card).

2. Hand Value:
   Each card has a value. Number cards are worth their face value, face cards (Jacks, Queens, Kings) are worth 10, and Aces can be worth 1 or 11, depending on which value benefits the player.

3. Pre-Game:
   The player is given $500 at the start of the game, and can choose to deposit more money(any amount between $5 and $1000 inclusive). The player must place a bet (with the chips) before starting the round (with the "DEAL" button).

4. Determine Blackjack:
   Once the cards are dealt, the hand values of both the player and dealer are calculated to determine the presence of a blackjack. If either the player or dealer is dealt a blackjack, that individual will be declared the winner. In the event that both the player and the dealer have a blackjack, the game will result in a draw.

5. Player's Turn:
   The player can choose to draw another card (with the "HIT" button) or keep the current hand (with the "STAND" button). The aim is to achieve a hand value as close to 21 as possible without exceeding it. If the hand value exceeds 21, the player will bust and the game will end with the dealer as the winner.

6. Dealer's Turn:
   Once the player decides to "STAND", the dealer will reveal the hole card. The dealer must draw cards to obtain a hand value of at least 17, not exceeding 21. If the dealer's hand value exceeds 21, the player will be declared the winner and will be paid accordingly.

7. Results:
   The dealer's hand value will be compared against the player's hand value. If the player's hand value is greater than the dealer's hand value, the player will be declared the winner and will receive the appropriate payout. In case both hands have equal values, the game will end in a draw and the player will have their original bet amount returned.

8. Payout:
   All winning bets are paid even money (1 to 1), except for Blackjack, which pays one-and-a-half times the bet (3 to 2).

9. Additional Rules:
   The player is allowed to stand only when their hand value is 12 or higher. However, they have the option to double their bet on the initial two cards regardless of their hand value.

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

The game is deployed on Vercel, you can view and play the game here:
https://blackjack-game-project.vercel.app/

Note: The optimal experience for playing the game is on computers. The images might not display correctly on phones or iPads.

## Next Steps

- Introduce Splitting and Insurance features.

- Expand the deck count to 6-8 decks and allow for multiple hands/players.

- Enhance the gaming experience with audio effects.

- Include a card counter feature to facilitate practice in card counting techniques.

- Provide a Basic Strategy chart as a Modal for reference. Alternatively, automate the execution of the basic strategy.

- Include CSS Media queries to ensure the game works on different screen sizes.

- Decrease the player odds of winning to discourage excessive gambling.

## Credit Resources

### Research On Blackjack

1. **How To Play Blackjack**: Articles on [Blackjack Apprenticeship](https://www.blackjackapprenticeship.com/how-to-play-blackjack/) and [Wikipedia](https://en.wikipedia.org/wiki/Blackjack#:~:text=A%20blackjack%20beats%20any%20hand,in%20single%2Ddeck%20blackjack%20games)

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

2. **Matches() method**: Article on [Go Make Things](https://gomakethings.com/listening-for-events-on-multiple-elements-using-javascript-event-delegation/) and [Stackoverflow](https://stackoverflow.com/questions/58372977/what-is-the-difference-between-element-classlist-contains-and-element-matches)

3. **Prevent Default Enter Key**: Tutorial on [StackDiary](https://stackdiary.com/tutorials/prevent-form-submission-on-pressing-enter-with-javascript/)

4. **Implement Local Storage**: Article on [Tiny Blog](https://www.tiny.cloud/blog/javascript-localstorage/)
