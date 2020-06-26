

var url='https://wnsr-cors.herokuapp.com/https://rss.art19.com/episodes/72a3bc7e-118a-4171-8be4-125913860ef7.mp3';
var audiotag=document.querySelector('audio');
var AudioContext = window.AudioContext || window.webkitAudioContext;
let OfflineAudioContext =window.OfflineAudioContext || window.webkitOfflineAudioContext;
var context;
var statcontext;
var analyser;
var source;
var loopf;




function connectAudio(url) {
  context=new AudioContext();
  // context.createGain();
  console.log(context);
  audiotag.crossOrigin="anonymous";
  audiotag.preload="auto";
  audiotag.src=url;
  source=context.createMediaElementSource(audiotag);
  analyser=context.createAnalyser();
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.smoothingTimeConstant=0.85
  analyser.fftSize = 16384;
  // startVisual();
}
function startVisual(){
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  function updateDisplay() {
    loopf=requestAnimationFrame(updateDisplay);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray.slice(100,150),-100,100);

  }

    // context.resume();
  context.resume();
  updateDisplay();
  audiotag.play();
}

function draw(arr,min,max){
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
  d3.select('#radio')
  .datum(freq)
  .attr('d',line);
}

var started=0
function starter(){
  if(started==0){
    started++
    startVisual()
  }else{
    audiotag.currentTime=audiotag.currentTime+20;
  }
}



document.querySelector('div').addEventListener('click',starter)

window.addEventListener('load',loadit)
function loadit(){
  // console.log(context)
  if(context==undefined){
    // staticData()
    connectAudio(url);
  }
}


// function staticData(){
//   statcontext=new OfflineAudioContext(2,44100*40,44100);
//   let currentBuffer = null;
//   fetch(url)
//     .then(response => response.arrayBuffer())
//     .then(arrayBuffer => statcontext.decodeAudioData(arrayBuffer))
//     .then(audioBuffer => use(audioBuffer));
//
//   function use(data){
//     console.log(data);
//     chan0=data.getChannelData(0);
//     var divisions=30
//     var segment=Math.floor(chan0.length / divisions);
//     console.log(segment)
//     var means=[];
//     for(var i=0; i<divisions-1;i++){
//       var start=i*segment;
//       var split=chan0.slice(start,start+segment);
//       means.push(d3.mean(split));
//       // console.log(split);
//     }
//     const multiply = Math.pow(Math.max(...means), -1);
//     means=means.map(n => n * multiply);
//     console.log(means);
//     draw(means,-2,2);
//   }
// }
