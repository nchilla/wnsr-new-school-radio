

var url='https://rss.art19.com/episodes/038a4b7b-fcd0-4e19-95bc-c0f2c44b9691.mp3';
//i think it's a problem with CORS because this URL below works fine.
//https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3
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
  analyser.fftSize = 16384;
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
  // console.log(arr)
  //the FTT array has thousands of frequencies, I'm apparently only going to use a small segment
  var sliced=arr.slice(100,200);
  var max=d3.max(sliced);
  console.log(max)
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
  .y(d => 100-yPram(d.value));
  d3.select('#radio')
  .datum(freq)
  .attr('d',line);







  // var w=window.innerWidth;
  // var h=window.innerHeight;
  // var canvastag=document.querySelector('canvas');
  // var dpr = window.devicePixelRatio || 1;
  // var ctx=canvastag.getContext('2d');
  // ctx.scale(dpr,dpr)
  // canvastag.width=w;
  // canvastag.height=h;
  // // ctx.fillRect(0, 0, 896, 742);
  // ctx.beginPath();
  // ctx.moveTo(0,0);
  // ctx.lineTo(w, h/2);
  // ctx.lineTo(0, h);
  // ctx.stroke();
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
