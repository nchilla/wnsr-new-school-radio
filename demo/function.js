
var url='https://rss.art19.com/episodes/038a4b7b-fcd0-4e19-95bc-c0f2c44b9691.mp3';



function liveAudio(url) {
  var audiotag=document.querySelector('audio');
  audiotag.src=url;
  var context=new (window.AudioContext || window.webkitAudioContext)();
  var source=context.createMediaElementSource(audiotag);
  console.log(context);

  //
  // fetch(url)
  //   .then(response => source=context.createMediaElementSource(response))
  // console.log(context);
  // var analyser=context.createAnalyser();
  // source.connect(analyser);
  // analyser.connect(context.destination);


  // analyser.fftSize = 32;

}

window.addEventListener('load',loadit)

function loadit(){
  liveAudio(url);
}
