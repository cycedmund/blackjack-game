# Blackjack Game

## Description

Blackjack is a card game that is widely popular across the globe. In casinos, it is recognised as a game that has the lowest house edge, which makes it a game that everyone turns to. I decided to recreate this game as my first project because I would like to provide a platform for the seasoned players to hone their card counting and perfect their basic strategy.

The goal of the game is to beat the dealer by having a hand value as close to 21 as possible without going over. At the moment, this implementation of Blackjack features a single deck and does not allow splitting or insurance.

## How To Play

1. Gameplay: The game involves the player competing against the dealer. The player is dealt two cards face up, and the dealer is dealt one card face up and one card face down, the latter is also known as the hole card.

2. Hand Value: Each card has a value. Number cards are worth their face value, face cards (Jacks, Queens, Kings) are worth 10, and Aces can be worth 1 or 11, depending on which value benefits the player.

3. Player's Turn: The player can choose to draw another card (with the "HIT" button) or keep the current hand (with the "STAND" button). The aim is to achieve a hand value as close to 21 as possible without exceeding it. If the hand value exceeds 21, the player will bust and the game will end with the dealer as the winner.

4. Dealer's Turn: Once the player decides to "STAND", the dealer will reveal the hole card. The dealer must draw cards to obtain a hand value of at least 17, not exceeding 21. If the dealer's hand value exceeds 21, the player will be declared the winner and will be paid accordingly.

5. Payout: All winning bets are paid even money (1 to 1), except for Blackjack, which pays you one-and-a-half times your bet or 3 to 2.

## Rules

1.

## Screenshot

## Technologies & Tools Used

- HTML
- CSS
- JavaScript
- Git & GitHub

## Getting Started

The game is deployed on Vercel App, you can view and play the game here:
https://blackjack-game-project.vercel.app/

## Next Steps

- Bugs fixes

- Implement Splitting and Insurance, to emulate the casinos' environment for Blackjack games.

- Increase the number of decks used to 6-8 and increase the number of hands/players. These implementation will provide the right environment for the players to hone their card counting strategies.

- Add audio for an enhanced gaming experience.
