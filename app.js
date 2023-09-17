const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let database = null;

const initilizationDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at 3000 ");
    });
  } catch (e) {
    console.log(`DB server Error${e.message}`);
    process.exit(1);
  }
};

initilizationDBAndServer();

const convertDBobjectToResponse = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const conversionDirectorObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
        SELECT
         movie_name
        FROM 
          movie;`;
  const movieArray = await database.all(getMovieQuery);
  response.send(
    movieArray.map((eachplayer) => convertDBobjectToResponse(eachplayer))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieQuery = `
  SELECT
   * 
  FROM
   movie
  WHERE 
    movie_id=${movieId};`;
  const movie = await database.get(getmovieQuery);
  response.send(convertDBobjectToResponse(movie));
});

app.post("/movies/", async (request, response) => {
  const movieAdd = request.body;
  const { directorId, movieName, leadActor } = movieAdd;
  const Query = `
     INSERT INTO 
     movie(
      director_id,
      movie_name,
      lead_actor)
      VALUES
      (
          '${directorId}',
          '${movieName}',
          '${leadActor}'
      );`;
  await database.run(Query);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const movieAdd = request.body;
  const { directorId, movieName, leadActor } = movieAdd;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE 
    movie 
  SET  
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
  WHERE 
    movie_id=${movieId};`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM 
   movie
  WHERE 
    movie_id=${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT
         *
        FROM 
          director;`;
  const directorArray = await database.all(getDirectorQuery);
  response.send(
    directorArray.map((eachplayer) => conversionDirectorObject(eachplayer))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};
  `;
  const movieArray = await database.all(getDirectorMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
