const missions = require("../data/missions.json");

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollStat([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomMargin(base, percentRange = 0.2) {
    const margin = base * percentRange;
    return Math.round(base + (Math.random() * margin * 2 - margin)); // ±percentRange
}


function calculateReward(strength, agility, intelligence, rewardMultiplier = 25) {
    const totalStats = strength + agility + intelligence;

    const baseReward = totalStats * rewardMultiplier;

    return {
        reward: randomMargin(baseReward, 0.25)    // ±25%
    };
}
function generateMission() {
    const mission = pickRandom(missions);
    const strength = rollStat(mission.requirements.strength);
    const agility = rollStat(mission.requirements.agility);
    const intelligence = rollStat(mission.requirements.intelligence);
    const { reward } = calculateReward(strength, agility, intelligence);
    return {
        name: mission.name,
        description: mission.description,
        strength,
        agility,
        intelligence,
        status: "inactive",
        reward,
    }
}

function generateMultipleMissions(count) {
    const missions = []; 
    for (let i = 0; i < count; i++) {
        missions.push(generateMission());
    }
    return missions;
}

module.exports = { generateMultipleMissions };
