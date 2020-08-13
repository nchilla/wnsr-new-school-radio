function checks(){
  var nodeToPageTag=document.querySelector('#nodetopage');
  var isSafariTag=document.querySelector('#is-safari');
  var userAgentCheck=document.querySelector('#useragent');


  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

  var uA = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

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
}
window.addEventListener('load',checks);
