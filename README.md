# Twitch Ticker Overlay

A React web application (running on port 3001) of a Twitch overlay that
simulates an "ESPN Bottomline" ticker. It rotates through data that is retrieved
from an Express server running on port 3000.
([Here](https://github.com/cgbuen/chatbot) is the corresponding one that I use.)

## Install

I'm using node 8.16.0 and npm 5.10.0, but this is probably simple enough to work
with a lot of different versions.

    npm ci

## Configure

Duplicate .env.local.example and rename it to .env.example. Then:

- Update the HOST variable to the location (if locally, IP/port of the machine)
  for the API endpoint server.
- Update the FONTS variable to the URL of the appropriate Typekit stylesheet.

## Run

Ensure that API endpoint server is running. Then, in a new terminal tab, run
this project here.

    npm start
