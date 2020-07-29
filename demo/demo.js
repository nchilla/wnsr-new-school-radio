//web audio api and visual variables
var ctxAudioTag=document.querySelector('#audiocontext');
var nrmAudioTag=document.querySelector('#normalaudio');
var AudioContext = window.AudioContext || window.webkitAudioContext;
let OfflineAudioContext =window.OfflineAudioContext || window.webkitOfflineAudioContext;
var context;
var statcontext;
var analyser;
var source;
var loopf;
var previous;

//sources
var cors200='https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3';
var cors302='https://d3eqkhna3h1t0b.cloudfront.net';


function startAudio(url){
  connectAudio(url);
  startVisual();
  ctxAudioTag.play();
}

function startAudioWithoutCtx(){
  nrmAudioTag.crossOrigin="anonymous";
  nrmAudioTag.preload="none";
  nrmAudioTag.src=cors302;
  nrmAudioTag.play();
}

function connectAudio(url) {
  console.log('connecting new audio');
  context=new AudioContext();
  ctxAudioTag.crossOrigin="anonymous";
  ctxAudioTag.preload="none";
  ctxAudioTag.src=url;
  source=context.createMediaElementSource(ctxAudioTag);
  analyser=context.createAnalyser();
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.smoothingTimeConstant=0.85
  analyser.fftSize = 16384;
  ctxAudioTag.currentTime=0;
}

function startVisual(){
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  function updateDisplay() {
    loopf=window.requestAnimationFrame(updateDisplay);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray.slice(100,150),-100,100);
  }
  context.resume();
  updateDisplay();
}
var pathcount=0

function draw(arr,min,max){
  pathcount++;
  var sliced=arr
  var mean=d3.mean(sliced);
  sliced[0]=mean;
  sliced[sliced.length-1]=mean;
  var freq=[];
  var vals=[];
  sliced.forEach((item, i) => {
    freq.push({step:i,value:item-mean});
    vals.push(item-mean);
  });
  var xPram=d3.scaleLinear()
    .domain([0,sliced.length-1])
    .range([0, 100]);
  var yPram=d3.scaleLinear()
    .domain([min,max])
    .range([25, 75]);
  var line=d3.line()
  .x(d => xPram(d.step))
  .y(d => 100-yPram(d.value))
  .curve(d3.curveCatmullRom.alpha(0.5));
  if(previous!==freq){
    d3.select('#wave').select('path')
    .datum(freq)
    .attr('d',line);
    previous=freq;
  }
}

document.querySelector('#context200').addEventListener('click',function(){startAudio(cors200);})
document.querySelector('#context302').addEventListener('click',function(){startAudio(cors302);})
document.querySelector('#normal302').addEventListener('click',startAudioWithoutCtx);
