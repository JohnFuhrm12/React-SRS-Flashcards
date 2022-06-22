# React-SRS-Flashcards
A Spaced-Repetition-System (SRS) study tool using flashcards based on Anki built with React.js. and Firebase. Deployed with Netlify.

An SRS is a program that uses an algorithm to show you less of what you memorize well or know already, and show you more of what you have trouble remembering. Using flashcards to study the software takes user input of how easy or difficult to remember a card was or if it can't be remembered to decide how long to show you the card again.

For example if you are studying Spanish and have a card for the word "Hello" (Hola), and it's easy for you, it will wait 3 days to show it again, and then if after 3 days it's easy again, show you in 10 days, or if it was hard in another 5 days. These values increase as you see the card more and more, and decrease if you start to forget it.

To use, simply login with any username and create a card deck. You can then create cards for that deck and when you click "Study" the cards will be shown to you with 2 counter, blue for new cards and green for review cards. You will be shown the front of the card, and simply you must try to think of the answer (back of the card), when you think you have it click "Show Response" to see how you did. Respond to the prompt and the softeware will take care of the rest. Then come back the next day to see if you have any review cards to study again.(If you answer "Hard" on a new card, it will be shown the next day, otherwise 2-3 days.)
