
document.getElementById("reset").addEventListener("click", function() {
    var confirmReset = confirm("Are you sure you want to reset the page?");
    if (confirmReset) {
        location.reload();
    }
});


