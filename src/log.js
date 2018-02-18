
var Yknk = Yknk || {};

Yknk.log = function (message) {
    var html = Yknk.Utils.convertToHTML(message) + "<br>";
    document.getElementById("debug").innerHTML += html;
};
