const AudioContext = window.AudioContext || window.webkitAudioContext;
let dot = 1.2 / 15;

const playMorseCodeSound = (inputCode) => {
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
            playDelta += 3 * dot;
            gainNode.gain.setValueAtTime(0, playDelta);
            playDelta += dot;
            break;
          case " ":
            playDelta += 7 * dot;
            break;

          default:
            reject();
        }
      });

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      return setTimeout(() => {
        return resolve();
      }, ((playDelta * 1000) + 100));
    } catch (err) {
      reject(err);
    }
  });
};