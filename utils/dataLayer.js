import axios from 'axios';
import moment from 'moment-timezone';

const brokerColors= {r: 59, g: 202, b:227}
const chaosColors= {r: 59, g: 227, b:104}
const zekiColors= {r: 227, g: 196, b:59}
const weillyColors= {r: 227, g: 59, b:59}
const iskesColors= {r: 196, g: 59, b:227}

export function randomRGB() {
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    let r = randomBetween(0,255)
    let g = randomBetween(0,255)
    let b = randomBetween(0,255)
    return {r,g,b}
  }

export async function mergePlayerData(player1, player2) {
    if (player1 && player2 && player1.matches && player2.matches) {
      player1.matches = new Map([...player1.matches, ...player2.matches])
    }
    
    return player1
  }

async function transformData(data){
  
  return data.matches.filter(p => p.metadata.modeName == "Competitive").map(
    p => ({
      player: data.requestingPlayerAttributes.platformUserIdentifier,
      date: p.metadata.timestamp,
      map: p.metadata.mapName,
      agent: p.metadata.agentName,
      Score: p.segments[0].stats.score.value,
      Rounds: p.segments[0].stats.roundsPlayed.value,
      Kills: p.segments[0].stats.kills.value,
      Headshots: p.segments[0].stats.headshots.value,
      Assists: p.segments[0].stats.assists.value,
      Damage: p.segments[0].stats.damage.value,
      DamageReceived: p.segments[0].stats.damageReceived.value,
      EconRating: p.segments[0].stats.econRating.value,
      Plants: p.segments[0].stats.plants.value,
      Defuses: p.segments[0].stats.defuses.value,
      Deaths: p.segments[0].stats.deaths.value,
      FirstBloods: p.segments[0].stats.firstBloods.value,
      DealtHeadshots: p.segments[0].stats.dealtHeadshots.value,
      DealtBodyshots: p.segments[0].stats.dealtBodyshots.value,
      DealtLegshots: p.segments[0].stats.dealtLegshots.value,
      RecievedHeadshots: p.segments[0].stats.recievedHeadshots.value,
      RecievedBodyshots: p.segments[0].stats.recievedBodyshots.value,
      RecievedLegshots: p.segments[0].stats.recievedLegshots.value,
      DeathsFirst: p.segments[0].stats.deathsFirst.value,
      DeathsLast: p.segments[0].stats.deathsLast.value,
      RoundsWon: p.segments[0].stats.roundsWon.value,
      RoundsLost: p.segments[0].stats.roundsLost.value,
      Placement: p.segments[0].stats.placement.value,
      KdRatio: p.segments[0].stats.kdRatio.value,
      ScorePerRound: p.segments[0].stats.scorePerRound.value,
      DamagePerRound: p.segments[0].stats.damagePerRound.value,
    })
  );
}

export async function getPlayerDataFromTracker(player, dateStart, dateEnd) {
  let path = `https://api.tracker.gg/api/v2/valorant/rap-matches/riot/${player}?type=competitive&next=null`
    const res = await axios.get(path, {
      headers: {
        'TRN-Api-Key': '203c55ac-fb74-4fde-a3ce-20cd70661d4a',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      },
  
    })
    let data = await transformData(res.data.data)
    data = data.filter(p => moment(p.date).isAfter(dateStart))
    data = data.filter(p => moment(p.date).isBefore(dateEnd))
    return data
}

export async function getPlayerDataFromCosmos(player, dateStart, dateEnd) {
  
}

export async function getPlayerData(player, dateStart, dateEnd) {
    return getPlayerDataFromTracker(player, dateStart, dateEnd)
  }

export async function getProfiles(dateStart, dateEnd) {
  const broker = await getPlayerData('Broker%236969', dateStart, dateEnd)
  const neuras = await getPlayerData('Neuras%234402', dateStart, dateEnd)
  const ikeric = await getPlayerData('Ikeric%235421', dateStart, dateEnd)
  const zeki = await getPlayerData('Zehcnas%23666', dateStart, dateEnd)
  const chaos = await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime', dateStart, dateEnd)
  const wallux = await getPlayerData('Wallux%23wal', dateStart, dateEnd)
  const iskes = await getPlayerData('Iskes%235895', dateStart, dateEnd)
  
  const profiles = [
    {
      name: "Broker All",
      rgb: brokerColors,
      players: [broker, neuras, ikeric],
      hidden: false
    },    
    {
      name: "Zehcnas",
      rgb: zekiColors,
      players: [zeki],
      hidden: false
    },
    {
      name: "Chaos",
      rgb: chaosColors,
      players: [chaos],
      hidden: false
    },
    {
      name: "Wallux",
      rgb: weillyColors,
      players: [wallux],
      hidden: false
    },
    {
      name: "Iskes",
      rgb: iskesColors,
      players: [iskes],
      hidden: true
    },
    {
      name: "Broker",
      rgb: randomRGB(),
      players: [broker],
      hidden: true
    },
    {
      name: "Neuras",
      rgb: randomRGB(),
      players: [neuras],
      hidden: true
    },
    {
      name: "Ikeric",
      rgb: randomRGB(),
      players: [ikeric],
      hidden: true
    },
  ];

  return profiles
}