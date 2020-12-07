import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {composeAvgData, composeBodyshotGraph, composeHeadshotGraph, composeKdaGraph, composeLegshotGraph, 
  composeRadarDataSet, composeAgentsRadarDataSet, composeAvgDataSet, composeFireDetailDataSet, composeFirstBloodsDeathsDataSet} from '../utils/calculations'
import {LineGraph} from '../components/linegraph'
import { BarGraph } from '../components/bargraph';
import { GroupedBarGraph } from '../components/groupedbargraph';
import { RadarGraph } from '../components/radargraph';
import { StatsTable } from '../components/statsTable';
import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment-timezone';
import { getProfiles } from '../utils/dataLayer';
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay'
import { useRouter } from 'next/router'

export async function getApiData(dateStart, dateEnd) {
  var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  let path = `${full}/api/data?dateStart=${dateStart}&dateEnd=${dateEnd}`
  const res = await axios.get(path, {
    headers: {
      'TRN-Api-Key': '203c55ac-fb74-4fde-a3ce-20cd70661d4a',
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json'
    },

  })
  return res.data
}

async function getData(dateStart, dateEnd, func) {
  const profiles = await func(dateStart, dateEnd)

  const avgData = composeAvgData(profiles)
  const kda = composeKdaGraph(profiles)
  const headshots = composeHeadshotGraph(profiles)
  const bodyshots = composeBodyshotGraph(profiles)
  const legshots = composeLegshotGraph(profiles)

  return (
    {
      kda,
      headshots,
      bodyshots,
      legshots,
      avgData
    }
  )
}

export async function getStaticProps() {

  const dateStart = moment().tz('Europe/Madrid').startOf('day').add(-12, 'days')
  const dateEnd = moment().tz('Europe/Madrid').startOf('day')
  const props = await getData(dateStart.format('YYYY-MM-DD'), dateEnd.format('YYYY-MM-DD'), getProfiles)

  return {
    props,
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 100, // In seconds
  }
}

export default function Home(props) {  

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate()-12)));
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState(props)
  const [active, setActive] = useState(false)
  const onChange = () => {
      setActive(true);
      getData(startDate,endDate, getApiData).then(p => {setData(p);setActive(false)})
    }

    /*
  let queryStartDate = startDate
  let queryEndDate = endDate

  if (router.query.startDate)
    queryStartDate = Date.parse(router.query.startDate)
  if (router.query.endDate)
    queryEndDate = Date.parse(router.query.endDate)

  let changed = false
  if (router.query.startDate && router.query.startDate != startDate){
    console.log('Change date ' + router.query.startDate)
    setStartDate(router.query.startDate)
    changed = true
  }

  if (router.query.endDate && router.query.endDate != endDate) {
    setEndDate(router.query.endDate)
    changed = true
  }

  if (changed) {
    onChange()
  }

  */

  return (
    <LoadingOverlay
      active={active}
      spinner
      text='Loading...'
    >
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
          <div>
            Start: 
          <DatePicker 
            selected={startDate}
            onChange={(start) => setStartDate(start)}
            startDate={startDate}
             /></div>
          <div>End: 
            <DatePicker
              selected={endDate}
              onChange={(end) => setEndDate(end)}
              endDate={endDate}
              />
            </div>
          <div>
          <button type="button" onClick={p => onChange()}>Apply</button>
          </div>
          </div>

      <div className={styles.grid}>
        <LineGraph data={data.kda} title= 'KDA Ratio' />
        <LineGraph data={data.headshots} title= '% Headshots' />
        <LineGraph data={data.bodyshots} title= '% Bodyshots' />
        <LineGraph data={data.legshots} title= '% Podología' />
       
        <BarGraph data={composeAvgDataSet(data.avgData, "Score", p => p.avgScore)} />
        <BarGraph data={composeAvgDataSet(data.avgData, "Score per round", p => p.avgScorePerRound)} />
        <BarGraph data={composeAvgDataSet(data.avgData, "Econ Rating", p => p.avgEconRating)} />
        <BarGraph data={composeAvgDataSet(data.avgData, "KDA", p => p.avgKda)} />
    
        {composeRadarDataSet(data.avgData).map(p => (<RadarGraph key={p.datasets[0].label} data={p} />))}
        {composeAgentsRadarDataSet(data.avgData).map(p => (<RadarGraph key={p.datasets[0].label} data={p} />))}      

        <StatsTable data={data.avgData} />

        <GroupedBarGraph data={composeFireDetailDataSet(data.avgData, p => p.headshots, p => p.bodyshots, p => p.legshots)} />
        <GroupedBarGraph data={composeFirstBloodsDeathsDataSet(data.avgData, p => p.firstBloods / p.nmatches, p => p.deathsFirst / p.nmatches)} />

        </div>
      </main>
    </div>
    </LoadingOverlay>
  )
}
