

var url='https://rss.art19.com/episodes/038a4b7b-fcd0-4e19-95bc-c0f2c44b9691.mp3';
//i think it's a problem with CORS because this URL below works fine.
//https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
var analyser;
var source;


function liveAudio(url) {
  context=new AudioContext();
  var audiotag=document.querySelector('audio');
  audiotag.crossOrigin="anonymous";
  audiotag.src=url;
  source=context.createMediaElementSource(audiotag);
  analyser=context.createAnalyser();
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 32;

  console.log(context);



  //
  // fetch(url)
  //   .then(response => source=context.createMediaElementSource(response))
  // console.log(context);





}
document.querySelector('body').addEventListener('click',loadit)


// window.addEventListener('load',loadit)


function loadit(){
  if(context==undefined){
    liveAudio(url);
  }else{
    context.resume();
    console.log(context,analyser);
  }
}
