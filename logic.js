// Morse code trainer logic.

let listeningTrainingModeVisible = (window.localStorage.getItem('listeningTrainingModeVisible') === "true" ? true : false) ?? false; // Show letter when initially playing sound
let showCorrectAnswer = (window.localStorage.getItem('showCorrectAnswer') === "false" ? false : true) ?? true;; // If incorrect answer, show correct answer below.
let waitForKeyAfterAnswer = (window.localStorage.getItem('waitForKeyAfterAnswer') === "false" ? false : true) ?? true; // If false, will move onto the next question after a short delay.
let playAgainOnCorrect = (window.localStorage.getItem('playAgainOnCorrect') === "false" ? false : true) ?? true;; // Play the morse code sound when correct letter is pressed.
let trainingMode = Number.parseInt(window.localStorage.getItem('trainingMode') ?? 3); // 1 = Listening, 2 = Keying, 3 = Both
let keyingTimeTolerance = Number.parseFloat(window.localStorage.getItem('keyingTimeTolerance') ?? 0.06); // When keying in codes, how tolerant should the check be? This is in seconds.
let defaultDot = Number.parseFloat(window.localStorage.getItem('defaultDot') ?? 1.2 / 15); // How long of a second is a dot. Standard is 0.08 (1.2 / 15)
let defaultDashMultiplier = Number.parseInt(window.localStorage.getItem('defaultDashMultiplier') ?? 3); // How many dot lengths of time make up a dash
let defaultSpaceMultiplier = Number.parseInt(window.localStorage.getItem('defaultSpaceMultiplier') ?? 7); // How many dot lengths of time make up a space
let keyingInTriggerBuffer = Number.parseInt(window.localStorage.getItem('keyingInTriggerBuffer') ?? -50); // After pressing . or / when keying in, how long before the next dot or dash can be entered after the sound ends.

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

let characterScores = {};

const stateOutputText = {
  "start": "Press space to begin!",
  "correct listening answer": "Correct! Press [Space] to load the next character.",
  "correct listening answer playing": "Correct!   ...",
  "incorrect listening answer": "Incorrect! Press [Space] to load the next character.",
  "waiting listening answer": "Press the key you heard",
  "playing listening question": "Playing...",
  "asking keying question": "Press [Enter] or, [.] for dot and [/] for dash to key in the letter ",
  "waiting keying input": "Press [Enter] or, [.] for dot and [/] for dash to key in the letter ",
  "receiving keying input": "Keep going! ",
  "playing keying input": "Keep going! ",
  "correct keying answer": "Correct! Press [Space] to load the next character.",
  "incorrect keying answer": "Incorrect! Press [Space] to load the next character."
};

let state = null;
let currentCharacter = "";
const startState = "start";
const lblStatusOutput = "statusOutput";
const lblLetterDisplay = "letterDisplay";
const lblCorrectAnswer = "correctAnswer";
let keyOscillator = null;
let currentKeyDown = null;
let answerRecorder = "";
let keyDownTime = 0;
let sequenceEndTimer = null;
let autoLoadNextQuestionTimer = null;

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

const generateNewListeningTry = () => {
  characterScores.totalListeningQuestionsAsked++;
  updateState("playing listening question");
  updateDisplayCorrectLetter("");
  const newLetter = getRandomLetter();
  currentCharacter = newLetter;
  // console.log("[Debug::generateNewListeningTry]: New Letter:", newLetter);
  if (listeningTrainingModeVisible) {
    updateDisplayLetter(currentCharacter.letter);
  }
  playMorseCodeSound({ inputCode: newLetter.morseCode }).then((result) => {
    if (listeningTrainingModeVisible) {
      updateDisplayLetter(" ");
    }
    updateState("waiting listening answer");
  });
};

const generateNewKeyingTry = () => {
  characterScores.totalKeyingQuestionsAsked++;
  updateDisplayCorrectLetter("");
  const newLetter = getRandomLetter();
  currentCharacter = newLetter;
  // console.log("[Debug::generateNewKeyingTry]: New Letter:", newLetter);
  updateDisplayLetter(currentCharacter.letter);
  updateState("waiting keying input");
};

const processKeyInputTime = () => {
  const keyUpTime = new Date().getTime();
  const keyTimeDiff = (keyUpTime - keyDownTime) / 1000;

  if (keyTimeDiff > (defaultDot - keyingTimeTolerance) && keyTimeDiff < (defaultDot + keyingTimeTolerance)) { // Dot
    answerRecorder += ".";
  } else if (keyTimeDiff > ((defaultDot * defaultDashMultiplier) - keyingTimeTolerance) && keyTimeDiff < ((defaultDot * defaultDashMultiplier) + keyingTimeTolerance)) { // Dash
    answerRecorder += "-";
  } else {
    answerRecorder += "?";
  }

  updateDisplayCorrectLetter(answerRecorder);
};

const generateNewQuestion = (modeSelection = trainingMode) => {
  updateDisplayLetter(" ");
  if (autoLoadNextQuestionTimer) {
    clearTimeout(autoLoadNextQuestionTimer);
    autoLoadNextQuestionTimer = null;
  }

  if (modeSelection === 1) {
    generateNewListeningTry();
  } else if (modeSelection === 2) {
    generateNewKeyingTry();
  } else if (modeSelection === 3) {
    const randomSelection = randomNumber(1, 2);
    if (randomSelection === 1) {
      generateNewListeningTry();
    } else {
      generateNewKeyingTry();
    }
  } else {
    console.warn(`Unknown trainingMode "${modeSelection}"`);
    generateNewQuestion(3);
  }
};

const loadNextQuestionTimeout = () => {
  if (!waitForKeyAfterAnswer) {
    if (!autoLoadNextQuestionTimer) {
      autoLoadNextQuestionTimer = setTimeout(() => {
        if (autoLoadNextQuestionTimer) {
          clearTimeout(autoLoadNextQuestionTimer);
          autoLoadNextQuestionTimer = null;
        }
        generateNewQuestion();
      }, nextQuestionAutoLoadDelay);
    }
  }
};

const keyPressHook = (eKey) => { // This is the main state switch. It is triggered on keyup.
  if (state === "waiting listening answer") {
    if (eKey.key === " ") {
      updateState("playing listening question");
      if (listeningTrainingModeVisible) {
        updateDisplayLetter(currentCharacter.letter);
      }
      playMorseCodeSound({ inputCode: currentCharacter.morseCode }).then((result) => {
        if (listeningTrainingModeVisible) {
          updateDisplayLetter(" ");
        }
        updateState("waiting listening answer");
      });
    } else if (currentCharacter.letter === eKey.key) {
      characterScores.correctListeningAnswers++;
      characterScores.listening[currentCharacter.letter].correctCount++;
      characterScores.correctListeningAnswers++;
      window.localStorage.setItem('Score', JSON.stringify(characterScores));
      if (playAgainOnCorrect) {
        updateDisplayLetter(currentCharacter.letter);
        updateState("correct listening answer playing");
        playMorseCodeSound({ inputCode: morseCodeLetters[currentCharacter.letter] }).then((result) => {
          updateState("correct listening answer");
          loadNextQuestionTimeout();
        });
      } else {
        updateState("correct listening answer");
        loadNextQuestionTimeout();
      }
    } else {
      characterScores.incorrectListeningAnswers++;
      characterScores.listening[currentCharacter.letter].incorrectCount++;
      window.localStorage.setItem('Score', JSON.stringify(characterScores));
      updateState("incorrect listening answer");
      if (showCorrectAnswer) {
        updateDisplayCorrectLetter(`Correct answer was: ${currentCharacter.letter}`);
      }
      loadNextQuestionTimeout();
    }

  } else if (state === "correct listening answer" || state === "incorrect listening answer") {
    if (eKey.key === " ") {
      generateNewQuestion();
    }
  } else if (state === "start") {
    if (eKey.key === " ") {
      generateNewQuestion();
    }
  } else if (state === "asking keying question" || state === "correct keying answer" || state === "incorrect keying answer") {
    if (eKey.key === " ") {
      generateNewQuestion();
    }
  } else if (state === "asking keying question") {
    if (eKey.key === " ") {
      generateNewQuestion();
    }
  }
};

const checkInputSequence = () => {
  if (answerRecorder === currentCharacter.morseCode) {
    updateState("correct keying answer");
    characterScores.keying[currentCharacter.letter].correctCount++;
    characterScores.correctKeyingAnswers++;
    window.localStorage.setItem('Score', JSON.stringify(characterScores));
    loadNextQuestionTimeout();
  } else {
    updateState("incorrect keying answer");
    characterScores.keying[currentCharacter.letter].incorrectCount++;
    characterScores.incorrectKeyingAnswers++;
    window.localStorage.setItem('Score', JSON.stringify(characterScores));
    if (showCorrectAnswer) {
      updateDisplayCorrectLetter(`Correct answer is: ' ${currentCharacter.morseCode} ', but you entered ' ${answerRecorder} '`);
    }
    loadNextQuestionTimeout();
  }
};

const keyUpHook = (eKey) => {
  if (eKey.key === 'Enter') {
    if (keyOscillator) {
      keyOscillator = endKeySound(keyOscillator);
      processKeyInputTime();
      if (sequenceEndTimer) {
        clearTimeout(sequenceEndTimer);
      }
      const sequenceEndTime = ((defaultDot * defaultSpaceMultiplier) + keyingTimeTolerance) * 1000;
      sequenceEndTimer = setTimeout(() => {
        checkInputSequence();
        clearTimeout(sequenceEndTimer);
      }, sequenceEndTime);
    }
    currentKeyDown = null
  } else if (eKey.key === '.' || eKey.key === '/') {
    if (sequenceEndTimer) {
      clearTimeout(sequenceEndTimer);
    }
    const sequenceEndTime = ((defaultDot * (defaultSpaceMultiplier + defaultDashMultiplier)) + keyingTimeTolerance) * 1000;
    sequenceEndTimer = setTimeout(() => {
      checkInputSequence();
      clearTimeout(sequenceEndTimer);
    }, sequenceEndTime);
    currentKeyDown = null
  }
};

const keyDownHook = (eKey) => {
  if (eKey.key === 'Enter') {
    if (state === "waiting keying input") {
      currentKeyDown = eKey.key;
      answerRecorder = "";
      keyDownTime = new Date().getTime();
      updateState("receiving keying input");
      if (!keyOscillator) {
        keyOscillator = beginKeySound();
      } else {
        if (currentKeyDown !== eKey.key) {
          console.warn("[Debug::keyDownHook]: Oscillator is already playing!", keyOscillator);
        }
      }
    } else if (state === "receiving keying input") {
      if (!keyOscillator) {
        keyOscillator = beginKeySound();
        currentKeyDown = eKey.key;
        keyDownTime = new Date().getTime();
      } else {
        if (currentKeyDown !== eKey.key) {
          console.warn("[Debug::keyDownHook]: Oscillator is already playing!", keyOscillator);
        }
      }
    }
  } else if (eKey.key === '.') {
    if (state === "waiting keying input") {
      answerRecorder = ".";
      playMorseCodeSound({ inputCode: ".", endBuffer: keyingInTriggerBuffer }).then((result) => {
        updateDisplayCorrectLetter(answerRecorder);
        updateState("receiving keying input");
      });
      updateState("playing keying input");
    } else if (state === "receiving keying input") {
      answerRecorder += ".";
      playMorseCodeSound({ inputCode: ".", endBuffer: keyingInTriggerBuffer }).then((result) => {
        updateDisplayCorrectLetter(answerRecorder);
        updateState("receiving keying input");
      });
      updateState("playing keying input");
    }
  } else if (eKey.key === '/') {
    if (state === "waiting keying input") {
      answerRecorder = "-";
      playMorseCodeSound({ inputCode: "-", endBuffer: keyingInTriggerBuffer }).then((result) => {
        updateDisplayCorrectLetter(answerRecorder);
        updateState("receiving keying input");
      });
      updateState("playing keying input");
    } else if (state === "receiving keying input") {
      answerRecorder += "-";
      playMorseCodeSound({ inputCode: "-", endBuffer: keyingInTriggerBuffer }).then((result) => {
        updateDisplayCorrectLetter(answerRecorder);
        updateState("receiving keying input");
      });
      updateState("playing keying input");
    }
  }
};

const createScoreObject = () => {
  
  try {
    characterScores = JSON.parse(window.localStorage.getItem('Score')) || {};
  } catch(err) {
    console.warn('Could not get saved scores:');
    console.error(err);
    characterScores = {};
    console.warn('Scores have been reset.');
  }
  characterScores.keying = {};
  characterScores.listening = {};

  if (!characterScores.correctListeningAnswers) { characterScores.correctListeningAnswers = 0; }
  if (!characterScores.incorrectListeningAnswers) { characterScores.incorrectListeningAnswers = 0; }
  if (!characterScores.totalListeningQuestionsAsked) { characterScores.totalListeningQuestionsAsked = 0; }

  if (!characterScores.correctKeyingAnswers) { characterScores.correctKeyingAnswers = 0; }
  if (!characterScores.incorrectKeyingAnswers) { characterScores.incorrectKeyingAnswers = 0; }
  if (!characterScores.totalKeyingQuestionsAsked) { characterScores.totalKeyingQuestionsAsked = 0; }

  Object.keys(morseCodeLetters).forEach((letter) => {
    if (!characterScores.keying[letter]) { characterScores.keying[letter] = {}; }
    if (!characterScores.listening[letter]) { characterScores.listening[letter] = {}; }

    if (!characterScores.keying[letter].correctCount) { characterScores.keying[letter].correctCount = 0; }
    if (!characterScores.keying[letter].incorrectCount) { characterScores.keying[letter].incorrectCount = 0; }

    if (!characterScores.listening[letter].correctCount) { characterScores.keying[letter].correctCount = 0; }
    if (!characterScores.listening[letter].incorrectCount) { characterScores.keying[letter].incorrectCount = 0; }
  });

  window.localStorage.setItem('Score', JSON.stringify(characterScores));
};

const init = () => {
  objLblStatusOutput = document.getElementById(lblStatusOutput);
  objLblLetterDisplay = document.getElementById(lblLetterDisplay);
  objLblCorrectAnswer = document.getElementById(lblCorrectAnswer);
  updateState(startState);
  createScoreObject();
  document.addEventListener('keypress', keyPressHook);
  document.addEventListener('keyup', keyUpHook);
  document.addEventListener('keydown', keyDownHook);
};
