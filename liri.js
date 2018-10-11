require("dotenv").config();

var getKeys = require('./keys.js');

//*****************************************************************************************************************/
// Interpret command line input 
//*****************************************************************************************************************/
var command = process.argv[2];
var parmString = process.argv[3];
for (i = 4; i < process.argv.length; i++) {
    parmString += " " + process.argv[i];
}
var parm = "\'" + parmString + "\'";

function processConcert(input) {
    var request = require("request");
    var moment = require("moment");
    var appID = getKeys.bit.id;
    var artistTrimmed = input.substring(1, input.length - 1);
    var queryUrl = "https://rest.bandsintown.com/artists/" + artistTrimmed + "/events?app_id=" + appID;

    request(queryUrl, function (error, response, concert) {
        if (error) {
            return console.log('Error occurred: ' + error);
        }
        if (!error && response.statusCode === 200) {
            for (key in JSON.parse(concert)) {
                var listedDT = JSON.parse(concert)[key].datetime.split("T");
                var convertedDT = moment(listedDT[0]).format("MM/DD/YYYY");
                console.log("\n");
                console.log("================================================================================");
                console.log(JSON.parse(concert)[key].venue.name);
                console.log(JSON.parse(concert)[key].venue.city + ", " + JSON.parse(concert)[key].venue.region + "  " + JSON.parse(concert)[key].venue.country);
                console.log(convertedDT);
                console.log("================================================================================");
            }
        }
    });
}

function processMusic(input) {
    var Spotify = require('node-spotify-api');
    var spotify = new Spotify({
        id: getKeys.spotify.id,
        secret: getKeys.spotify.secret
    });

    spotify.search({ type: 'track', limit: '1', query: input }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        var totalItems = data.tracks.total;
        if (totalItems != 0) {
            var spotifyReturn = {
                artist: data.tracks.items[0].album.artists[0].name,
                album: data.tracks.items[0].album.name,
                songName: data.tracks.items[0].name,
                preview: data.tracks.items[0].preview_url
            }

            if (spotifyReturn.artist === null) {
                spotifyReturn.artist = "Artist:  No artist info available"
            }
            if (spotifyReturn.album === null) {
                spotifyReturn.album = "Album:  No album info available"
            }
            if (spotifyReturn.songName === null) {
                spotifyReturn.songName = "Song Title:  No song name info available"
            }
            if (spotifyReturn.preview === null) {
                spotifyReturn.preview = "Song Preview:  No preview URL available"
            }
            console.log("\n");
            console.log("================================================================================");
            console.log(`Artist:        ${spotifyReturn.artist}`);
            console.log(`Album:         ${spotifyReturn.album}`);
            console.log(`Song Title :   ${spotifyReturn.songName}`);
            console.log(`Song Preview:  ${spotifyReturn.preview}`);
            console.log("================================================================================");
        }
        else {
            var spotifyReturn = {
                artist: "Ace of Base",
                album: "The Sign (US Album) [Remastered]",
                songName: "The Sign",
                preview: "https://p.scdn.co/mp3-preview/4c463359f67dd3546db7294d236dd0ae991882ff?cid=3b1f35a1ffd04e5a9e9b2b90a9ff77cc"
            }
            console.log("\n");
            console.log("================================================================================");
            console.log(`Artist:        ${spotifyReturn.artist}`);
            console.log(`Album:         ${spotifyReturn.album}`);
            console.log(`Song Title :   ${spotifyReturn.songName}`);
            console.log(`Song Preview:  ${spotifyReturn.preview}`);
            console.log("================================================================================");
        }
    });
}

function processMovie(input) {
    var request = require("request");
    var apiKey = getKeys.omdb.key;
    var queryUrl = "http://www.omdbapi.com/?t=" + input + "&apikey=" + apiKey;
    console.log(queryUrl);

    request(queryUrl, function (error, response, movie) {
        if (error) {
            return console.log('Error occurred: ' + error);
        }
        if (!error && response.statusCode === 200) {
            var movieTitle = JSON.parse(movie).Title;
            var movieReleaseYear = JSON.parse(movie).Year;
            var movieIMDBRating = JSON.parse(movie).Ratings[0].Value;
            var movieTomatoesRating = JSON.parse(movie).Ratings[1].Value;
            var movieProdCountry = JSON.parse(movie).Country;
            var movieLanguage = JSON.parse(movie).Language;
            var moviePlot = JSON.parse(movie).Plot;
            var movieActors = JSON.parse(movie).Actors;

            console.log("\n");
            console.log("================================================================================");
            console.log(`Title:                   ${movieTitle}`);
            console.log(`Year:                    ${movieReleaseYear}`);
            console.log(`Country:                 ${movieProdCountry}`);
            console.log(`Language:                ${movieLanguage}`);
            console.log(`IMDB Rating:             ${movieIMDBRating}`);
            console.log(`Rotten Tomatoes Rating:  ${movieTomatoesRating}`);
            console.log(`Actors:                  ${movieActors}`);
            console.log(`Plot:                    ${moviePlot}`);
            console.log("================================================================================");
        }
    });
}

function processFile() {
    var fs = require("fs");
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var contents = data.split(",");
        if (contents[0] === "concert-this") {
            processConcert(contents[1]);
        }
        if (contents[0] === "spotify-this-song") {
            processMusic(contents[1]);
        }
        if (contents[0] === "movie-this") {
            processMovie(contents[1]);
        }
    });
}


//*****************************************************************************************************************/
// Process request for concert info 
//*****************************************************************************************************************/
if (command === "concert-this") {
    processConcert(parm);
}

//*****************************************************************************************************************/
// Process request for song info 
//*****************************************************************************************************************/
if (command === "spotify-this-song") {
    processMusic(parm);
}

//*****************************************************************************************************************/
// Process request for movie info 
//*****************************************************************************************************************/
if (command === "movie-this") {
    processMovie(parm);
}

//*****************************************************************************************************************/
// Process input from file 
//*****************************************************************************************************************/
if (command === "do-what-it-says") {
    processFile();
}
