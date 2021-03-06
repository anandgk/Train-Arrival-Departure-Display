(function() {

    // Variable declaration
    var board = new DepartureBoard (document.getElementById ('arr-dep-board'), { rowCount: 2, letterCount: 25 }); 
    var wordList = ['  Arrivals & Departures',['Have a', '        Wonderful Journey'],['       Welcome  To', '  New York Penn Station']];
    var addData = new Firebase("https://fiery-fire-9725.firebaseio.com/");
    

    // Intial message display
    board.setValue (['       Welcome  To', '  New York Penn Station']);

    // Messages are randomly selected from array every 8 seconds and displayed
    window.setInterval (function () {
        var newWord = wordList[Math.floor(Math.random() * wordList.length)];
        board.setValue (newWord);
    }, 8000);

    // When button is clicked to add new schedule
    $("#addSchedule").on("click", function(event) {

        var trainname = $("#trainname").val().trim();
        var destination = $("#destination").val().trim();
        var firstraintime = $('#firstraintime').val().trim();
        var freqinmin = $('#freqinmin').val().trim();

        // Get values from form and push to firebase
        addData.push({
            'trainname': trainname,
            'destination': destination,
            'firstraintime': firstraintime,
            'freqinmin': freqinmin,
            'dateAdded': Firebase.ServerValue.TIMESTAMP // To add timestap as key
        });

        // Return false so as not to referesh the page
        return false;
    });

    // Response from firebase when new record is added
    addData.orderByChild("dateAdded").on("child_added", 

        function(snapshot) {  // When a new record is added

            // Get values from snapshot
            var srvftrainname = snapshot.val().trainname;
            var srvfdestination = snapshot.val().destination;
            var srvfirstraintime = snapshot.val().firstraintime;
            var srvfreqinmin = snapshot.val().freqinmin;

            // Calculation for determinging minutes until next train and time in HH:MM of next train
            var firstTimeConverted = moment(srvfirstraintime,"hh:mm").subtract(1, "years");
            var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
            var timeRemainder = diffTime % srvfreqinmin;

            // Minutes for next train arrival
            var minutesTillTrain = srvfreqinmin - timeRemainder;

            // Time in HH:MM for next train arrival
            var nextTrain = moment().add(minutesTillTrain, "minutes").format("hh:mm");

            // Display status
            var trainStatus = "Ontime";
            
            // Display the schdules in table
            $(".schedule-table > tbody").append("<tr><td>" + srvftrainname + "</td><td>" + srvfdestination + "</td><td>" + srvfreqinmin + "</td><td>" + nextTrain + "</td><td>" + minutesTillTrain + "</td><td>" + trainStatus + "</td></tr>");

        }, 

        function (errorObject) { // When exception is thrown by firebase

            console.log("The Firbase read failed: " + errorObject.code);
        }
    );

    // Refresh schedules every 20 seconds
    window.setInterval (function () {
        addData.orderByChild("dateAdded").on("value", function(snapshot) {

            // Empty data rows from schedule table
            $(".schedule-table > tbody").empty();

            
            // Loop Firebase objects
            snapshot.forEach(function(data) {
                
                // Get values from snapshot
                var srvftrainname = data.val().trainname;
                var srvfdestination = data.val().destination;
                var srvfirstraintime = data.val().firstraintime;
                var srvfreqinmin = data.val().freqinmin;
                var trainStatus = "";

                // Calculation for determinging minutes until next train and time in HH:MM of next train
                var firstTimeConverted = moment(srvfirstraintime,"hh:mm").subtract(1, "years");
                var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
                var timeRemainder = diffTime % srvfreqinmin;

                // Minutes for next train arrival
                var minutesTillTrain = srvfreqinmin - timeRemainder;

                // If minutes to train arrival is <= 1 then show status as boarding otherwise ontime
                if ( minutesTillTrain <= 1 )  {
                    trainStatus = "Boarding";
                } else {
                    trainStatus = "Ontime";
                }

                // Time in HH:MM for next train arrival
                var nextTrain = moment().add(minutesTillTrain, "minutes").format("hh:mm");

                
                // Display the schdules in table
                $(".schedule-table > tbody").append("<tr><td>" + srvftrainname + "</td><td>" + srvfdestination + "</td><td>" + srvfreqinmin + "</td><td>" + nextTrain + "</td><td>" + minutesTillTrain + "</td><td>" + trainStatus + "</td></tr>");

            });
        });
    }, 20000);
    
})();
