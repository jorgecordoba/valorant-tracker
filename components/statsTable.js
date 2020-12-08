import React from "react";
import { useSortBy, useTable } from 'react-table'
import styles from '../styles/Home.module.css'

export const StatsTable = (props) => {
    let filteredData = props.data.filter(p => !p.hidden)
    let {
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
              Header: 'KDA Avg',
              accessor: 'avgKda',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Kda Dev',
              accessor: 'kdaStandardDev',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Round Average',
              accessor: 'avgScorePerRound',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Score Average',
              accessor: 'avgScore',
              sortType: 'alphanumeric'
            }
          ], []),
          data: React.useMemo(() => filteredData, filteredData),
          initialState: {
            sortBy: [{ id: 'avgKda', desc: true }]
          }
        }, useSortBy)

    return (
    <div className={styles.top}><div style={{textAlign:"center", marginBottom:"1rem"}}>Average Stats</div>
    <table {...getTableProps()} style={{ border: 'solid 1px black', borderSpacing: 0, margin: 'auto' }}>
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
    );
}