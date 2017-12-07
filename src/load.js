(function() {
var e='script';
var s = document.currentScript;
if (!s) {
  var ss=document.getElementsByTagName(e);
  var i=ss.length;
  while(i--){
    if(ss[i].src.indexOf('/os-load.js')>-1){
      s=ss[i];
      break;
    }
  }
}
var n=document.createElement(e);
n.src=s.src.replace(/(^.*)\/.*?$/,'$1/os-'+(!!window.WebAssembly?'w':'')+'asm.js');
(document.body||document.head).appendChild(n);
})();
