const Api = require('../api');
const registereredClanCollection = require('../dataBase/registeredClanQueries');
const {getMetricForBase} = require('../multipleUse/points');
const {removeByProperty, sum} = require('../multipleUse/oneLineFunctions');
const {fixTag} = require('../multipleUse/fixTag');
async function checkBaseCommandDetails(baseTag, msg) {
    let baseRequirements = await db.getBaseRequirementsByDiscordID(msg.author.id);
    let flag = 1;
    if(!baseRequirements) { msg.channel.send('Bruh, there are no clan requirements linked with you. Use ``-setreq`` command to set them up.'); return;}
    baseTag = fixTag(baseTag);
    let baseDetails = await Api.getPlayerDetails(baseTag);
    if(!baseDetails) { msg.channel.send('Bruh base tag is incorrect.'); return; }
    const baseMetrics = getMetricForBase(baseDetails);

    let heroes = baseDetails.heroes;
    let checkingBaseDetails = {};
    checkingBaseDetails.townHallLevel = baseDetails.townHallLevel;
    checkingBaseDetails.nonRushPoints = baseMetrics.result.playerRushPoints;
    checkingBaseDetails.maxPoints = baseMetrics.result.playerMaxPoints;
    checkingBaseDetails.attackWinsPoints = baseMetrics.playerActivity.attackWinsPoints;
    checkingBaseDetails.trophies = baseDetails.trophies;
    checkingBaseDetails.versusTrophies = baseDetails.versusTrophies;
    checkingBaseDetails.warStars = baseDetails.warStars;
    checkingBaseDetails.sumOfHeroes = "0";
    checkingBaseDetails.heroLevels = ["0"];
    
    if(heroes) {
        heroes = removeByProperty(heroes, "name", "Battle Machine");
        checkingBaseDetails.sumOfHeroes = sum(heroes, 'level');
        checkingBaseDetails.heroLevels = heroes.map(hero => hero.level);
    }
    if(!(baseRequirements.minimumTownHallLevel <= checkingBaseDetails.townHallLevel || baseRequirements.onlyTownHall == checkingBaseDetails.townHallLevel)) {
        msg.channel.send(`❌ TownHall Level : ${checkingBaseDetails.townHallLevel}\n`);
        flag = 0;
    }
    if(baseRequirements.nonRushPoints > checkingBaseDetails.nonRushPoints){
        msg.channel.send(`❌ Non Rush Points : ${checkingBaseDetails.nonRushPoints}\n`);
        flag = 0;
    }
    if(baseRequirements.maxPoints > checkingBaseDetails.maxPoints){
        msg.channel.send(`❌ Max Points : ${checkingBaseDetails.maxPoints}\n`);
        flag = 0;
    }
    if(baseRequirements.attackWinsPoints > checkingBaseDetails.attackWinsPoints){
        msg.channel.send(`❌ Activity Points : ${checkingBaseDetails.attackWinsPoints}\n`);
        flag = 0;
    }
    if(baseRequirements.trophies > checkingBaseDetails.trophies){
        msg.channel.send(`❌ Home Base Points : ${checkingBaseDetails.trophies}\n`);
        flag = 0;
    }
    if(baseRequirements.versusTrophies > checkingBaseDetails.versusTrophies){
        msg.channel.send(`❌ Builder Base Points : ${checkingBaseDetails.versusTrophies}\n`);
        flag = 0;
    }

    baseRequirements.sumOfHeroes.map(sumOfHeroes => {
        if(sumOfHeroes.townHallLevel == checkingBaseDetails.townHallLevel) {
            if(sumOfHeroes.sumOfHeroes > checkingBaseDetails.sumOfHeroes) {
                msg.channel.send(`❌ Sum Of Heroes : ${checkingBaseDetails.sumOfHeroes}\n`);
                flag = 0;
            }
        }
    });

    baseRequirements.heroLevels.map(heroLevels => {
        if(heroLevels.townHallLevel == checkingBaseDetails.townHallLevel) {
            if(heroLevels.heroLevels > checkingBaseDetails.heroLevels) {
                msg.channel.send(`❌ Hero Levels : ${checkingBaseDetails.heroLevels}\n`);
                flag = 0;
            }
        }
    });

    baseRequirements.warStars.map(warStars => {
        if(warStars.townHallLevel == checkingBaseDetails.townHallLevel) {
            if(warStars.warStars > checkingBaseDetails.warStars) {
                msg.channel.send(`❌ War Stars : ${checkingBaseDetails.warStars}\n`);
                flag = 0;
            }
        }
    });

    if(flag == 1) { msg.channel.send('🔥 Base Checks Out')}
}

module.exports = {
    checkBaseCommandDetails: checkBaseCommandDetails
}