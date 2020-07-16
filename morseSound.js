const AudioContext = window.AudioContext || window.webkitAudioContext;

const playMorseCodeSound = (inputCode, dot = defaultDot, dash = defaultDashMultiplier, space = defaultSpaceMultiplier) => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = new AudioContext();
      let playDelta = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      oscillator.onended = () => { return resolve() };
      oscillator.type = "sine";
      oscillator.frequency.value = 600;
    
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, playDelta);
    
      inputCode.split("").forEach((letter) => {
        switch(letter) {
          case ".":
            gainNode.gain.setValueAtTime(1, playDelta);
            playDelta += dot;
            gainNode.gain.setValueAtTime(0, playDelta);
            playDelta += dot;
            break;
          case "-":
            gainNode.gain.setValueAtTime(1, playDelta);
            playDelta += dash * dot;
            gainNode.gain.setValueAtTime(0, playDelta);
            playDelta += dot;
            break;
          case " ":
            playDelta += space * dot;
            break;

          default:
            reject();
        }
      });

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      return setTimeout(() => {
        oscillator.stop();
        return resolve();
      }, ((playDelta * 1000) + 100));
    } catch (err) {
      return reject(err);
    }
  });
};

const beginKeySound = () => {
  const ctx = new AudioContext();
  let playDelta = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 600;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(1, playDelta);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();

  return oscillator;
};

const endKeySound = (oscillator) => {
  try {
    oscillator.stop();
    return null;
  } catch(err) {
    console.log("[Debug::endKeySound] error:", err);
  }
};