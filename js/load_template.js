$(document).ready(function () {
    $("<div/>").load("resource/nav_main.html", function (response, status) {
        if (status == "success") {
            $("div#main-content").prepend(response);
        }
    });
})