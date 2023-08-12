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
  response.send(playersArray);
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
            ${playerName},
            ${jerseyNumber},
            ${role}
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

  const playerArray = await db.get(getPlayerQuery);
  response.send(playerArray);
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

module.exports = express;
