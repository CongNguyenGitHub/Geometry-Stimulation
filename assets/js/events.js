// for events not related to three.js

document.getElementById("reset").addEventListener("click", function() {
    var confirmReset = confirm("Are you sure you want to reset the page?");
    if (confirmReset) {
        location.reload();
    }
});

// translate
var translateButton = document.getElementById("translate");
var translateText = document.getElementById("translate-text");

translateButton.addEventListener("mouseover", function() {
    translateText.style.visibility = "visible";
});

translateButton.addEventListener("mouseout", function() {
    translateText.style.visibility = "hidden";
});
// rotate
var rotateButton = document.getElementById("rotate");
var rotateText = document.getElementById("rotate-text");

rotateButton.addEventListener("mouseover", function() {
    rotateText.style.visibility = "visible";
});

rotateButton.addEventListener("mouseout", function() {
    rotateText.style.visibility = "hidden";
});
//scale
var scaleButton = document.getElementById("scale");
var scaleText = document.getElementById("scale-text");

scaleButton.addEventListener("mouseover", function() {
    scaleText.style.visibility = "visible";
});

scaleButton.addEventListener("mouseout", function() {
    scaleText.style.visibility = "hidden";
});
// translate light
var translateLightButton = document.getElementById("translate-light");
var translateLightText = document.getElementById("translate-light-text");

translateLightButton.addEventListener("mouseover", function() {
    translateLightText.style.visibility = "visible";
});

translateLightButton.addEventListener("mouseout", function() {
    translateLightText.style.visibility = "hidden";
});