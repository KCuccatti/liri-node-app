# liri-node-app

This project is a LIRI bot, like SIRI, that takes in user commands and provides user data based on those commands. 
The bot is capable of pulling information about movies, songs and concerts without needing to go to multiple sources. 
To get started, open the app in Visual Studio Code and make sure your terminal is set to the right path. Type "node liri" 
without the quotes in the terminal. This will show the user how to access the functionalities of LIRI.

Below are the test cases I used. You can view the output in the file 'log.txt'. I did not do screen shots or a video to 
show how the app works as I elected to also have the application write to file. The results and the commands used to get 
those results can be viewed in the file ('log.txt'). 
Enjoy!

node liri concert-this 
node liri concert-this "" 
node liri concert-thiD 
ndoe liri concert-this "Kiss" 
node liri concert-thiD "Breaking Benjamin" 
node liri concert-this "Breaking Benjamin" 
node liri concert-this "Breaking Benjamin" "An Extra Arg"

node liri spotify-this-song 
node liri spotify-this-song "" 
node liri spotify-this-sonN 
node liri spotify-this-sonN "Hail to the king" 
node liri spotify-this-song "Hail to the king" 
node liri spotify-this-song "Hail to the king" "An Extra Arg"

node liri movie-this 
node liri movie-this "" 
node liri movie-thiD 
node liri movie-thiD "Holes" 
node liri movie-this "Holes" 
node liri movie-this "Holes" "An Extra Arg"

node liri do-what-it-says
