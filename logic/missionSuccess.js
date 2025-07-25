// A bunch of math to calculate mission results. Will be overhauled in later versions.

function mercFate(mercs, status) {
    return mercs.map(merc => {
        const rng = Math.random() * 100;

        if (status === "success") {
            if (rng < 1) {
                merc.injury_status = "dead";
            } else if (rng < 10) {
                merc.injury_status = "injured";
            } else {
                merc.injury_status = "healthy";
            }
        } else if (status === "failed") {
            if (rng < 50) {
                merc.injury_status = "dead";
            } else {
                merc.injury_status = "injured";
            }
        }
        return merc;
    });
}

function missionSuccess(mission, mercs) {
    let givenStats = {
        strength: 0,
        agility: 0,
        intelligence: 0,
    };

    let wage = 0;

    // Sum merc stats
    mercs.forEach(merc => {
        givenStats.strength += merc.strength;
        givenStats.agility += merc.agility;
        givenStats.intelligence += merc.intelligence;
        wage += merc.wage;
    });

    const requiredStrength = mission.strength;
    const requiredAgility = mission.agility;
    const requiredIntelligence = mission.intelligence;

    // Clamp to not overcontribute beyond required
    const cappedStats = {
        strength: Math.min(givenStats.strength, requiredStrength),
        agility: Math.min(givenStats.agility, requiredAgility),
        intelligence: Math.min(givenStats.intelligence, requiredIntelligence),
    };

    const totalGiven = cappedStats.strength + cappedStats.agility + cappedStats.intelligence;
    const totalRequired = requiredStrength + requiredAgility + requiredIntelligence;

    let successChance = Math.round((totalGiven / totalRequired) * 100);
    successChance = Math.max(0, Math.min(successChance, 100)); // Clamp 0–100

    const successRoll = Math.random() * 100;

    const success = successRoll <= successChance;

    return {
        status: success ? "completed" : "failed",
        reward: success ? mission.reward : 0,
        mercs: mercFate(mercs, success ? "completed" : "failed"),
        wage: wage,
    };
}

module.exports = { missionSuccess };