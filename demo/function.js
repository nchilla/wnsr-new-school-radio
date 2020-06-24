

var url='https://rss.art19.com/episodes/64073b11-e56b-4fd2-8e3d-76d6a234db34.mp3';
var audiotag=document.querySelector('audio');
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
var statcontext;
var analyser;
var source;
var loopf;
function connectAudio(url) {
  context=new AudioContext();
  audiotag.crossOrigin="anonymous";
  audiotag.src=url;
  source=context.createMediaElementSource(audiotag);
  analyser=context.createAnalyser();
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 16384;
  // startVisual();
}
function startVisual(){
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  function updateDisplay() {
    loopf=requestAnimationFrame(updateDisplay);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray);

  }
  context.resume();
  audiotag.play();
  updateDisplay();
}

function staticData(){
  statcontext=new AudioContext();
  let currentBuffer = null;
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => statcontext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => use(audioBuffer));

  function use(data){
    console.log(data);
  }

}

function draw(arr){
  //the FTT array has thousands of frequencies, I'm apparently only going to use a small segment
  var sliced=arr.slice(100,150);
  var mean=d3.mean(sliced);
  sliced[0]=mean;
  sliced[sliced.length-1]=mean;
  var freq=[];
  var vals=[];
  sliced.forEach((item, i) => {
    freq.push({step:i,value:item-mean});
    vals.push(item-mean);
  });
  var max=d3.max(vals);
  var min=d3.min(vals);

  var xPram=d3.scaleLinear()
    .domain([0,sliced.length-1])
    .range([0, 100]);
  var yPram=d3.scaleLinear()
    .domain([-100,100])
    .range([25, 75]);
  var line=d3.line()
  .x(d => xPram(d.step))
  .y(d => 100-yPram(d.value))
  .curve(d3.curveCatmullRom.alpha(0.5));
  d3.select('#radio')
  .datum(freq)
  .attr('d',line);
}



document.querySelector('body').addEventListener('click',startVisual)


window.addEventListener('load',loadit)
function loadit(){
  console.log(context)
  if(context==undefined){
    staticData()
    connectAudio(url);
  }
}
