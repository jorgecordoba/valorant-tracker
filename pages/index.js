import Head from 'next/head'
import styles from '../styles/Home.module.css'
import axios from 'axios';
import {Line} from 'react-chartjs-2';

function getKda(info, dateOffset) {
  let date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
  let matches = info.matches.filter(match => match.metadata.timestamp.slice(0,10) == date)
  
  const sumKda = matches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / matches.length
  return avgKda;
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
  console.log(info)
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
  console.log(path)
  const res = await axios.get(path, {
    headers: {
      'TRN-Api-Key': '203c55ac-fb74-4fde-a3ce-20cd70661d4a',
      'Accept': 'application/json'
    },

  })
  console.log(res)
  return res.data.data
}

export async function getStaticProps() {

  const kda = composeKdaGraph(
    [await getPlayerData('Broker%236969'), 
     await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime'),
     await getPlayerData('Zehcnas%23666'),
     await getPlayerData('Wallux%23wal'),
     await getPlayerData('Iskes%235895')])

  return {
    props: {
      kda,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 100, // In seconds
  }
}

export default function Home(props) {
  console.log(props)
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
          options={{ maintainAspectRatio: false }}
        />
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
