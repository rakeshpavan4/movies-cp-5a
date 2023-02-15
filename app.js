const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await database.all(getMoviesList);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesList = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMoviesList);
  response.send(convertDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMoviesList = `
  INSERT INTO
    movie(director_id,movie_name,lead_actor)
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  const player = await database.run(postMoviesList);
  //const movieId = movie.lastID;
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updatePlayerQuery = `
  UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name = ${movieName},
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`;

  await database.run(updatePlayerQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await database.run(deletePlayerQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMoviesList = `
    SELECT
      *
    FROM
      director;`;
  const moviesArray = await database.all(getMoviesList);
  response.send(
    moviesArray.map((eachPlayer) =>
      convertDbObjectToResponseObject2(eachPlayer)
    )
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesList = `
    SELECT 
      movie.movie_name
    FROM 
      movie INNER JOIN director ON director.directorId=movie.directorId 
    WHERE 
      director_id = ${directorId};`;
  const movie = await database.get(getMoviesList);
  response.send(convertDbObjectToResponseObject2(movie));
});

module.exports = app;
