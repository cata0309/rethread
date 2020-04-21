import * as Tone from 'tone';
import * as Global from './globals.js'

var longverb;
var chorus;
var reverb;
var globalSynthLPF;
var noisegain, noise, noiseGainMult, noiseEnv, noiseUsrGain;
var fmSynths = [];
var fmSynthsUsed = [];
var noiseSynths = [];
var noiseSynthsUsed = [];
var padSynths = [];
var padSynthsUsed = [];

function init_tone() {
    // Tone.js

    Tone.context.latencyHint = 'balanced'; // how far in advance events are scheduled, interactive, balanced, fastest, playback
    Tone.Transport.loop = false;

    reverb = new Tone.Reverb(0.5).toMaster();
    reverb.generate();
    // midverb = new Tone.Reverb(2.5).toMaster();
    // midverb.generate();
    longverb = new Tone.Reverb(4.5).toMaster();
    longverb.generate();

    chorus = new Tone.Chorus(1.5, 0.5, 0.3).connect(longverb).toMaster();
    globalSynthLPF = new Tone.Filter(600, "lowpass").connect(chorus);

    
    noisegain = new Tone.Gain(0.00).toMaster();
    noise = new Tone.Noise('pink').start().connect(noisegain);
    noiseGainMult = new Tone.Multiply();
    noiseEnv = new Tone.ScaledEnvelope({
        "attack" : 2.0,
        "decay" : 0.01,
        "sustain" : 1.0,
        "release" : 10.0,
    });
    noiseEnv.releaseCurve = "linear";
    // Multiply two signals together
    noiseEnv.connect(noiseGainMult, 0, 0);
    noiseUsrGain = new Tone.Signal(0.001).connect(noiseGainMult, 0, 1);
    // Use as gain control
    noiseGainMult.connect(noisegain.gain);

    // Create a number of synths and hand them out
    for(let i = 0; i < 10; i++) {
        fmSynths.push(newSynth());
        fmSynthsUsed.push(false);
    }
    for(let i = 0; i < 10; i++) {
        noiseSynths.push(newNoiseSynth());
        noiseSynthsUsed.push(false);
    }

    for(let i = 0; i < 5; i++) {
        padSynths.push(createPadSynth(20, i));
        padSynthsUsed.push(false);
    }

    //start/stop the transport
    // document.getElementById('start-stop')
    //     .addEventListener('click', e => {
    //         Tone.Transport.toggle();
    //         console.log("Toggled transport");
    //     })
    // Tone.Transport.start();

}

function requestFMSynth() {
    for(let i = 0; i < fmSynths.length; i++) {
        if(fmSynthsUsed[i] == false) {
            fmSynthsUsed[i] = true;
            return {synth: fmSynths[i], index: i};
        }
    }
    // Optionally create a new synth if none was free

    return undefined;// Return undefined to signal that no synth was free
}

function returnFMSynth(index) {
    fmSynthsUsed[index] = false;
}

function getNumFreeFMSynths() {
    let numSynths = 0;
    for(let i = 0; i < fmSynths.length; i++) {
        if(fmSynthsUsed[i] == false) {
            numSynths++;
        }
    }
    return numSynths;
}

function requestNoiseSynth() {
    for(let i = 0; i < noiseSynths.length; i++) {
        if(noiseSynthsUsed[i] == false) {
            noiseSynthsUsed[i] = true;
            return {synth: noiseSynths[i], index: i};
        }
    }
    // Optionally create a new synth if none was free

    return undefined;// Return undefined to signal that no synth was free
}

function returnNoiseSynth(index) {
    noiseSynthsUsed[index] = false;
}

function newSynth(){
    let synth = new Tone.FMSynth( {
            harmonicity : Math.floor(Math.random() * 6) * 2 + 1 ,
            modulationIndex : Math.floor(Math.pow(Math.random(), 2.0) * 10) + 1 ,
            detune : 0 ,
            oscillator : {
                type : "sine"
            },
            envelope : {
                attack : 0.01 ,
                decay : 0.01 ,
                sustain : 1 ,
                release : 0.1
            },
            modulation : {
                type : "square"
            },
                modulationEnvelope : {
                attack : 0.5 ,
                decay : 0 ,
                sustain : 1 ,
                release : 0.2
                }
            }
    );
    synth.volume.value = -10;
    
    synth.connect(globalSynthLPF);
    // let lfo = new Tone.LFO("4n", 400, 4000);
    // lfo.connect(filter.frequency);
    return synth;
}

function newNoiseSynth() {
    // let newSynth = new Tone.NoiseSynth(
    //     {
    //         noise : {
    //             type : "pink"
    //         },
    //         envelope : {
    //             attack : 0.005 ,
    //             decay : 0.01 ,
    //             sustain : 0.001
    //         }
    //     }   
    // ).chain(chorus, reverb);
    // newSynth.volume.value = -12;

    let newSynth = new Tone.MembraneSynth( {
        pitchDecay : 0.05 ,
        octaves : 10 ,
        oscillator : {
        type : "sine"
        }
        ,
        envelope : {
        attack : 0.005 ,
        decay : 0.4 ,
        sustain : 0.01 ,
        release : 1.4 ,
        attackCurve : "exponential"
        }
        }
        ).chain(chorus, reverb).toMaster();
    newSynth.volume.value = -10;
    return newSynth;
}

// Smooth pad!
// Its gain is very tilted to the left for some unknown reason
function createPadSynth(freq, index) {
    let noise = new Tone.Noise("pink").start();
    let padenv = new Tone.ScaledEnvelope({
        "attack" : 5.0,
        "decay" : 0.01,
        "sustain" : 1.0,
        "release" : 5.0,
    });
    padenv.releaseCurve = "linear";
    padenv.max = 2.0;
    let filter = new Tone.Filter(freq, 'bandpass', -48);
    filter.Q.value = 500;
    let padGain = new Tone.Gain(1.0).connect(longverb).toMaster();
    noise.connect(filter);
    filter.connect(padGain);
    padenv.connect(padGain.gain);
    return {
        playing: false,
        midi: 60,
        noise: noise,
        env: padenv,
        filter: filter,
        gain: padGain,
        index: index,
        toggle: function(pad, time) {
            if(pad.playing) {
                pad.env.triggerRelease(time);
                pad.playing = false;
            } else {
                pad.filter.frequency.value = Tone.Frequency.mtof(pad.midi);
                let vel = Math.random() * 0.75 + 0.25;
                pad.env.triggerAttack(time, vel);
                pad.playing = true;
            }
        },
        release: function(pad) {
            if(pad.playing) {
                pad.env.triggerRelease();
                pad.playing = false;
            }
        },
        dispose: function(syn) {
            // syn.env.dispose();
            // syn.filter.dispose();
            // syn.gain.dispose();
            // syn.noise.dispose();
            padSynthsUsed[syn.index] = false;
        }
    };
}
function newPadSynth(freq) {
    for(let i = 0; i < fmSynths.length; i++) {
        if(padSynthsUsed[i] == false) {
            padSynthsUsed[i] = true;
            return padSynths[i];
        }
    }
    // Optionally create a new synth if none was free

    return undefined;// Return undefined to signal that no synth was free
}

function newChebySynth() {
    
    let noise = new Tone.Noise("pink");
    let noiseGain = new Tone.Gain(0.0).connect(reverb).toMaster();
    let chebyenv = new Tone.ScaledEnvelope({
        "attack" : 5.0,
        "decay" : 0.01,
        "sustain" : 1.0,
        "release" : 5.0,
    });
    chebyenv.releaseCurve = "linear";
    chebyenv.max = 0.5;
    let chebylfofreq = new Tone.LFO(0.1, 0.05, 0.3).start();
    let chebylfo = new Tone.LFO(0.1, 0.05, 0.1).start();
    chebylfofreq.connect(chebylfo.frequency);
    let gainMult = new Tone.Multiply();
    // Multiply two signals together
    chebyenv.connect(gainMult, 0, 0);
    chebylfo.connect(gainMult, 0, 1);
    // Use as gain control
    gainMult.connect(noiseGain.gain);


    let cheby = new Tone.Chebyshev(300).connect(noiseGain);
    noise.connect(cheby);

    noise.start();
    return {
        playing: true,
        noise: noise,
        env: chebyenv,
        chebylfo: chebylfo,
        chebylfofreq: chebylfofreq,
        gainMult: gainMult,
        noiseGain: noiseGain,
        cheby: cheby,

        trigger: function(syn) {
            syn.env.triggerAttack();
            syn.playing = true;
        },
        release: function(syn) {
            if(syn.playing) {
                syn.env.triggerRelease();
                syn.playing = false;
            }
        },
        dispose: function(syn) {
            
            syn.release(syn);
            window.setTimeout(function() {
                syn.env.dispose();
                syn.noise.dispose();
                syn.chebylfo.dispose();
                syn.chebylfofreq.dispose();
                syn.gainMult.dispose();
                syn.noiseGain.dispose();
                syn.cheby.dispose();
            }, 5000)
            // padSynthsUsed[syn.index] = false;
        }
    };
}

function clearIdsFromTransport(ids) {
    for (let id of ids) {
        // console.log("clearing id: " + id);
        Tone.Transport.clear(id);
    }
}


// StartAudioContext(Tone.context, 'start-stop').then(function(){
//     //callback is invoked when the AudioContext.state is 'running'
//     console.log("Starts audio context");
// });

export { init_tone, newPadSynth, newChebySynth, clearIdsFromTransport,
    requestFMSynth, returnFMSynth, requestNoiseSynth, returnNoiseSynth,
    longverb, noise, noiseEnv, globalSynthLPF, reverb, noiseUsrGain, chorus,
    getNumFreeFMSynths,
};