import test from 'node:test';
import assert from 'node:assert/strict';
import {makeTimer,startTimer,pauseTimer,secondsLeft,clock} from '../src/session-timer.js';
test('timer is optional, pauses without time loss, and uses wall time',()=>{let timer=makeTimer(180);assert.equal(timer.deadline,null);timer=startTimer(timer,1000);assert.equal(secondsLeft(timer,31000),150);timer=pauseTimer(timer,31000);assert.equal(secondsLeft(timer,100000),150);timer=startTimer(timer,100000);assert.equal(secondsLeft(timer,130000),120);});
test('elapsed timer stays at zero and never changes activity state',()=>{const timer=startTimer(makeTimer(300),0);assert.equal(secondsLeft(timer,999999),0);assert.equal(clock(600),'10:00');assert.equal(clock(9),'0:09');});
