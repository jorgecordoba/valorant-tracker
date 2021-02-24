import React, { useState } from "react";
import { useSortBy, useTable } from 'react-table'
import styles from '../styles/Home.module.css'
import moment from 'moment-timezone';

export const LastMatchTable = (props) => {
    const [index, setIndex] = useState(0)

    let dates = [...Object.keys(props.data)]
    dates.sort( (a,b) => {
      if (moment(a).isBefore(moment(b)))
        return 1
      else
        return -1
    })            

    let filteredData = props.data[dates[index]]
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
              Header: 'Pos',
              accessor: 'placement',
              sortType: 'alphanumeric'
            },
            {
              Header: 'Result',
              accessor: 'kda',              
            },
            {
              Header: 'KDA',
              accessor: 'kdaRatio',
              sortType: 'alphanumeric'
            },            
            {
              Header: 'Hs',
              accessor: 'headshots',
              sortType: 'alphanumeric'
            },
            {
              Header: 'LS',
              accessor: 'legshots',
              sortType: 'alphanumeric'
            }
          ], []),
          data: React.useMemo(() => filteredData, filteredData),
          initialState: {
            sortBy: [{ id: 'placement', desc: false }]
          }
        }, useSortBy)

    return (      
    <div className={styles.top}>
      <div></div>
      <div style={{textAlign:"center", marginBottom:"1rem"}}><h4><a href='#' onClick={() => setIndex(index < dates.length -1 ? index + 1 : index)}>&lt;&lt;</a> {index == 0 ? 'Last Match' : moment(dates[index]).format('YYYY-MM-DD HH:mm')} - Result: {props.data[dates[index]][0].result} <a href='#' onClick={() => setIndex(index > 0 ? index -1: index)}>&gt;&gt;</a></h4></div>    
    <table {...getTableProps()} style={{ border: 'solid 1px black', borderSpacing: 0, margin: 'auto' }}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()} style={{ border: 'solid 1px black', textAlign: "center" }}>
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