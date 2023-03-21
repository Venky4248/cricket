const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const d_path = path.join(__dirname, "cricketMatchDetails.db");
let abj = null;
const StartServer = async () => {
  try {
    abj = await open({
      filename: d_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("it is rung");
    });
  } catch (e) {
    console.log(`error is ${e.message}`);
    process.exit(1);
  }
};
StartServer();
const ConTo = (n) => {
  return {
    playerId: n.player_id,
    playerName: n.player_name,
  };
};

const MatchTo = (l) => {
  return {
    matchId: l.match_id,
    match: l.match,
    year: l.year,
  };
};

const OnlyMatch = (k) => {
  return {
    matchId: k.match_id,
    match: k.match,
    year: k.year,
  };
};

const OnlyPlayer = (g) => {
  return {
    playerId: g.player_id,
    playerName: g.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const get_q1 = `SELECT * FROM player_details ORDER BY player_id`;
  const res = await abj.all(get_q1);
  response.send(res.map((each) => ConTo(each)));
});
//API2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const get_q2 = `SELECT * FROM player_details WHERE player_id=${playerId}`;
  const result = await abj.get(get_q2);
  response.send(result);
});
//API3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const det = request.body;
  const { playerName } = det;

  const p_q = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId}`;
  const a = await abj.run(p_q);
  response.send("Player Details Updated");
});
//API4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const m_q = `SELECT * FROM match_details WHERE match_id=${matchId}`;
  const m_res = await abj.get(m_q);
  response.send(MatchTo(m_res));
});
//API5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const pm_q = `SELECT * FROM player_match_score NATURAL JOIN match_details WHERE player_id=${playerId}`;
  const pm_res = await abj.all(pm_q);
  response.send(pm_res.map((each) => MatchTo(each)));
});
//API6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const only_player = `SELECT * FROM player_match_score NATURAL JOIN player_details WHERE match_id=${matchId}`;
  const only_res = await abj.all(only_player);
  response.send(only_res.map((each) => OnlyPlayer(each)));
});
//API7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const d = request.body;
  const { playerName, totalScores, totalFours, totalSixes } = d;
  const Final_q = `SELECT 
                    player_details.player_id AS playerId,
                    player_details.player_name AS playerName,
                    SUM(player_match_score.score) AS totalScore,
                    SUM(fours) AS totalFours,
                    SUM(sixes) AS totalSixes
                    FROM player_details INNER JOIN player_match_score ON
                    player_details.player_id=player_match_score.player_id
                    WHERE player_details.player_id=${playerId}`;
  const final_res = await abj.all(Final_q);
  response.send(final_res);
});
module.exports = app;
