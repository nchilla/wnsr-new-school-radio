function checks(){
  var nodeToPageTag=document.querySelector('#nodetopage');
  var isSafariTag=document.querySelector('#is-safari');
  var userAgentCheck=document.querySelector('#useragent');
  var detailedUserAgentCheck=document.querySelector('#detaileduseragent');d

  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

  var uA = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

  // var detailedUA=(navigator.userAgent.indexOf("Safari") !== -1 )

  //
  // if (navigator.userAgent.indexOf("Safari") !== -1 &&navigator.userAgent.indexOf("Chrome") == -1 &&navigator.userAgent.indexOf("Chromium") == -1) {
  //   console.log("Safari");
  // }else{
  //   console.log("nope");
  // }

  if(typeof window.webkitConvertPointFromNodeToPage === 'function'){
      nodeToPageTag.innerHTML='yes';
  }else{
    nodeToPageTag.innerHTML='no';
  }

  if(isSafari){
    isSafariTag.innerHTML='yes';
  }else{
    isSafariTag.innerHTML='no';
  }
  if(uA){
    userAgentCheck.innerHTML='yes';
  }else{
    userAgentCheck.innerHTML='no';
  }
  if(navigator.userAgent.indexOf("Safari") !== -1 &&navigator.userAgent.indexOf("Chrome") == -1 &&navigator.userAgent.indexOf("Chromium") == -1){
    detailedUserAgentCheck.innerHTML='yes';
  }else{
    detailedUserAgentCheck.innerHTML='no';
  }
}
window.addEventListener('load',checks);
