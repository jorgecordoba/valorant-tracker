import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useSortBy, useTable } from 'react-table'
import React from "react";
import {composeAvgData, composeBodyshotGraph, composeHeadshotGraph, composeKdaGraph, composeLegshotGraph, composeRadarDataSet, composeAvgDataSet} from '../utils/calculations'
import {LineGraph} from '../components/linegraph'
import { BarGraph } from '../components/bargraph';
import { RadarGraph } from '../components/radargraph';
import {getProfiles} from '../utils/dataLayer'

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
        <LineGraph data={props.kda} title= 'KDA Ratio' />
        <LineGraph data={props.headshots} title= '% Headshots' />
        <LineGraph data={props.bodyshots} title= '% Bodyshots' />
        <LineGraph data={props.legshots} title= '% Podología' />
       
        <BarGraph data={composeAvgDataSet(props.avgData, p => p.avgScore)} />
        <BarGraph data={composeAvgDataSet(props.avgData, p => p.avgScorePerRound)} />
        <BarGraph data={composeAvgDataSet(props.avgData, p => p.avgEconRating)} />
        <BarGraph data={composeAvgDataSet(props.avgData, p => p.avgKda)} />
    
        {composeRadarDataSet(props.avgData).map(p => (<RadarGraph data={p} />))}    

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
