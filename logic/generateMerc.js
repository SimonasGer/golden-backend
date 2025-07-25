const archetypes = require("../data/archetypes.json");
const firstNames = require("../data/firstNames.json");
const lastNames = require("../data/lastNames.json");

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollStat([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomMargin(base, percentRange = 0.2) {
    const margin = base * percentRange;
    return Math.round(base + (Math.random() * margin * 2 - margin));
}


function calculatePriceAndWage(strength, agility, intelligence, priceMultiplier = 25, wageMultiplier = 6) {
    const totalStats = strength + agility + intelligence;

    const basePrice = totalStats * priceMultiplier;
    const baseWage = totalStats * wageMultiplier;

    return {
        price: randomMargin(basePrice, 0.15), // ±15%
        wage: randomMargin(baseWage, 0.25)    // ±25%
    };
}
function generateMerc() {
    const archetype = pickRandom(archetypes.archetypes);
    const firstName = pickRandom([...firstNames.male, ...firstNames.female]);
    const lastName = pickRandom(lastNames.lastNames);
    const strength = rollStat(archetype.statRanges.strength);
    const agility = rollStat(archetype.statRanges.agility);
    const intelligence=  rollStat(archetype.statRanges.intelligence);
    const { price, wage } = calculatePriceAndWage(strength, agility, intelligence);

    return {
        firstName,
        lastName,
        archetype: archetype.name,
        description: archetype.description,
        strength,
        agility,
        intelligence,
        injuryStatus: "healthy",
        price,
        wage,
    }
}

function generateMultipleMercs(count) {
    const mercs = []; 
    for (let i = 0; i < count; i++) {
        mercs.push(generateMerc());
    }
    return mercs;
}

module.exports = { generateMultipleMercs };
