import axios from 'axios';

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

export async function getPlayerData(player) {
    let path = `https://api.tracker.gg/api/v2/valorant/rap-matches/riot/${player}?type=competitive&next=null`
    const res = await axios.get(path, {
      headers: {
        'TRN-Api-Key': '203c55ac-fb74-4fde-a3ce-20cd70661d4a',
        'Accept': 'application/json'
      },
  
    })
    return res.data.data
  }

export async function getProfiles() {
  const broker = await getPlayerData('Broker%236969')
  const neuras = await getPlayerData('Neuras%234402')
  const ikeric = await getPlayerData('Ikeric%235421')
  const zeki = await getPlayerData('Zehcnas%23666')
  const chaos = await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime')
  const wallux = await getPlayerData('Wallux%23wal')
  const iskes = await getPlayerData('Iskes%235895')
  
  const profiles = [
    {
      name: "Broker All",
      rgb: randomRGB(),
      players: [broker, neuras, ikeric],
      hidden: false
    },    
    {
      name: "Zehcnas",
      rgb: randomRGB(),
      players: [zeki],
      hidden: false
    },
    {
      name: "Chaos",
      rgb: randomRGB(),
      players: [chaos],
      hidden: false
    },
    {
      name: "Wallux",
      rgb: randomRGB(),
      players: [wallux],
      hidden: false
    },
    {
      name: "Iskes",
      rgb: randomRGB(),
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