import axios from 'axios';
import moment from 'moment-timezone';

const brokerColors = { r: 59, g: 202, b: 227 }
const chaosColors = { r: 59, g: 227, b: 104 }
const zekiColors = { r: 227, g: 196, b: 59 }
const weillyColors = { r: 227, g: 59, b: 59 }
const iskesColors = { r: 196, g: 59, b: 227 }
const bandiColors = { r: 196, g: 227, b: 227 }
let cosmosResult = null
let cosmosStartDate = null
let cosmosEndDate = null

function mergeAndDeduplicate(origArr, updatingArr) {

  for (var i = 0; i < updatingArr.length; i++) {
    if (!origArr.find(p => moment(p.date).isSame(moment(updatingArr[i].date))))
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

export async function mpd(player1, player2) {
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

export async function getPlayerDataFromTrackerIndex(player, index,dateStart, dateEnd) {
  let path = `https://api.tracker.gg/api/v2/valorant/standard/matches/riot/${player}?type=competitive&next=${index}`
  console.log(`Reading ${path}`)
  try {
    const res = await axios.get(path, {
      headers: {
        'TRN-Api-Key': '203c55ac-fb74-4fde-a3ce-20cd70661d4a',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      },

    })
    if (res.data.data) {
      let data = await transformData(res.data.data)
      data = data.filter(p => moment(p.date).isSameOrAfter(dateStart, 'day'))
      data = data.filter(p => moment(p.date).isSameOrBefore(dateEnd, 'day'))  
      return data
    }
    return []
  }
  catch {
    return []
  } 
}

export async function getPlayerDataFromTracker(player, dateStart, dateEnd) { 
  var d0 = getPlayerDataFromTrackerIndex(player, 0, dateStart, dateEnd)
  var d1 = getPlayerDataFromTrackerIndex(player, 1, dateStart, dateEnd)
  var d2 = getPlayerDataFromTrackerIndex(player, 2, dateStart, dateEnd)
  var d3 = getPlayerDataFromTrackerIndex(player, 3, dateStart, dateEnd)
  var d4 = getPlayerDataFromTrackerIndex(player, 4, dateStart, dateEnd)
  var d5 = getPlayerDataFromTrackerIndex(player, 5, dateStart, dateEnd)
  var d6 = getPlayerDataFromTrackerIndex(player, 6, dateStart, dateEnd)
  var d7 = getPlayerDataFromTrackerIndex(player, 7, dateStart, dateEnd)
  var d8 = getPlayerDataFromTrackerIndex(player, 8, dateStart, dateEnd)

  var data0 = await d0
  var data1 = await d1
  var data2 = await d2
  var data3 = await d3
  var data4 = await d4
  var data5 = await d5
  var data6 = await d6
  var data7 = await d7
  var data8 = await d8

  var all = data0.concat(data1, data2, data3, data4, data5, data6, data7, data8)
  return all
}

export async function getPlayerDataFromCosmos(player, dateStart, dateEnd) {
  if (!cosmosResult || !cosmosStartDate || !cosmosEndDate || !moment(cosmosStartDate).isSame(dateStart) || !moment(cosmosEndDate).isSame(dateEnd))  {
    console.log('Reading from cosmos')
    let path = `https://valorant-avg-2.azurewebsites.net/api/GetCompetitiveMatches?code=JNwPc50O/xMe4f47C1w0etitWGeNzwJtskfCU3Tdh2IoURWGmow55Q==&from=${moment(dateStart).format('YYYY-MM-DD')}&to=${moment(dateEnd).format('YYYY-MM-DD')}`;
    const res = await axios.get(path, {
      headers: {
        'Accept': 'application/json'
      },

    })
    cosmosResult = res.data
    cosmosStartDate = dateStart
    cosmosEndDate = dateEnd
  }

  return cosmosResult.filter(p => p.player == player)
}

export async function getPlayerData(playerTracker, playerCosmos, dateStart, dateEnd) {
  console.log(`Retreiving data for ${playerTracker}`)
  let dataFromTracker = await getPlayerDataFromTracker(playerTracker, dateStart, dateEnd)
  return dataFromTracker
}

export async function getProfiles(dateStart, dateEnd) {
  const brokerPromise = getPlayerData('Broker%236969', 'Broker#6969', dateStart, dateEnd)
  const neurasPromise = getPlayerData('Neuras%234402', 'Neuras#4402', dateStart, dateEnd)
  const ikericPromise = getPlayerData('Ikeric%235421', 'Ikeric#5421', dateStart, dateEnd)
  const zekiPromise = getPlayerData('Zehcnas%23666', 'Zehcnas#666', dateStart, dateEnd)
  const chaosPromise = getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime', 'ΞΔΞ Chaos#Prime', dateStart, dateEnd)
  const walluxPromise = getPlayerData('Wallux%23wal', 'Wallux#wal', dateStart, dateEnd)
  const iskesPromise = getPlayerData('Iskes%235895', 'Iskes#5895', dateStart, dateEnd)
  const alchemyPromise = getPlayerData('Alchemy%23alt', 'Alchemy#alt', dateStart, dateEnd)
  const iber0Promise = getPlayerData('KingIber0%235488', 'KingIber0#5488', dateStart, dateEnd)
  const zekiSmurfPromise = getPlayerData('Zeki%236666', 'Zeki#6666', dateStart, dateEnd)
  const bandiPromise = getPlayerData('Bandiduel%23EUW', 'Bandiduel#EUW', dateStart, dateEnd)
  const weillySmurfPromise = getPlayerData('weilly%23wal', 'weilly#wal', dateStart, dateEnd)
  const platanitoPromise = getPlayerData('platanito%23fruta', 'platanito#fruta', dateStart, dateEnd)
  const elpodologoPromise = getPlayerData('elpodologo%236629', 'elpodologo#6629', dateStart, dateEnd)
  const brokerSnowPromise = getPlayerData('BrokerSnow%234502', 'BrokerSnow#4502', dateStart, dateEnd)

  const broker = await brokerPromise
  const neuras = await neurasPromise
  const ikeric = await ikericPromise
  const zeki = await zekiPromise
  const chaos = await chaosPromise
  const wallux = await walluxPromise
  const iskes = await iskesPromise
  const alchemy = await alchemyPromise
  const iber0 = await iber0Promise
  const zekiSmurf = await zekiSmurfPromise
  const bandi = await bandiPromise
  const weillySmurf = await weillySmurfPromise
  const platanito = await platanitoPromise
  const elpodologo = await elpodologoPromise
  const brokerSnow = await brokerSnowPromise

  const profiles = [
    {
      name: "Broker",
      rgb: brokerColors,
      players: [broker, neuras, ikeric,brokerSnow],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Zehcnas",
      rgb: zekiColors,
      players: [zeki, zekiSmurf,elpodologo],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Chaos",
      rgb: chaosColors,
      players: [chaos, alchemy],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Wallux",
      rgb: weillyColors,
      players: [wallux, weillySmurf, platanito],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Iskes",
      rgb: iskesColors,
      players: [iskes],
      hidden: false,
      dateStart,
      dateEnd
    },
    {
      name: "Bandi",
      rgb: bandiColors,
      players: [bandi],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Broker Main",
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
    {
      name: "Iber0",
      rgb: randomRGB(),
      players: [iber0],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Chaos Prime",
      rgb: randomRGB(),
      players: [chaos],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Alchemy",
      rgb: randomRGB(),
      players: [alchemy],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Zeki Main",
      rgb: randomRGB(),
      players: [zeki],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Zeki Smurf",
      rgb: randomRGB(),
      players: [zekiSmurf],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "El podologo",
      rgb: randomRGB(),
      players: [elpodologo],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Weilly Main",
      rgb: randomRGB(),
      players: [wallux],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Weilly Smurf",
      rgb: randomRGB(),
      players: [weillySmurf],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "Platanito",
      rgb: randomRGB(),
      players: [platanito],
      hidden: true,
      dateStart,
      dateEnd
    },
    {
      name: "BrokerSnow",
      rgb: randomRGB(),
      players: [brokerSnow],
      hidden: true,
      dateStart,
      dateEnd
    },
  ];

  return profiles
}