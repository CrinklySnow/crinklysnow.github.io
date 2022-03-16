$(document).ready(function() {
	
	function ls(item, def) {
		return JSON.parse(window.localStorage.getItem(item)) || def;
	}
	
	
	
	var words = ["arkzz", "moses", "baldy", "churr"];
	
	var startDate = new Date("Mar 16 2022 02:56:50");
	var endDate = new Date();
	
	var diffTime = Math.abs(endDate - startDate);
	var index = Math.floor(diffTime / 86400000) % words.length;
	var indexUnmodded = Math.floor(diffTime / 86400000) + 1;
	
	
	var word = words[index];
	
	if (word != ls("word", "")) {
		console.log(word + " NOT " + ls("word", ""));
		window.localStorage.clear();
		window.localStorage.setItem("word", JSON.stringify(word));
	}
	
	var ended = ls("ended", false);
	var guess = "";
	var gaps = [9, 18];
	var currentRow = 0;
	var guesses = ls("guesses", []);
	
	var states = [];
	
	var qwerty = "qwertyuiopasdfghjklzxcvbnm";
	
	for (var i = 0; i < 26; i++) {
		var t = $('<button class="key" display="inline-block">' + qwerty.charAt(i) + '</button>');
		$("#keyboard").append(t);
		
		if (gaps.indexOf(i) > -1) {
			$("#keyboard").append($("<br/>"));
		}
	}
	
	function loadGuesses() {
		for (const g of guesses) {
			for (var i = 0; i < g.length; i++) {
				$("#game td").eq(currentRow * 5 + i).text(g.charAt(i));
			}
			
			validateWord(g);
			currentRow++;
		}
	}
	
	loadGuesses();
	
	
	
	$('<button id="enter-button" display="inline-block">Enter</button>').insertBefore("#keyboard button:eq(19)");
	$('#keyboard').append('<button id="back-button" display="inline-block"><--</button>');
	
	$(document).on('keydown', function(key) {
		
		if (key.which == 13 && guess.length == 5) {
			$("#enter-button").addClass('pressed');
			window.setTimeout(() => $("#enter-button").removeClass('pressed'), 100);
			
			if (guess.length == 5) {
				window.localStorage.setItem("date", JSON.stringify(endDate));
				guesses.push(guess);
				window.localStorage.setItem("guesses", JSON.stringify(guesses));
				
				if (validateWord(guess) == 5) {
					$(document).off('keydown');
					ended = true;
					window.localStorage.setItem("ended", true);
					return;
				}
				
				currentRow++;
				guess = "";
				}
			}
			else if (key.which == 8 && guess.length > 0) {
				$("#back-button").addClass('pressed');
			window.setTimeout(() => $("#back-button").removeClass('pressed'), 100);
			
			guess = guess.substring(0, guess.length-1);
			$("#game td").eq(currentRow * 5 + guess.length).text("");
		}
		
		var regex = /^[A-Za-z]+$/;
		var isValid = regex.test(String.fromCharCode(key.which));
		
        if (!isValid || guess.length == 5) {
			return;
		}
		
		var key = String.fromCharCode(key.which);
		
		$("#game td").eq(currentRow * 5 + guess.length).text(key);
		guess += key;
		
		$(".key").each(function() {
			if ($(this).text().toUpperCase() == key) {
				$(this).addClass('pressed');
				window.setTimeout(() => $(this).removeClass('pressed'), 100);
			}
		});
		
		
	});
	
	function occurances(str, chr) {
		return str.toLowerCase().split(chr.toLowerCase()).length - 1;
	}
	
	function validateWord(guess) {
		var correct = "";
		var permitted = "";
		
		for (var i = 0; i < 5; i++) {
			var elm = $("#game td").eq(currentRow * 5 + i);
			
			if (elm.text().toLowerCase() == word.charAt(i)) {
				elm.addClass("correct");
				correct += elm.text().toLowerCase();
				
				$(".key").each(function() {
					if ($(this).text().toLowerCase() == elm.text().toLowerCase()) {
						$(this).addClass("correct");
						return false; //Break
					}
				});
			}
		}
		
		
		
		for (var i = 0; i < 5; i++) {
			var elm = $("#game td").eq(currentRow * 5 + i);
			
			if (elm.text().toLowerCase() == word.charAt(i)) {
				continue;
			}
			else {
				if (occurances(correct, elm.text()) >= occurances(word, elm.text()) - occurances(permitted, elm.text())) {
					
					
					elm.addClass("wrong");
					$(".key").each(function() {
						if ($(this).text().toLowerCase() == elm.text().toLowerCase()) {
							$(this).addClass("wrong");
							return false; //Break
						}
					});
				}
				else {
					elm.addClass("placed-wrong");
					permitted += elm.text();
					
					$(".key").each(function() {
						///if ($(this).hasClass("correct")) {
						///	return true;
						///}
						
						if ($(this).text().toLowerCase() == elm.text().toLowerCase()) {
							$(this).addClass("placed-wrong");
							return false; //Break
						}
					});
				}
			}
		}
		
		return correct.length;
	}
	
	$(".key").on("click", function(key) {
		var regex = /^[A-Za-z]+$/;
		var isValid = regex.test($(this).text().toUpperCase());
		
        if (!isValid || guess.length == 5) {
			return;
		}
		
		var e = $.Event('keydown');
		e.which = $(this).text().toUpperCase().charCodeAt(0);
		$(document).trigger(e);
	});
	
	$("#enter-button").on("click", function() {
		var e = $.Event('keydown');
		e.which = 13;
		$(document).trigger(e);
	});
	
	$("#back-button").on("click", function() {
		var e = $.Event('keydown');
		e.which = 8;
		$(document).trigger(e);
	});
	
	//Copying text to clipboard from: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
	function fallbackCopyTextToClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		
		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";
		
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
		}
		catch (err) {
		}
		
		document.body.removeChild(textArea);
	}
	
	function copyTextToClipboard(text) {
		if (!navigator.clipboard) {
			fallbackCopyTextToClipboard(text);
			return;
		}
		navigator.clipboard.writeText(text).then(function() {
			}, function(err) {
		});
	}
	
	function generateShareText() {
		var squares = {
			'correct': '🟩',
			'placed-wrong': '🟨',
			'wrong': '⬛'
		}
		
		console.log("CURRENT ROW: " + currentRow);
		
		var output = "Yozukle " + indexUnmodded + ", " + (currentRow) + "/6 \n\n";
		var i = 0;
		
		$("#game td").each(function() {
			if ($(this).hasClass("correct")) {
				output += squares['correct'];
			}
			else if ($(this).hasClass('placed-wrong')) {
				output += squares['placed-wrong'];
			}
			else if ($(this).hasClass('wrong')) {
				output += squares['wrong'];
			}
			
			i++;
			
			if (i % 5 == 0) {
				output += "\n";
			}
		});
		
		return output;
	}
	
	document.querySelector("#share").addEventListener('click', function(event) {
		copyTextToClipboard(generateShareText());
	});
	//copyText.type = 'hidden';
	
	//The following was taken from Stackoverflow because I'm lazy like that
	
	Date.prototype.addDays = function(days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	}
	
	var countDownDate = endDate;
	countDownDate.setHours(21);
	countDownDate.setMinutes(0);
	countDownDate.setSeconds(0);
	
	var x = setInterval(function() {
		
		// Get today's date and time
		var now = new Date().getTime();
		
		// Find the distance between now and the count down date
		var distance = countDownDate - now;
		
		// Time calculations for days, hours, minutes and seconds
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		
		// Display the result in the element with id="demo"
		document.getElementById("timer").innerHTML = ("" + hours).padStart(2, '0') + ":"
		+ ("" + minutes).padStart(2, '0') + ":" + ("" + seconds).padStart(2, '0');
		
		// If the count down is finished, write some text
		if (distance < 0) {
			countDownDate = endDate.addDays(1);
			countDownDate.setHours(21);
			countDownDate.setMinutes(0);
			countDownDate.setSeconds(0);
			
		}
	}, 1000);
});
