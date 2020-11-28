import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {composeAvgData, composeBodyshotGraph, composeHeadshotGraph, composeKdaGraph, composeLegshotGraph, composeRadarDataSet, composeAvgDataSet} from '../utils/calculations'
import {LineGraph} from '../components/linegraph'
import { BarGraph } from '../components/bargraph';
import { RadarGraph } from '../components/radargraph';
import {getProfiles} from '../utils/dataLayer'
import { StatsTable } from '../components/statsTable';

export async function getStaticProps() {

  const profiles = await getProfiles()

  const avgData = composeAvgData(profiles)
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
        <p><a href="/weekly">Weekly Stats</a></p>

      <div className={styles.grid}>
        <LineGraph data={props.kda} title= 'KDA Ratio' />
        <LineGraph data={props.headshots} title= '% Headshots' />
        <LineGraph data={props.bodyshots} title= '% Bodyshots' />
        <LineGraph data={props.legshots} title= '% Podología' />
       
        <BarGraph data={composeAvgDataSet(props.avgData, "Score", p => p.avgScore)} />
        <BarGraph data={composeAvgDataSet(props.avgData, "Score per round", p => p.avgScorePerRound)} />
        <BarGraph data={composeAvgDataSet(props.avgData, "Econ Rating", p => p.avgEconRating)} />
        <BarGraph data={composeAvgDataSet(props.avgData, "KDA", p => p.avgKda)} />
    
        {composeRadarDataSet(props.avgData).map(p => (<RadarGraph key={p.datasets[0].label} data={p} />))}            

        <StatsTable data={props.avgData} />

        </div>
      </main>
    </div>
  )
}
