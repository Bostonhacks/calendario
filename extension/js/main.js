var button = document.getElementById("button");
var loader = document.getElementById("loader");

function getImg() {
	var result = null;
	Array.from(document.getElementsByTagName("img")).filter(function(el) {
	    result = el.getAttribute("src").indexOf("ScheduleImageServlet") != -1 ? el : null;
	});
    return result.getAttribute("src");
}

document.getElementById("import").addEventListener("click", function(){
	chrome.tabs.executeScript({
        code: '(' + getImg + ')();'
    }, (results) => {
    	var string = results[0];
    	if (string) {
			document.body.style.backgroundColor = "#BD3649"
			button.style.display = "none";
			loader.style.display = "block";
    	} else {
    		alert("No schedule image found on this page! Please try again!");
    	}
    });
})