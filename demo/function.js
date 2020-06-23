

var url='https://rss.art19.com/episodes/038a4b7b-fcd0-4e19-95bc-c0f2c44b9691.mp3';
var audiotag=document.querySelector('audio');
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
var analyser;
var source;
var loopf;
function liveAudio(url) {
  context=new AudioContext();
  audiotag.crossOrigin="anonymous";
  audiotag.src=url;
  source=context.createMediaElementSource(audiotag);
  analyser=context.createAnalyser();
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 32;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  function updateDisplay() {
    loopf=requestAnimationFrame(updateDisplay);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray);

  }
  audiotag.play();
  updateDisplay();
}


function draw(arr){
  var sliced=arr.slice(0,20);
  var max=d3.max(sliced);
  // console.log(max)
  var xPram=d3.scaleLinear()
    .domain([0,sliced.length-1])
    .range([0, 100]);
  var yPram=d3.scaleLinear()
    .domain([0,max])
    .range([0, 99]);
  var freq=[];
  sliced.forEach((item, i) => {
    freq.push({step:i,value:item});
  });

  var line=d3.line()
  .x(d => xPram(d.step))
  .y(d => 100-yPram(d.value))
  .curve(d3.curveCatmullRom.alpha(0.5));
  d3.select('#radio')
  .datum(freq)
  .attr('d',line);
}






document.querySelector('body').addEventListener('click',loadit)
function loadit(){
  if(context==undefined){
    liveAudio(url);
  }else{
    audiotag.play();
    console.log(context,analyser);
  }
}
