const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const intialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};

intialiseDBAndServer();

// GET Players API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team;
    `;
  const playersArray = await db.all(getPlayersQuery);
  const ans = (eachPlayerObj) => {
    return {
      playerId: eachPlayerObj.player_id,
      playerName: eachPlayerObj.player_name,
      jerseyNumber: eachPlayerObj.jersey_number,
      role: eachPlayerObj.role,
    };
  };
  response.send(playersArray.map((eachPlayerObj) => ans(eachPlayerObj)));
});

// ADD Player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
        INSERT INTO cricket_team(
            player_name,
            jersey_number,
            role
        )
        VALUES(
            '${playerName}',
            ${jerseyNumber},
            '${role}'
        );`;

  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  console.log(playerId);
  response.send("Player Added to Team");
});

// GET Player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;

  const playerArrayObj = await db.get(getPlayerQuery);
  response.send({
    playerId: playerArrayObj.player_id,
    playerName: playerArrayObj.player_name,
    jerseyNumber: playerArrayObj.jersey_number,
    role: playerArrayObj.role,
  });
});

// Update Player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE
        cricket_team
      SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
      WHERE
        player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player API

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
