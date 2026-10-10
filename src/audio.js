import {englishVoice,playableClip,MAX_CLIP_BYTES} from './domain.js';
import {encode64,decode64} from './crypto.js';
let activeAudio=null,activeURL=null,recorder=null,stream=null,timer=null,pending=false,generation=0,cancelPlayback=null;
export function stopPlayback() { cancelPlayback?.();cancelPlayback=null;speechSynthesisSafe()?.cancel(); if(activeAudio)activeAudio.pause(); if(activeURL)URL.revokeObjectURL(activeURL);activeAudio=null;activeURL=null; }
function speechSynthesisSafe(){return globalThis.speechSynthesis;}
export async function playBlob(clip) {
 stopPlayback();const url=URL.createObjectURL(new Blob([decode64(clip.base64)],{type:clip.mime}));
 activeURL=url;const audio=new Audio(url);activeAudio=audio;
 return new Promise((resolve,reject)=>{
 const cleanup=()=>{URL.revokeObjectURL(url);if(activeAudio===audio){activeAudio=null;activeURL=null;cancelPlayback=null;}};
 cancelPlayback=()=>{audio.pause();cleanup();resolve(false);};
 audio.onended=()=>{cleanup();resolve(true);};audio.onerror=()=>{cleanup();reject(Error('AUDIO_FAILED'));};
 audio.play().catch(error=>{cleanup();reject(error);});
 });
}
export async function speakCard(card,locale,data,pack=[]) {
 stopPlayback();const clip=playableClip(data?.clips,locale,card.id);
 if(clip)return playBlob(clip);
 const reviewed=pack.find(v=>v.locale===locale&&v.cardId===card.id&&v.status==='approved');
 if(reviewed){const a=new Audio(reviewed.path);activeAudio=a;await a.play();return true;}
 if(locale!=='en-US'||!data?.settings.tts||!speechSynthesisSafe())return false;
 const voice=englishVoice(speechSynthesis.getVoices());if(!voice)return false;
 const utterance=new SpeechSynthesisUtterance(card.labels['en-US']);utterance.voice=voice;utterance.lang='en-US';utterance.rate=.85;
 return new Promise(resolve=>{utterance.onend=()=>resolve(true);utterance.onerror=()=>resolve(false);speechSynthesis.speak(utterance);});
}
export function cancelRecording() {generation++;pending=false;if(timer)clearTimeout(timer);timer=null;if(recorder){recorder.onstop=null;if(recorder.state!=='inactive')recorder.stop();}stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;}
export function finishRecording(){if(recorder?.state==='recording')recorder.stop();}
export async function recordClip(onReady,onStarted,onError) {
 if(pending||recorder)throw Error('RECORDING_BUSY');
 if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder)throw Error('MIC_UNAVAILABLE');
 pending=true;const ticket=++generation;
 try{
 const incoming=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true},video:false});
 if(ticket!==generation){incoming.getTracks().forEach(t=>t.stop());return;}
 stream=incoming;pending=false;
 const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(m=>MediaRecorder.isTypeSupported(m));
 const rec=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);recorder=rec;const chunks=[];let size=0;
 rec.ondataavailable=e=>{size+=e.data.size;chunks.push(e.data);if(size>MAX_CLIP_BYTES&&rec.state==='recording')rec.stop();};
 rec.onerror=()=>{cancelRecording();onError('micFail');};
 rec.onstop=async()=>{clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;
 try {if(ticket!==generation)return;if(size>MAX_CLIP_BYTES){onError('recordLimit');return;}const b=new Blob(chunks,{type:rec.mimeType});if(!b.size){onError('micFail');return;}const bytes=await b.arrayBuffer();if(ticket===generation)await onReady({base64:encode64(bytes),mime:b.type,status:'draft',recordedAt:new Date().toISOString(),reviewedAt:null});}catch{onError('saveFail');}};
 rec.start(250);timer=setTimeout(finishRecording,10000);onStarted();
 }catch(e){cancelRecording();throw e;}
}
