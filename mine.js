$(document).ready(function() {
    var table = $('<table>');                       // setup
    table.attr('id', 'tabl');
    var sec = 0;
    var m = 0;
    var found = 0;
    var timer = false;
    var begin = false;
    var scores = [];
    if (localStorage.getItem("scores")) {
        scores = JSON.parse(localStorage.getItem("scores"));
    }

    $('#reset').click(function() {                  // on click
        if (begin) {
            end(false);
        }
        $('#tabl').html('');                        // refresh
        m = 0;
        found = 0;
        begin = true;
        document.getElementById("timer").innerHTML = ("0 min 0 sec");
        timer = setInterval(time, 1000);

        var row = $("#row").val();
        var col = $("#col").val();
        var mines = $("#mines").val();
        if (row < 8) {                              // fix row/column/mine values if they're out of bounds
            row = 8;
        } else if (row > 30) {
            row = 30;
        }
        if (col < 8) {
            col = 8;
        } else if (col > 40) {
            col = 40;
        }
        if (mines < 1) {
            mines = 1;
        } else if (mines > row * col - 1) {
            mines = row * col - 1;
        }

        for (var i = 0; i < row; i++) {             // make table
            var ro = $('<tr>');
            for (var j = 0; j < col; j++) {
                var co = $('<td>');
                co.attr('id', `${i}_${j}`);
                ro.append(co);
            }
            table.append(ro); 
        }
        $("#table").append(table); 

        $('td').click(function(event) {             // click on cell
            var r = $(this).parent().index();
            var c = $(this).index();
            var cell = $(this);
            if (cell.hasClass("clicked")) {
                return 0;
            }
            console.log(cell);

            if (event.shiftKey) {                   // if shift + click:
                if (!cell.hasClass("flag")) {       // uncovered -> flag
                    found++; 
                    cell.addClass("flag");
                    cell.css("background-color", "red");
                } else {
                    found--;                        // flag -> uncovered
                    cell.removeClass("flag");
                    cell.css("background-color", "lightblue");
                }
                updateMines(found);
            } else { 
                if (!cell.hasClass("flag")) {       // can't accidentally click flag
                    cell.addClass("clicked");
                    if (cell.hasClass("hasMine")) {
                        end(false);                 // lose!!
                    } else if (cell.hasClass("hasAdjMine")) {   
                        var adjMines = parseInt(cell.html());
                        var numAdjMarked = findMine(cell, r, c);
                        if (adjMines == numAdjMarked) {
                            reveal(r, c);           // show numbers of adjacent mines
                        }
                    } else { 
                        adjacent(cell, r, c);       // show revealed cells
                        cell.addClass("hasAdjMine");
                        cell.css("background-color", "rgb(227, 246, 252)");
                    }
                }
                if (begin) {
                    if ($(".clicked").length == row * col - mines)  {
                        end(true);                  // win!!
                    }
                }
            }
        });

        putMines(mines); 
        document.getElementById("remaining").innerHTML = ("Mines remaining: " + m);
        document.getElementById("winOrLose").innerHTML = "";
    });
    
    function time() {                               // the timer
        ++sec;
        var mins = Math.floor(sec / 60)
        var seconds = sec - Math.floor(mins * 60);
        document.getElementById("timer").innerHTML = mins + " min " + seconds + " sec";
    }

    function putMines(mines) {                      // put mines randomly
        while (m < mines) {
            var x = Math.floor(Math.random() * (parseInt($("#row").val())));
            var y = parseInt(Math.floor(Math.random() * ($("#col").val())));
            var rand = $('#' + x + '_' + y);
            if (!rand.hasClass("hasMine")) {
                rand.addClass("hasMine");
                m++;
            }
        }
    }

    function findMine(cell, r, c) {
        var n = 0;
        for (var i = 1; i > -2; i--) {
            for (var j = 1; j > -2; j--) {
                var aCell = $('#' + (r - i) + '_' + (c -   j)); 
                if (aCell.hasClass("flag")) {
                    n++;
                }
            }
        }
        return n;
    }
    
    function adjacent(cell, r, c) {
        var minesNearby = 0;
        for (var i = 1; i > -2; i--) {
            for (var j = 1; j > -2; j--) {
                var aCell = $('#' + (r - i) + '_' + (c -   j));
                if (aCell.hasClass("hasMine")) {
                    minesNearby++;
                }
            }
        }

        if (minesNearby != 0) {
            cell.html(minesNearby); 
        } else { 
            reveal(r, c);
        }
    }

    function reveal(r, c) {
        for (var i = 1; i > -2; i--) {
            for (var j = 1; j > -2; j--) {
                if (i == 0 && j == 0) {
                    continue;
                }
                var adjCell = $('#' + (r - i) + '_' + (c - j));
                if (!adjCell.hasClass("clicked")) {
                    adjCell.click();
                }
            }
        }
    }

    function updateMines(n) {
        var remaining = m - n;
        document.getElementById("remaining").innerHTML = "Mines remaining: " + remaining;
    }

    function end(win) {
        begin = false;
        var strWin = " lose.. :(";
        if (win) {                          // high scores and tell the user!
            highScore(sec);
            strWin = " win! :)"
        }
        document.getElementById("winOrLose").innerHTML = "You" + strWin;
        sec = 0;
        clearInterval(timer);
        timer = false;
        $(".hasMine").css("background-color", "black");
        m = 0;                              // reveal the mines
    }
    
    function highScore(totalTime) {         // high score list
        scores.push(totalTime);
        scores.sort(function(x, y) {
            return x - y
        });
        localStorage.setItem("scores", JSON.stringify(scores));
        var scoreList = $("#highscore ol");
        scoreList.empty();
        var numScores = Math.min(scores.length, 10);
        for (var i = 0; i < numScores; i++) {
            var item = $("<li>");
            console.log(typeof scores[i] + ", " + scores[i]);
            item.append(scores[i]);
            item.append(" seconds");
            scoreList.append(item);
        }
    }
});