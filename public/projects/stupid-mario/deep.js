'use strict';
/* global nes, console, Perceptron, $ */

// Figure out 'mario stuck at pipe' scenario

var PLAYER_STATE = 0x000E;
var GAME_MODE = 0x0770;
var PLAYER_VERTICAL_POSITION = 0x00B5;
var PLAYER_HORIZONTAL_POSITION = 0x0086;

var DEAD = 0x0B;
var START = 13;
var JUMP = 88;
//var RUN = 90;
var RIGHT = 39;

var DEMO = 0;
var GAME_OVER = 3;

var r, g, b, state, lastState, frame, lastFrame, gameState, gamePlayInterval, gameStateInterval;

var net = new Perceptron();

var marioData = [];
for(var i = 0; i < 1000; i++){
    marioData[i] = 0;
}

function getFrame() {
    return nes.ppu.buffer.map(function(pixel) {
        r = pixel & 0xFF;
        g = (pixel >> 8) & 0xFF;
        b = (pixel >> 16) & 0xFF;
        return (0.3 * r + 0.6 * g + 0.1 * b) / 255.0;
    });
}

function fellDownPit() {
    return nes.cpu.mem[PLAYER_VERTICAL_POSITION] === 5;
}

function handleGameplay() {
    //console.log(nes.cpu.mem[PLAYER_HORIZONTAL_POSITION]);
    var playerX = nes.cpu.mem[PLAYER_HORIZONTAL_POSITION];
    gameState = nes.cpu.mem[GAME_MODE];
    if (gameState === GAME_OVER || gameState === DEMO) {
        clearInterval(gamePlayInterval);
        nes.keyboard.releaseKey(RIGHT);
        waitForRestart();
    }
    state = nes.cpu.mem[PLAYER_STATE];
    frame = getFrame();
    if (state !== DEAD) {
        var jumpFeeling = net.perceive(frame);
        if (jumpFeeling > 0.8) {
            nes.keyboard.autoKey(JUMP, 800);
        }
    }
    // Check stuck condition using the horizontal position
    if (lastState !== DEAD && (state === DEAD || fellDownPit())) {
        net.train(lastFrame, 1);
        while (!net.retrain()) {}
        marioData[playerX]++;
        //console.log(marioData);
        $('.sparkline').sparkline(marioData, {
            type: 'line',
            height: '100',
            barWidth: 20,
            barSpacing: 10,
            barColor: '#615c5a',
            nullColor: '#3366cc '
        });
    }
    lastState = state;
    lastFrame = frame;
}

$(document).ready(function() {
    $('.sparkline').sparkline(marioData, {
        type: 'line',
        height: '100',
        barWidth: 20,
        barSpacing: 10,
        barColor: '#615c5a',
        nullColor: '#3366cc '
    });
});

function go() {
    console.log('Started Mario Training');
    net.train(getFrame(), 0);
    while (!net.retrain()) {}
    console.log('Initial training done');
    waitForRestart();
}

function waitForRestart() {
    gameStateInterval = setInterval(function() {
        gameState = nes.cpu.mem[GAME_MODE];
        if (gameState === DEMO) {
            clearInterval(gameStateInterval);
            console.log('Restarting game');
            nes.keyboard.autoKey(START);
            setTimeout(function() {
                //startRunning();
                nes.keyboard.holdKey(RIGHT);
                gamePlayInterval = setInterval(handleGameplay, 100);
            }, 1000);
        }
    }, 500);
}