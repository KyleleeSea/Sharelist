<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/KyleleeSea/Sharelist">
    <img src="https://i.imgur.com/fH1NiUb.png" alt="Logo" width="80" height="80">
  </a>

<h1 align="center">ShareList</h1>

  <p align="center">
    <h4>
      A Spotify playlist sharing community with full create, read, update, delete functionality. 
    </h4>
    <br />
    <a href="https://sharelist.org/">View Demo</a>
    ·
    <a href="https://github.com/KyleleeSea/Sharelist/issues">Report Bug</a>
    ·
    <a href="https://github.com/KyleleeSea/Sharelist/issues">Request Feature</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

[![ShareList Screen Shot][product-screenshot]](https://sharelist.org/)

ShareList: A Spotify playlist community to help you discover your next track to put on repeat and a platform for you to share your unique music tastes.

### Features
- User authentication and profiles
- Review, ranking, and comment system 
- Listen to playlists directly in browser 
- Narrow by tags 
- Sort by top, recent, rising, weekly, and featured
- Post your own playlists
- Contact form
- IntroJS multi page onboarding 

### Built With

* [![ExpressJS][expressjs.com]][expressjs-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![EJS][ejs.co]][ejs-url]
* [![MongoDB][mongodb.com]][mongodb-url]
* [![Spotify API][spotify.com]][spotify-url]
* [![PassportJS][passportjs.org]][passportjs-url]
* [![Nodemailer][nodemailer.com]][nodemailer-url]


## Live Demo

Please view the full demo of ShareList here: <a href="https://sharelist.org/">ShareList.org</a>

## Local Copy
You may run this project locally by following these steps:

1. Clone the repo
   ```sh
   git clone https://github.com/KyleleeSea/Sharelist
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a .env file
4. Create your own SpotifyAPI account and include keys in variables (in .env file): "CLIENT_ID" and "CLIENT_SECRET"
5. Create your own MongoDB cluster and include URL in .env file under variable  "DB_URL"
6. Run in terminal
   ```sh
   node app.js
   ```

## Known Bugs
- User changing playlist visibility sets image to blank 

<!-- CONTACT -->
## Contact

Twitter - [@KyleleeSea](https://twitter.com/KyleleeSea)

Project Link: [https://github.com/KyleleeSea/Sharelist](https://github.com/KyleleeSea/Sharelist)

<!-- MARKDOWN LINKS & IMAGES -->
[product-screenshot]: https://i.imgur.com/4r4pCkj.png
[expressjs.com]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=AEAEAE
[expressjs-url]: https://expressjs.com/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[ejs.co]: https://img.shields.io/badge/EJS-000000?style=for-the-badge&logo=ejs&logoColor=ffffff
[ejs-url]: https://ejs.co/
[mongodb.com]: https://img.shields.io/badge/MongoDB-000000?style=for-the-badge&logo=mongodb&logoColor=00ED64
[mongodb-url]: https://www.mongodb.com/
[spotify.com]: https://img.shields.io/badge/Spotify_API-000000?style=for-the-badge&logo=Spotify&logoColor=08C367
[spotify-url]: https://developer.spotify.com/documentation/web-api/
[passportjs.org]: https://img.shields.io/badge/Passport.js-000000?style=for-the-badge&logo=Passport&logoColor=1EBF5E
[passportjs-url]: https://www.passportjs.org/
[nodemailer.com]: https://img.shields.io/badge/Nodemailer-29ABE2?style=for-the-badge&logo=nodemailer&logoColor=29ABE2
[nodemailer-url]: https://nodemailer.com/

