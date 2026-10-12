// Memory-only caregiver timer. Expiry never advances a task or restricts AAC.
export function makeTimer(seconds=180){return {seconds,remaining:seconds,deadline:null};}
export function secondsLeft(timer,now=Date.now()){return timer.deadline===null?timer.remaining:Math.max(0,Math.ceil((timer.deadline-now)/1000));}
export function pauseTimer(timer,now=Date.now()){return {...timer,remaining:secondsLeft(timer,now),deadline:null};}
export function startTimer(timer,now=Date.now()){return {...timer,deadline:now+timer.remaining*1000};}
export function clock(seconds){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
