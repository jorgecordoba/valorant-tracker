import Head from 'next/head'
import styles from '../styles/Home.module.css'
import axios from 'axios';
import {Line} from 'react-chartjs-2';
import {Bar} from 'react-chartjs-2';
import { execOnce } from 'next/dist/next-server/lib/utils';

function getKda(info, dateOffset) {
  let date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
  let matches = info.matches.filter(match => match.metadata.timestamp.slice(0,10) == date)
  const sumKda = matches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / matches.length
  return avgKda;
}

function getAvg(info) {
  const matches = info.matches.filter(m => m.metadata.modeName == "Competitive");
  const name = info.requestingPlayerAttributes.platformUserIdentifier;
  
  const sumKda = matches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / matches.length

  const sumScore = matches.reduce((current, match) => match.segments[0].stats.score.value + current, 0);
  const avgScore = sumScore / matches.length;

  const econRating = matches.reduce((current, match) => match.segments[0].stats.econRating.value + current, 0);
  const avgEconRating = econRating / matches.length;
 
  const sumScorePerRound = matches.reduce((current, match) => match.segments[0].stats.scorePerRound.value + current, 0);
  const avgScorePerRound = sumScorePerRound / matches.length;

  const nmatches = matches.length;

  return {name, avgKda, avgScore, avgEconRating, avgScorePerRound, nmatches};
}

function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

function composePlayerKdaDataSet(info) {
  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let r = randomBetween(0,255)
  let g = randomBetween(0,255)
  let b = randomBetween(0,255)
  return (
  {
    label: info.requestingPlayerAttributes.platformUserIdentifier,
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
    data: [getKda(info,-6), getKda(info,-5), getKda(info,-4), getKda(info,-3), getKda(info,-2), getKda(info,-1), getKda(info,0)]
  }
  )
}

function composeKdaGraph(players) {
  const data = {
    labels: ['-6', '-5', '-4', '-3', '-2', '-1', 'Today'],
    datasets: players.map( player => composePlayerKdaDataSet(player)
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

export async function getStaticProps() {
  const players = [await getPlayerData('Broker%236969'), 
  await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime'),
  await getPlayerData('Zehcnas%23666'),
  await getPlayerData('Wallux%23wal'),
  await getPlayerData('Iskes%235895')];

  const avgData = [getAvg(players[0]), getAvg(players[1]), getAvg(players[2]), getAvg(players[3]), getAvg(players[4])];

  const kda = composeKdaGraph(players)

  return {
    props: {
      kda,
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
      data: props.avgData.map(m => m.avgScore)
    }]  
  };

  const dataEcon = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "ECON RATING",
      data: props.avgData.map(m => m.avgEconRating)
    }]  
  };

  const dataKda = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "KDA",
      data: props.avgData.map(m => m.avgKda)
    }]  
  };

  const dataScorePerRound = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "SCORE PER ROUND",
      data: props.avgData.map(m => m.avgScorePerRound)
    }]  
  };

  const dataMatches = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "MATCHES",
      data: props.avgData.map(m => m.nmatches)
    }]  
  };

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

        <Line
          data={props.kda}
          width={200}
          height={200}
        />

        <Bar data={dataScore} />

        <Bar data={dataScorePerRound} />

        <Bar data={dataEcon} />

        <Bar data={dataKda} />
        
        <Bar data={dataMatches} />

        <Table data={props.avgData} />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
