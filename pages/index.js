import Head from 'next/head'
import styles from '../styles/Home.module.css'
import axios from 'axios';
import {Bar, Line, Radar} from 'react-chartjs-2';
import { execOnce } from 'next/dist/next-server/lib/utils';
import { useSortBy, useTable } from 'react-table'
import React from "react";

function getKda(profile, dateOffset) {
  const date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
  const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
  let profileMatches = profilePlayers.map(p => p.matches).flat().filter(m => m !== undefined && m.metadata.modeName == "Competitive");

  profileMatches = profileMatches.filter(match => match.metadata.timestamp.slice(0,10) == date)
  const sumKda = profileMatches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / profileMatches.length
  return avgKda;
}

function getAvg(profile) {

  const name = profile.name;
  const rgb = profile.rgb;

  const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
  const profileMatches = profilePlayers.map(p => p.matches).flat().filter(m => m !== undefined && m.metadata.modeName == "Competitive");
    
  const sumKda = profileMatches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
  const avgKda = sumKda / profileMatches.length

  const sumScore = profileMatches.reduce((current, match) => match.segments[0].stats.score.value + current, 0);
  const avgScore = sumScore / profileMatches.length;

  const econRating = profileMatches.reduce((current, match) => match.segments[0].stats.econRating.value + current, 0);
  const avgEconRating = econRating / profileMatches.length;
 
  const sumScorePerRound = profileMatches.reduce((current, match) => match.segments[0].stats.scorePerRound.value + current, 0);
  const avgScorePerRound = sumScorePerRound / profileMatches.length;

  const nmatches = profileMatches.length;  

  return {name, rgb, avgKda, avgScore, avgEconRating, avgScorePerRound, nmatches};
}

function randomRGB() {
  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  let r = randomBetween(0,255)
  let g = randomBetween(0,255)
  let b = randomBetween(0,255)
  return {r,g,b}
}

function composePlayerDataSet(profile, func) {

  return (
  {
    label: profile.name,
    fill: false,
    lineTension: 0.1,
    backgroundColor: `rgba(${profile.rgb.r},${profile.rgb.g},${profile.rgb.b},0.4)`,
    borderColor: `rgba(${profile.rgb.r},${profile.rgb.g},${profile.rgb.b},1)`,
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: `rgba(${profile.rgb.r},${profile.rgb.g},${profile.rgb.b},1)`,
    pointBackgroundColor: '#fff',
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    spanGaps: true,
    data: [func(profile,-9), func(profile,-8), func(profile,-7), func(profile,-6), func(profile,-5), func(profile,-4), func(profile,-3), func(profile,-2), func(profile,-1), func(profile,0)]
  }
  )
}

function composePlayerAccuracy(profile, dateOffset) {
  const date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
  const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
  const profileMatches = profilePlayers.map(p => p.matches).flat().filter(m => m !== undefined && m.metadata.modeName == "Competitive" && m.metadata.timestamp.slice(0,10) == date);

  const headshots = profileMatches.reduce((current, match) => match.segments[0].stats.dealtHeadshots.value + current, 0);
  const bodyshots = profileMatches.reduce((current, match) => match.segments[0].stats.dealtBodyshots.value + current, 0);
  const legshots = profileMatches.reduce((current, match) => match.segments[0].stats.dealtLegshots.value + current, 0);
  const totalShots = headshots + bodyshots + legshots;
  const pHeadshots = headshots * 100 / totalShots
  const pBodyshots = bodyshots * 100 / totalShots
  const pLegshots = legshots * 100 / totalShots  

  return {pHeadshots, pBodyshots, pLegshots}
}

function getLabels() {
  return ['-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', 'Today']
}

function composeKdaGraph(profiles) {
  const data = {
    labels: getLabels(),
    datasets: profiles.map( profile => composePlayerDataSet(profile, (p, o) => getKda(p,o))
    )
  };
  return data  
}

function composeHeadshotGraph(players) {
  const data = {
    labels: getLabels(),
    datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pHeadshots)
    )
  };
  return data 
}

function composeBodyshotGraph(players) {
  const data = {
    labels: getLabels(),
    datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pBodyshots)
    )
  };
  return data 
}

function composeLegshotGraph(players) {
  const data = {
    labels: getLabels(),
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

export async function getStaticProps() {

  const broker = await getPlayerData('Broker%236969')
  const neuras = await getPlayerData('Neuras%234402')
  const ikeric = await getPlayerData('Ikeric%235421')
  const zeki = await getPlayerData('Zehcnas%23666')
  const chaos = await getPlayerData('%CE%9E%CE%94%CE%9E%20Chaos%23Prime')
  const wallux = await getPlayerData('Wallux%23wal')
  const iskes = await getPlayerData('Iskes%235895')
  
  const profiles = [
    {
      name: "Broker",
      rgb: randomRGB(),
      players: [broker]
    },
    {
      name: "Neuras",
      rgb: randomRGB(),
      players: [neuras]
    },
    {
      name: "Ikeric",
      rgb: randomRGB(),
      players: [ikeric]
    },
    {
      name: "Zehcnas",
      rgb: randomRGB(),
      players: [zeki]
    },
    {
      name: "Chaos",
      rgb: randomRGB(),
      players: [chaos]
    },
    {
      name: "Wallux",
      rgb: randomRGB(),
      players: [wallux]
    },
    {
      name: "Iskes",
      rgb: randomRGB(),
      players: [iskes]
    },
  ];

  const avgData = profiles.map( p => getAvg(p));
  const kda = composeKdaGraph(profiles)
  const headshots = composeHeadshotGraph(profiles)
  const bodyshots = composeBodyshotGraph(profiles)
  const legshots = composeLegshotGraph(profiles)

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
      backgroundColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataEcon = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "ECON RATING",
      data: props.avgData.map(m => m.avgEconRating),
      backgroundColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataKda = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "KDA",
      data: props.avgData.map(m => m.avgKda),
      backgroundColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataScorePerRound = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "SCORE PER ROUND",
      data: props.avgData.map(m => m.avgScorePerRound),
      backgroundColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},1)`),
      borderWidth: 1,
    }]  
  };

  const dataMatches = {
    labels: props.avgData.map(m => m.name),
    datasets: [{
      label: "MATCHES",
      data: props.avgData.map(m => m.nmatches),
      backgroundColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},0.4)`),
      borderColor: props.avgData.map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},1)`),
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
      backgroundColor: `rgba(${p.rgb.r},${p.rgb.g},${p.rgb.b},0.4)`,
      data: [p.avgEconRating * 100 / maxEcon, 
             p.avgKda * 100 / maxKda, 
             p.avgScore * 100 / maxScore,
             p.avgScorePerRound * 100 / maxScorePerRound]
    }]
    })
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns : React.useMemo( () => [
        { 
          Header: 'Name',
          accessor: 'name',
          sortType: 'basic'
        },
        {
          Header: 'KDA Average',
          accessor: 'avgKda',
          sortType: 'basic'
        },
        {
          Header: 'Round Average',
          accessor: 'avgScorePerRound',
          sortType: 'basic'
        },
        {
          Header: 'Score Average',
          accessor: 'avgScore',
          sortType: 'basic'
        }
      ], []),
      data: React.useMemo(() => props.avgData, []),
      initialState: {
        sortBy: [{ id: 'avgKda', desc: true }]
      }
    }, useSortBy)

  
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
        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
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

        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
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

        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
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

        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
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

        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
        <Bar data={dataScore}  
          height={null}
          width={null}          
          options= {{maintainAspectRatio: false}} />
        </div>

        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
        <Bar data={dataScorePerRound}
             height={null}
             width={null}          
             options= {{maintainAspectRatio: false}} />
        </div>

        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
        <Bar data={dataEcon} 
             height={null}
             width={null}          
             options= {{maintainAspectRatio: false}}/>
        </div>
        
        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
        <Bar data={dataKda} 
             height={null}
             width={null}          
             options= {{maintainAspectRatio: false}}/>
        </div>        
        {radars.map(p => (<div style={{width: '30vw', height: '400px', margin: '2%'}}><Radar data={p} options= {{maintainAspectRatio: false, scale: {
            angleLines: {
                display: false
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 100
            }
        }}} 
        /></div>))}    

        <table {...getTableProps()} style={{ border: 'solid 1px black', 'border-spacing': 0 }}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()} style={{ border: 'solid 1px black' }}>
                    {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ border: 'solid 1px black' }}>                          
                        {column.render('Header')}
                          <span>
                            {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                          </span>
                        </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                  prepareRow(row)
                  return (
                    <tr {...row.getRowProps()} >
                      {row.cells.map(cell => {
                        return (
                          <td {...cell.getCellProps()} style={{ border: 'solid 1px black', padding: '0.5rem' }}>
                            {cell.render('Cell')}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>  

        </div>
      </main>
    </div>
  )
}
