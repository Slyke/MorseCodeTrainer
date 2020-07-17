# MorseCodeTrainer

## About
This is a small Morse Code trainer I made in my spare time. It not only asks you to enter in the letters you hear, but can also asks you to key them in morse code style. It tracks your score for each letter and saves it in local storage. It doesn't have a screen to display your score though.

You can view your score at any time by typing `characterScores` into the Javascript console.

## Installation
Commands to run locally:
```
git clone https://github.com/Slyke/MorseCodeTrainer.git
cd MorseCodeTrainer
```

## Running
```
npm start
```
Navigate to `http://127.0.0.1:8080`

## Updating
I may push updates from time to time. You can update the code by running the following command from within the project's directory.
```
git pull
```

## Configs:
In the top of the `logic.js` file you will find all the settings, and codes that this small app uses. You can also optionally set the following in your browsers *localStorage* for it to automatically load:
* `listeningTrainingModeVisible` (Boolean) - true|false - Show letter when initially playing sound
* `showCorrectAnswer` (Boolean) - true|false - If incorrect answer provided, show correct answer below.
* `waitForKeyAfterAnswer` (Boolean) - true|false - If set to false, will automatically load the next question.
* `playAgainOnCorrect` (Boolean) - true|false - Play the morse code sound again when correct letter is pressed.
* `trainingMode` (Int) - 1-3 - 1 = Listening, 2 = Keying in, 3 = Both. If 3 is set, it will randomly pick either keying in or listening
* `nextQuestionAutoLoadDelay` (Int) - 1-65000 - If waitForKeyAfterAnswer is false, how long to wait in ms before loading the next question.
* `keyingTimeTolerance` (Float) - 0.0000-65.000 - When keying in codes, how tolerant should the check be? This is in seconds.
* `defaultDot` (Float) - 0.0000-65.000 - How long of a second is a dot. Standard is 0.08 (1.2 / 15)
* `defaultDashMultiplier` (Int) - 1-65 - How many dot lengths of time make up a dash
* `defaultSpaceMultiplier` (Int) - 1-65 - How many dot lengths of time make up a space

### Example setting options:
You can set these in the Javascript console:

```
localStorage.setItem('nextQuestionAutoLoadDelay', 2000);
```
or

```
localStorage.setItem('showCorrectAnswer', false);
```

Refresh the page to apply and load the new values.

## Example Images
![Keying In Example](/key_in.png)
![Listening Example](/listening.png)
![Correct Key In Example](/correct_key_in.png)