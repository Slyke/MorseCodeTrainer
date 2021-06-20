# MorseCodeTrainer

## About
This is a small Morse Code trainer I made in my spare time. It not only asks you to enter in the letters you hear, but can also asks you to key them in morse code style. It tracks your score for each letter and saves it in local storage. It doesn't have a screen to display your score though.

You can view your score at any time by typing `characterScores` into the Javascript console.

## Run Online
Simply navigate to: https://slyke.github.io/MorseCodeTrainer/

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
* `keyingInTriggerBuffer` (Int) - -65000-65000 - After pressing . or / when keying in, how long in ms before the next dot or dash can be entered after the sound ends.

### Example setting options:
You can set these in the Javascript console:

```
localStorage.setItem('nextQuestionAutoLoadDelay', 2000);
```
or

```
localStorage.setItem('showCorrectAnswer', false);
```

### Example mode setting:
Listening:
```
localStorage.setItem('trainingMode', 1);
```

Keying In:.
```
localStorage.setItem('trainingMode', 2);
```
Both (default):
```
localStorage.setItem('trainingMode', 3);
```

Refresh the page to apply and load the new values.

## Modes
There are 2 training modes: Keying in and Listening.

### Listening
Listening mode requires you to listen to a Morse Code sequence and then press the letter or number on your keyboard corresponding to the code you heard.

### Keying In
Keying In mode requires you to enter the Morse Code for the corresponding letter or number displayed on the screen.

You can press `.` for dot and `/` for dash. You can also press and hold the `Enter` key to key in a dot or a dash, depending on how long it's held down for.
Once you begin to key in the number or letter, there's a finite amount of time before it fails you. After each dot or dash, you have about a second to begin the next dot or dash. Once that time expires it checks if the dots and dashes it has recorded match the ones for that letter/number and passes/fails you based on that. It also times how long each dot and dash is, with a tolerance when keying in with the `Enter` key. It will make a ? if the `Enter` key is outside the dot or dash tolerance threshold (Which can be configured).

## Training
Starting out, you may want to only use Keying In mode and following this morse code binary tree:

![Morse Code Binary Tree](/morse_tree.png)

Every step left is a dot, and every step right is a dash. You follow the path down from top to bottom. For example, `W` is left right right, or dot dash dash.

Once you are a little more familiar and know some of the numbers and letters, you will begin to see some patterns in how the numbers and letters are arranged, you can switch the mode to both to help speed up your learning and begin to learn numbers and letters by ear.

## Example Images
![Keying In Example](/key_in.png)
![Listening Example](/listening.png)
![Correct Key In Example](/correct_key_in.png)