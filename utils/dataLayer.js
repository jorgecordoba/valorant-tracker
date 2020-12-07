import axios from 'axios';
import moment from 'moment-timezone';

const brokerColors = { r: 59, g: 202, b: 227 }
const chaosColors = { r: 59, g: 227, b: 104 }
const zekiColors = { r: 227, g: 196, b: 59 }
const weillyColors = { r: 227, g: 59, b: 59 }
const iskesColors = { r: 196, g: 59, b: 227 }

function mergeAndDeduplicate(origArr, updatingArr) {

  for (var i = 0; i < updatingArr.length; i++) {
    if (!origArr.find(p => p.date == updatingArr[i].date))
      origArr.push(updatingArr[i])
  }
  return origArr
}

export function randomRGB() {
  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let r = randomBetween(0, 255)
  let g = randomBetween(0, 255)
  let b = randomBetween(0, 255)
  return { r, g, b }
}

export async function mergePlayerData(player1, player2) {
  if (player1 && player2 && player1.matches && player2.matches) {
    player1.matches = new Map([...player1.matches, ...player2.matches])
  }

  return player1
}

async function transformData(data) {

  return data.matches.filter(p => p.metadata.modeName == "Competitive").map(
    p => ({
      player: data.requestingPlayerAttributes.platformUserIdentifier,
      date: p.metadata.timestamp,
      map: p.metadata.mapName,
      agent: p.metadata.agentName,
      score: p.segments[0].stats.score.value,
      rounds: p.segments[0].stats.roundsPlayed.value,
      kills: p.segments[0].stats.kills.value,
      headshots: p.segments[0].stats.headshots.value,
      assists: p.segments[0].stats.assists.value,
      damage: p.segments[0].stats.damage.value,
      damageReceived: p.segments[0].stats.damageReceived.value,
      econRating: p.segments[0].stats.econRating.value,
      plants: p.segments[0].stats.plants.value,
      defuses: p.segments[0].stats.defuses.value,
      deaths: p.segments[0].stats.deaths.value,
      firstBloods: p.segments[0].stats.firstBloods.value,
      dealtHeadshots: p.segments[0].stats.dealtHeadshots.value,
      dealtBodyshots: p.segments[0].stats.dealtBodyshots.value,
      dealtLegshots: p.segments[0].stats.dealtLegshots.value,
      recievedHeadshots: p.segments[0].stats.recievedHeadshots.value,
      recievedBodyshots: p.segments[0].stats.recievedBodyshots.value,
      recievedLegshots: p.segments[0].stats.recievedLegshots.value,
      deathsFirst: p.segments[0].stats.deathsFirst.value,
      deathsLast: p.segments[0].stats.deathsLast.value,
      roundsWon: p.segments[0].stats.roundsWon.value,
      roundsLost: p.segments[0].stats.roundsLost.value,
      placement: p.segments[0].stats.placement.value,
      kdRatio: p.segments[0].stats.kdRatio.value,
      scorePerRound: p.segments[0].stats.scorePerRound.value,
      damagePerRound: p.segments[0].stats.damagePerRound.value,
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
  data = data.filter(p => moment(p.date).isSameOrAfter(dateStart, 'day'))
  data = data.filter(p => moment(p.date).isSameOrBefore(dateEnd, 'day'))
  return data
}

export async function getPlayerDataFromCosmos(player, dateStart, dateEnd) {
  let path = `https://valorant-avg-2.azurewebsites.net/api/GetCompetitiveMatches?code=JNwPc50O/xMe4f47C1w0etitWGeNzwJtskfCU3Tdh2IoURWGmow55Q==&from=${moment(dateStart).format('YYYY-MM-DD')}&to=${moment(dateEnd).format('YYYY-MM-DD')}`;
  const res = await axios.get(path, {
    headers: {
      'Accept': 'application/json'
    },

  })

  let data = res.data.filter(p => p.player == player)
  return data
}

export async function getPlayerData(playerTracker, playerCosmos, dateStart, dateEnd) {

  return mergeAndDeduplicate(await getPlayerDataFromCosmos(playerCosmos, dateStart, dateEnd), await getPlayerDataFromTracker(playerTracker, dateStart, dateEnd))
}

export async function getProfiles(dateStart, dateEnd) {
  const broker = await getPlayerData('Broker%236969', 'Broker#6969', dateStart, dateEnd)
  const neuras = await getPlayerData('Neuras%234402', 'Neuras#4402', dateStart, dateEnd)
  const ikeric = await getPlayerData('Ikeric%235421', 'Ikeric#5421', dateStart, dateEnd)
  const zeki = await getPlayerData('Zehcnas%23666', 'Zehcnas#666', dateStart, dateEnd)
  const chaos = await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime', 'ΞΔΞ Chaos#Prime', dateStart, dateEnd)
  const wallux = await getPlayerData('Wallux%23wal', 'Wallux#wal', dateStart, dateEnd)
  const iskes = await getPlayerData('Iskes%235895', 'Iskes#5895', dateStart, dateEnd)

  const profiles = [
    {
      name: "Broker All",
      rgb: brokerColors,
      players: [broker, neuras, ikeric],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Zehcnas",
      rgb: zekiColors,
      players: [zeki],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Chaos",
      rgb: chaosColors,
      players: [chaos],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Wallux",
      rgb: weillyColors,
      players: [wallux],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Iskes",
      rgb: iskesColors,
      players: [iskes],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Broker",
      rgb: randomRGB(),
      players: [broker],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Neuras",
      rgb: randomRGB(),
      players: [neuras],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Ikeric",
      rgb: randomRGB(),
      players: [ikeric],
      hidden: true,
      dateStart,
      dateEnd
    },
  ];

  return profiles
}