(function() {

    var board = new DepartureBoard (document.getElementById ('arr-dep-board'), { rowCount: 2, letterCount: 25 }); 
    var wordList = ['  Arrivals & Departures','Have a Wonderful Journey',['       Welcome  To', '  New York Penn Station']];
    var addData = new Firebase("https://fiery-fire-9725.firebaseio.com/");
    var minutesTillTrain = "";
    var nextTrain = "";
    var trainStatus = "";

    board.setValue (['       Welcome  To', '  New York Penn Station']);

    window.setInterval (function () {
        var newWord = wordList[Math.floor(Math.random() * wordList.length)];
        board.setValue (newWord);
    }, 8000);


    $("#addSchedule").on("click", function(event) {

        var trainname = $("#trainname").val().trim();
        var destination = $("#destination").val().trim();
        var firstraintime = $('#firstraintime').val().trim();
        var freqinmin = $('#freqinmin').val().trim();


        addData.push({
            'trainname': trainname,
            'destination': destination,
            'firstraintime': firstraintime,
            'freqinmin': freqinmin,
            'dateAdded': Firebase.ServerValue.TIMESTAMP // To add timestap as key
        });

        return false;
    });


    addData.orderByChild("dateAdded").on("child_added", 

        function(snapshot) {  // VALUE IS USED WHEN SET AND CHILD_ADDED WHEN YOU PUSH

            var srvftrainname = snapshot.val().trainname;
            var srvfdestination = snapshot.val().destination;
            var srvfirstraintime = snapshot.val().firstraintime;
            var srvfreqinmin = snapshot.val().freqinmin;

            var firstTimeConverted = moment(srvfirstraintime,"hh:mm").subtract(1, "years");
            var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
            var timeRemainder = diffTime % srvfreqinmin;

            minutesTillTrain = srvfreqinmin - timeRemainder;
            nextTrain = moment().add(minutesTillTrain, "minutes").format("hh:mm");

            if ( currentTime = moment().format("hh:mm") >= nextTrain ) {
                trainStatus = "Boarding";
            } else {
                trainStatus = "Ontime";
            }
            

            $(".schedule-table > tbody").append("<tr><td>" + srvftrainname + "</td><td>" + srvfdestination + "</td><td>" + srvfreqinmin + "</td><td>" + nextTrain + "</td><td>" + minutesTillTrain + "</td><td>" + trainStatus + "</td></tr>");

        }, 

        function (errorObject) {

            console.log("The Firbase read failed: " + errorObject.code);
        }
    );

    function currentTime()  {
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
    }
    
})();
