import Head from 'next/head'
import styles from '../styles/Home.module.css'
import axios from 'axios';
import {Line, Radar} from 'react-chartjs-2';
import {Bar} from 'react-chartjs-2';
import { execOnce } from 'next/dist/next-server/lib/utils';

function getKda(info, dateOffset) {
  let date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
  let matches = info.matches.filter(m => m.metadata.modeName == "Competitive");
  matches = matches.filter(match => match.metadata.timestamp.slice(0,10) == date)
  const sumKda = matches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / matches.length
  return avgKda;
}

function getAvg(info) {
  const matches = info.matches.filter(m => m.metadata.modeName == "Competitive");
  const name = parseName(info.requestingPlayerAttributes.platformUserIdentifier);
  const profile = info.profile;
  
  const sumKda = matches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / matches.length

  const sumScore = matches.reduce((current, match) => match.segments[0].stats.score.value + current, 0);
  const avgScore = sumScore / matches.length;

  const econRating = matches.reduce((current, match) => match.segments[0].stats.econRating.value + current, 0);
  const avgEconRating = econRating / matches.length;
 
  const sumScorePerRound = matches.reduce((current, match) => match.segments[0].stats.scorePerRound.value + current, 0);
  const avgScorePerRound = sumScorePerRound / matches.length;

  const nmatches = matches.length;  

  return {name, profile, avgKda, avgScore, avgEconRating, avgScorePerRound, nmatches};
}

function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

function parseName(name){
  return name.substr(0, name.indexOf('#'))
}

function composePlayerDataSet(info, func) {
  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let r = randomBetween(0,255)
  let g = randomBetween(0,255)
  let b = randomBetween(0,255)

  r = info.profile.color.r
  g = info.profile.color.g
  b = info.profile.color.b

  return (
  {
    label: parseName(info.requestingPlayerAttributes.platformUserIdentifier),
    fill: false,
    lineTension: 0.1,
    backgroundColor: `rgba(${r},${g},${b},0.4)`,
    borderColor: `rgba(${r},${g},${b},1)`,
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: `rgba(${r},${g},${b},1)`,
    pointBackgroundColor: '#fff',
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    spanGaps: true,
    data: [func(info,-6), func(info,-5), func(info,-4), func(info,-3), func(info,-2), func(info,-1), func(info,0)]
  }
  )
}

function composePlayerAccuracy(info, dateOffset) {
  let date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
  let matches = info.matches.filter(m => m.metadata.modeName == "Competitive" && m.metadata.timestamp.slice(0,10) == date);

  const headshots = matches.reduce((current, match) => match.segments[0].stats.dealtHeadshots.value + current, 0);
  const bodyshots = matches.reduce((current, match) => match.segments[0].stats.dealtBodyshots.value + current, 0);
  const legshots = matches.reduce((current, match) => match.segments[0].stats.dealtLegshots.value + current, 0);
  const totalShots = headshots + bodyshots + legshots;
  const pHeadshots = headshots * 100 / totalShots
  const pBodyshots = bodyshots * 100 / totalShots
  const pLegshots = legshots * 100 / totalShots  

  return {pHeadshots, pBodyshots, pLegshots}
}

function composeKdaGraph(players) {
  const data = {
    labels: ['-6', '-5', '-4', '-3', '-2', '-1', 'Today'],
    datasets: players.map( player => composePlayerDataSet(player, (p, o) => getKda(p,o))
    )
  };
  return data  
}

function composeHeadshotGraph(players) {
  const data = {
    labels: ['-6', '-5', '-4', '-3', '-2', '-1', 'Today'],
    datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pHeadshots)
    )
  };
  return data 
}

function composeBodyshotGraph(players) {
  const data = {
    labels: ['-6', '-5', '-4', '-3', '-2', '-1', 'Today'],
    datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pBodyshots)
    )
  };
  return data 
}

function composeLegshotGraph(players) {
  const data = {
    labels: ['-6', '-5', '-4', '-3', '-2', '-1', 'Today'],
    datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pLegshots)
    )
  };
  return data 
}

async function getPlayerData(player) {
  let path = `https://api.tracker.gg/api/v2/valorant/rap-matches/riot/${player}?type=competitive&next=null`
  const res = await axios.get(path, {
    headers: {
      'TRN-Api-Key': '203c55ac-fb74-4fde-a3ce-20cd70661d4a',
      'Accept': 'application/json'
    },

  })
  return res.data.data
}

export async function mergePlayerData(player1, player2) {
  if (player1 && player2 && player1.matches && player2.matches) {
    player1.matches = new Map([...player1.matches, ...player2.matches])
  }
  
  return player1
}

function generateProfileColors(players) {

  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  players.forEach(player => {
    let profile = {
      color: {
        r: randomBetween(0,255),
        g: randomBetween(0,255),
        b: randomBetween(0,255),
      }
    }
    player.profile = profile
  });

}

export async function getStaticProps() {

  const broker = await getPlayerData('Broker%236969')
  const ikerik = await getPlayerData('Ikeric%235421')
  const players = [await mergePlayerData(broker, ikerik), 
  await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime'),
  await getPlayerData('Zehcnas%23666'),
  await getPlayerData('Wallux%23wal'),
  await getPlayerData('Iskes%235895')];

  generateProfileColors(players);

  const avgData = [getAvg(players[0]), getAvg(players[1]), getAvg(players[2]), getAvg(players[3]), getAvg(players[4])];

  const kda = composeKdaGraph(players)
  const headshots = composeHeadshotGraph(players)
  const bodyshots = composeBodyshotGraph(players)
  const legshots = composeLegshotGraph(players)

  return {
    props: {
      kda,
      headshots,
      bodyshots,
      legshots,
      avgData
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 100, // In seconds
  }
}

export default function Home(props) {
  const TableRow = ({row}) => (
    <tr>
      <td>{row.name}</td>
      <td>{row.avgScore}</td>      
    </tr>
  );

  const Table = ({data}) => (
    <table>
      {data.map(row => {
        <TableRow row={row} />
      })}
    </table>
  );

  const dataScore = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "AVG SCORE",
      data: props.avgData.map(m => m.avgScore),
      backgroundColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataEcon = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "ECON RATING",
      data: props.avgData.map(m => m.avgEconRating),
      backgroundColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataKda = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "KDA",
      data: props.avgData.map(m => m.avgKda),
      backgroundColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataScorePerRound = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "SCORE PER ROUND",
      data: props.avgData.map(m => m.avgScorePerRound),
      backgroundColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataMatches = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "MATCHES",
      data: props.avgData.map(m => m.nmatches),
      backgroundColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.profile.color.r},${m.profile.color.g},${m.profile.color.b},1)`),
      borderWidth: 1,
    }]  
  };

  
  const maxEcon = Math.max.apply(Math, props.avgData.map(function(o) { return o.avgEconRating; }))  
  const maxKda = Math.max.apply(Math, props.avgData.map(function(o) { return o.avgKda; }))
  const maxScore = Math.max.apply(Math, props.avgData.map(function(o) { return o.avgScore; }))
  const maxScorePerRound = Math.max.apply(Math, props.avgData.map(function(o) { return o.avgScorePerRound; }))

  const radars = props.avgData.map(p => ({
    labels: ['Econ Rating', 'KDA', 'Score', 'Score per Round'],
    datasets: [{
      label: p.name,
      backgroundColor: `rgba(${p.profile.color.r},${p.profile.color.g},${p.profile.color.b},0.4)`,
      data: [p.avgEconRating * 100 / maxEcon, 
             p.avgKda * 100 / maxKda, 
             p.avgScore * 100 / maxScore,
             p.avgScorePerRound * 100 / maxScorePerRound]
    }]
    })
  )
  
  console.log(JSON.stringify(radars))
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Valorant Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Valorant Tracker
        </h1>

      <div className={styles.grid}>
        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Line
          data={props.kda}
          height={null}
          width={null}          
          options= {{title: {
                      display: true,
                      text: 'KDA Ratio'
           }, maintainAspectRatio: false, responsive: true}}
        />
        </div>

        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Line
          data={props.headshots}
          height={null}
          width={null}          
          options= {{title: {
                      display: true,
                      text: '% Headshots'
           }, maintainAspectRatio: false, responsive: true}}
        />
        </div>

        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Line
          data={props.bodyshots}
          height={null}
          width={null}          
          options= {{title: {
                      display: true,
                      text: '% Bodyshots'
           }, maintainAspectRatio: false}}
        />
        </div>

        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Line
          data={props.legshots}
          height={null}
          width={null}          
          options= {{title: {
                      display: true,
                      text: '% Podología'
           }, maintainAspectRatio: false}}
        />
        </div>

        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Bar data={dataScore}  
          height={null}
          width={null}          
          options= {{maintainAspectRatio: false}} />
        </div>

        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Bar data={dataScorePerRound}
             height={null}
             width={null}          
             options= {{maintainAspectRatio: false}} />
        </div>

        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Bar data={dataEcon} 
             height={null}
             width={null}          
             options= {{maintainAspectRatio: false}}/>
        </div>
        
        <div style={{width: '25vw', height: '400px', margin: '8%'}}>
        <Bar data={dataKda} 
             height={null}
             width={null}          
             options= {{maintainAspectRatio: false}}/>
        </div>        
          {radars.map(p => (<div style={{width: '25vw', height: '400px', margin: '8%'}}><Radar data={p} options= {{maintainAspectRatio: false, scale: {
              angleLines: {
                  display: false
              },
              ticks: {
                  suggestedMin: 60,
                  suggestedMax: 100
              }
          }}} 
          /></div>))}                  
        </div>
      </main>
    </div>
  )
}
