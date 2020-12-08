import React from "react";
import { useSortBy, useTable } from 'react-table'
import styles from '../styles/Home.module.css'
import moment from 'moment-timezone';

export const LastMatchTable = (props) => {
    let filteredData = props.data.filter(p => p.kda != null).sort((p,q) =>  moment(p.date).isAfter(q))
    let date = filteredData[0].date
    filteredData = filteredData.filter(p => p.date == date)
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
              Header: 'Score',
              accessor: 'score',
              sortType: 'alphanumeric'
            },
            {
              Header: 'KDA',
              accessor: 'kda',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Headshots',
              accessor: 'headshots',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Podología',
              accessor: 'legshots',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Result',
              accessor: 'result',
              sortType: 'alphanumeric'
            },
          ], []),
          data: React.useMemo(() => filteredData, filteredData),
          initialState: {
            sortBy: [{ id: 'score', desc: true }]
          }
        }, useSortBy)

    return (
    <div className={styles.top}><div style={{textAlign:"center", marginBottom:"1rem"}}>Last Match</div>
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