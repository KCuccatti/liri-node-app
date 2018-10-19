//************************************************************************
//liri.js
//
// Additional functionality was added, such that when a user does not 
// enter the correct arguements, the usage will be displayed.
// If the user enteres the correct arguments, but for example enters no
// particular song name, or movie name, default song/movie will be used.
// Can also choose to have data displayed in file and/or terminal.
//
//************************************************************************

// Import neccessary packages for use with their functionalities
const dotenv = require('dotenv').config();
const request = require("request");
const moment = require("moment");
const Spotify = require('node-spotify-api');
const fs = require('fs');
const readLine = require('readline');

// Store property values in variables
const bandsInTownAPIKey = process.env.BANDSINTOWN_API;
const spotifyId = process.env.SPOTIFY_ID;
const spotifySecret = process.env.SPOTIFY_SECRET;
const movieAPI = process.env.OMBD_API;

// List of valid commands liri.js can process
const validCommands = ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"];

const CRLF = "\n";

// Defaults
const defaultMovieName = "Mr. Nobody";
const defaultSongName = "What's My Age Again";

const terminal = "N" // Set to N to disable terminal output
const fileOutput = "Y" // Set to N to disable file output

const logFileName = "log.txt";

const INVALID_COMMAND = 'You have entered an invalid command.' + CRLF;

const BAND_NAME_PROMPT = "Please provide an artist/band name";

const DEFAULT_SONG_MSG = "No song entered, defaulting...";

const DEFAULT_MOVIE_MSG = "No movie entered, defaulting...";

const NO_BAND_DATA_FOUND_MSG = "Either the spelling of the band/artist name is incorrect or there are no upcoming " +
    "events for the artist/band named: ";

const NO_SONG_DATA_FOUND_MSG = "An error occured while attempting to retrieve results for song: ";

const NO_MOVIE_DATA_FOUND_MSG = "Either the spelling of the movie name is incorrect or there is no data " +
    "for the movie named: ";


var artistName = '';
var movieName = '';
var songName = '';


logEnteredCommand();

if (validArgs()) {

    // Call correct functionality based on command line args 
    if (process.argv[2] === "concert-this") {
        artistName = process.argv[3];
        if (artistName === '') {
            logIt(logFileName, BAND_NAME_PROMPT + CRLF);
        }
        displayBandData();
    } else if (process.argv[2] === "spotify-this-song") {
        songName = process.argv[3];
        if (songName === '') {
            console.log(DEFAULT_SONG_MSG);
            logIt(logFileName, DEFAULT_SONG_MSG + CRLF);
            songName = defaultSongName;
        }
        displaySongData();
    } else if (process.argv[2] === "movie-this") {
        movieName = process.argv[3];
        if (movieName === '') {
            logIt(logFileName, DEFAULT_MOVIE_MSG + CRLF);
            movieName = defaultMovieName;
        }
        displayMovieData();
    } else if (process.argv[2] === "do-what-it-says") {
        readFile('random.txt');
    }
}


// Checks if the arguments passed in the terminal are valid
function validArgs() {
    let retVal = true;

    // There will always be either 4 arguments or 3 arguments in the case of do-what-it-says command. 
    if (process.argv.length != 4 && !(process.argv[2] === 'do-what-it-says')) {
        // Inform user of LIRI usage in the event they enter incorrect arguments
        usage();
        retVal = false;
    }
    else if (!validCommands.includes(process.argv[2])) {
        // If user enters an invalid command, inform them, and show usage
        logIt(logFileName, INVALID_COMMAND);
        usage();
        retVal = false;
    }
    return retVal;
}

// Displays the band data in the terminal and/or file 
function displayBandData() {

    // Requests band data from the BandsInTown API
    let queryUrl = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=${bandsInTownAPIKey}`
    request({
        url: queryUrl,
        json: true
    }, function (error, response, body) {

        // Checks if there are any upcoming events 
        if (!error && response.statusCode === 200) {
            if (!Array.isArray(body) || !body.length) {
                logIt(logFileName, NO_BAND_DATA_FOUND_MSG +`${artistName}.`);
                logIt(logFileName, CRLF);
            }
            else {
                // For every event, show the event information
                let bandInfo = '';
                logIt(logFileName, CRLF);
                for (let i = 0; i < body.length; i++) {
                    let venue = body[i].venue;
                    bandInfo += "Event number " + (i + 1) + CRLF;
                    bandInfo += "Name of venue: " + venue.name + CRLF;
                    bandInfo += "Location of event: " + venue.city + ", " + venue.region + " - " + venue.country + CRLF;
                    bandInfo += "Date of event: " + moment(body[i].datetime).format("MM/DD/YYYY") + CRLF;
                    bandInfo += CRLF;
                }
                logIt(logFileName, bandInfo);
            }
        }
    })
}


// Displays the song data in the terminal and/or file
function displaySongData() {
    var spotify = new Spotify({ id: spotifyId, secret: spotifySecret });

    // Searches the spotify API for a given song
    spotify.search({ type: 'track', query: `${songName}` }, function (err, data) {
        if (err) {
            logIt(logFileName, 'Error occurred: ' + err);
            return;
        }

        let songResults = "";
        logIt(logFileName, CRLF);
        try {
            // Display the song information to the terminal and/or file
            for (let i = 0; i < data.tracks.items.length; i++) {
                songResults += data.tracks.items[i].album.artists[0].name + CRLF;
                songResults += data.tracks.items[i].name + CRLF;
                songResults += data.tracks.items[i].album.artists[0].external_urls.spotify + CRLF;
                songResults += data.tracks.items[i].album.name + CRLF;
                songResults += CRLF;
            }
            logIt(logFileName, songResults);
        } catch (e) {
            logIt(logFileName, NO_SONG_DATA_FOUND_MSG + `${songName}.`);
            logIt(logFileName, CRLF);
        }
    });
}

// Displays the movie data in terminal and/or file
function displayMovieData() {

    // Request the movie data from OMDB API
    let queryUrl = `http://www.omdbapi.com/?t=${movieName}&apikey=${movieAPI}&`
    request({
        url: queryUrl,
        json: true
    }, function (err, res, body) {
        let movieResults = '';
        logIt(logFileName, CRLF);
        try {

            // Display movie results in the terminal and/or file
            if (!err && res.statusCode === 200) {
                movieResults += "Title: " + body.Title + CRLF;
                movieResults += "Year: " + body.Year + CRLF;
                movieResults += "IMDB Raing: " + body.imdbRating + CRLF;

                let arr = body.Ratings;
                let rottenTomatoesRating;

                // Find the value of the movie rating for the entry in the array 
                // having a source key equal to 'Rotten Tomatoes'
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].Source === "Rotten Tomatoes") {
                        rottenTomatoesRating = arr[i].Value;
                        break;
                    }
                }
                movieResults += "Rotten Tomatoes rating: " + rottenTomatoesRating + CRLF;
                movieResults += "Country: " + body.Country + CRLF;
                movieResults += "Language: " + body.Language + CRLF; 
                movieResults += "Plot: " + body.Plot + CRLF;
                movieResults += "Actors: " + body.Actors + CRLF;
                movieResults += CRLF;
                logIt(logFileName, movieResults);
            }
            else {
                logIt(logFileName, err);
            }
        } catch (e) {
            logIt(logFileName, NO_MOVIE_DATA_FOUND_MSG + `${movieName}.`);
            logIt(logFileName, CRLF);
        }
    })
}

// Read input file parse each line and spawn child process
function readFile(fileName) {

    // Read next line from file
    var lineReader = readLine.createInterface({
        input: fs.createReadStream(fileName)
    });

    // For each line in input file call node js using input from file
    lineReader.on('line', function (line) {
        let cmd = 'node liri.js ' + line;
        execChild(cmd);
    });
}

function logEnteredCommand() {
    logIt(logFileName, CRLF);
    logIt(logFileName, "*******************************************************************" + CRLF);
    logIt(logFileName, new Date().toLocaleString() + ' ');
    let cmdLine = 'node liri ';
    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i] === "") {
            cmdLine += `""` + ' ';
        } else {
            cmdLine += `"` + process.argv[i] + '" ';
        }
    }
    logIt(logFileName, cmdLine + CRLF);
    logIt(logFileName, "*******************************************************************" + CRLF);
}


// Log data to file and/or terminal and/or file
function logIt(fileName, data) {
    if (terminal === "Y") {
        console.log(data);
    }
    if (fileOutput === "Y") {
        fs.appendFileSync(fileName, data);
    }
}

// Execute a given node LIRI command
function execChild(cmd) {
    const { exec } = require('child_process');
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            logIt(logFileName, `exec error: ${err}`);
        } else {
            logIt(logFileName, stdout);
        }
        return;

    });
}

// Inform the user of the correct usage of LIRI
function usage() {
    let usageMsg = CRLF;
    usageMsg += "Usage is:" + CRLF;
    usageMsg += 'node liri.js concert-this "band/artist name"' + CRLF;
    usageMsg += 'node liri.js spotify-this-song "song name"' + CRLF;
    usageMsg += 'node liri.js movie-this "movie name"' + CRLF;
    usageMsg += "node liri.js do-what-it-says" + CRLF;
    logIt(logFileName, usageMsg);
}