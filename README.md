# MorseCodeTrainer

## About
This is a small Morse Code trainer I made in my spare time. It not only asks you to enter in the letters you hear, but can also asks you to key them in morse code style. It tracks your score for each letter and saves it in local storage. It doesn't have a screen to display your score though.

You can view your score at any time by typing `characterScores` into the Javascript console.

## Installation
While this project has no dependencies in order to run, it does include an optional HTTP server for ease of use. You can host it anywhere without needing to `npm install`.
Commands to run locally:
```
git clone https://github.com/Slyke/MorseCodeTrainer.git
cd MorseCodeTrainer
npm install
```

## Running
```
npm start
```
Navigate to `http://127.0.0.1:8080`

## Configs:
In the top of the `logic.js` file you will find all the settings, and codes that this small app uses. You can also optionally set the following in your browsers *localStorage* for it to automatically load:
* `listeningTrainingModeVisible` (Boolean) - true|false - Show letter when initially playing sound
* `showCorrectAnswer` (Boolean) - true|false - If incorrect answer provided, show correct answer below.
* `playAgainOnCorrect` (Boolean) - true|false - Play the morse code sound again when correct letter is pressed.
* `trainingMode` (Int) - 1-3 - 1 = Listening, 2 = Keying in, 3 = Both. If 3 is set, it will randomly pick either keying in or listening

## Examples
![Keying In Example](/key_in.png)
![Listening Example](/listening.png)
![Correct Key In Example](/correct_key_in.png)