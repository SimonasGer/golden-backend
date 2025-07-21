function mercFate(mercs, status) {
    return mercs.map(merc => {
        const rng = Math.random() * 100;

        if (status === "success") {
            if (rng < 1) {
                merc.status = "dead";
            } else if (rng < 10) {
                merc.status = "injured";
            } else {
                merc.status = "healthy";
            }
        } else if (status === "failed") {
            if (rng < 50) {
                merc.status = "dead";
            } else {
                merc.status = "injured";
            }
        }

        return merc;
    });
}

function missionSuccess(mission, mercs) {
    const givenStats = {
        strength: 0,
        agility: 0,
        intelligence: 0,
    };

    // Sum merc stats
    mercs.forEach(merc => {
        givenStats.strength += merc.stats.strength;
        givenStats.agility += merc.stats.agility;
        givenStats.intelligence += merc.stats.intelligence;
    });

    const requiredStats = mission.stats;

    // Clamp to not overcontribute beyond required
    const cappedStats = {
        strength: Math.min(givenStats.strength, requiredStats.strength),
        agility: Math.min(givenStats.agility, requiredStats.agility),
        intelligence: Math.min(givenStats.intelligence, requiredStats.intelligence),
    };

    const totalGiven = cappedStats.strength + cappedStats.agility + cappedStats.intelligence;
    const totalRequired = requiredStats.strength + requiredStats.agility + requiredStats.intelligence;

    let successChance = Math.round((totalGiven / totalRequired) * 100);
    successChance = Math.max(0, Math.min(successChance, 100)); // Clamp 0–100

    const successRoll = Math.random() * 100;

    const success = successRoll <= successChance;

    return {
        status: success ? "completed" : "failed",
        reward: success ? mission.reward : 0,
        mercs: mercFate(mercs, success ? "completed" : "failed")
    };
}

module.exports = { missionSuccess };