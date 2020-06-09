// Morse code trainer logic.

let trainingMode = true; // Show letter when initially playing sound
let showCorrectLetter = true; // If incorrect answer, show correct answer below.
let playAgainOnCorrect = true; // Play the morse code sound when correct letter is pressed.

const morseCodeLetters = {
  // Letters
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',

  // Numbers
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  0: '-----',

  // HEX
  // A: '-...-',
  // B: '-..--',
  // C: '-.-.-',
  // D: '-.---',
  // E: '--..-',
  // F: '--.--',

  // Special Characters
  // ".": '.-.-.-',
  // ",": '--..--',
  // "?": '..--..',
  // "/": '-..-.',
  // "@": '.--.-.',
};

const characterScores = {};

const stateOutputText = {
  "start": "Press space to begin!",
  "correct answer": "Correct! Press [Space] to load the next character.",
  "correct answer playing": "Correct!   ...",
  "incorrect answer": "Incorrect! Press [Space] to load the next character.",
  "waiting answer": "Press the key you heard",
  "playing question": "Playing...",
};

let state = null;
let currentCharacter = "";
const startState = "start";
const lblStatusOutput = "statusOutput";
const lblLetterDisplay = "letterDisplay";
const lblCorrectAnswer = "correctAnswer";

let correctAnswers = 0;
let incorrectAnswers = 0;
let totalQuestionsAsked = 0;

let objLblStatusOutput = null;
let objLblLetterDisplay = null;
let objLblCorrectAnswer = null;

const randomNumber = (lowerNumber, higherNumber) => {
  return Math.floor(Math.random() * higherNumber) + lowerNumber;
};

const updateState = (newState) => {
  state = newState
  objLblStatusOutput.innerHTML = stateOutputText[state];
  // console.log("[Debug::updateState]: Current State:", newState);
};

const getRandomLetter = () => {
  const morseCodeLettersArray = Object.keys(morseCodeLetters);
  const characterIndex = randomNumber(0, morseCodeLettersArray.length);
  return {
    morseCode: morseCodeLetters[morseCodeLettersArray[characterIndex]],
    letter: morseCodeLettersArray[characterIndex]
  };
};

const updateDisplayLetter = (newLetter) => {
  objLblLetterDisplay.innerHTML = newLetter;
};

const updateDisplayCorrectLetter = (newLetter) => {
  objLblCorrectAnswer.innerHTML = newLetter;
};

const generateNewTry = () => {
  totalQuestionsAsked++;
  updateState("playing question");
  updateDisplayCorrectLetter("");
  const newLetter = getRandomLetter();
  currentCharacter = newLetter;
  // console.log("[Debug::generateNewTry]: New Letter:", newLetter);
  if (trainingMode) {
    updateDisplayLetter(currentCharacter.letter);
  }
  playMorseCodeSound(newLetter.morseCode).then((result) => {
    if (trainingMode) {
      updateDisplayLetter(" ");
    }
    updateState("waiting answer");
  });
};

const keyPressHook = (eKey) => {
  if (state === "waiting answer") {
    if (eKey.key === " ") {
      updateState("playing question");
      if (trainingMode) {
        updateDisplayLetter(currentCharacter.letter);
      }
      playMorseCodeSound(currentCharacter.morseCode).then((result) => {
        if (trainingMode) {
          updateDisplayLetter(" ");
        }
        updateState("waiting answer");
      });
    } else if (currentCharacter.letter === eKey.key) {
      correctAnswers++;
      characterScores[currentCharacter.letter].correctCount++;
      if (playAgainOnCorrect) {
        updateState("correct answer playing");
        playMorseCodeSound(morseCodeLetters[currentCharacter.letter]).then((result) => {
          updateState("correct answer");
        });
      } else {
        updateState("correct answer");
      }
    } else {
      incorrectAnswers++;
      characterScores[currentCharacter.letter].incorrectCount++;
      updateState("incorrect answer");
      if (showCorrectLetter) {
        updateDisplayCorrectLetter(`Correct answer was: ${currentCharacter.letter}`);
      }
    }
    // console.log("[Debug::keyPressHook]: Key Press:", eKey.key);
  } else if (state === "correct answer" || state === "incorrect answer") {
    if (eKey.key === " ") {
      generateNewTry();
    }
  } else if (state === "start") {
    if (eKey.key === " ") {
      generateNewTry();
    }
  }
};

const init = () => {
  objLblStatusOutput = document.getElementById(lblStatusOutput);
  objLblLetterDisplay = document.getElementById(lblLetterDisplay);
  objLblCorrectAnswer = document.getElementById(lblCorrectAnswer);
  updateState(startState);
  document.addEventListener('keypress', keyPressHook);
  Object.keys(morseCodeLetters).forEach((letter) => {
    characterScores[letter] = {};
    characterScores[letter].correctCount = 0;
    characterScores[letter].incorrectCount = 0;
  })
};