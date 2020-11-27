import React from "react";
import { useSortBy, useTable } from 'react-table'

export const StatsTable = (props) => {
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
          data: React.useMemo(() => props.data, []),
          initialState: {
            sortBy: [{ id: 'avgKda', desc: true }]
          }
        }, useSortBy)

    return (
    <div style={{width: '30vw', height: '400px', margin: '2%'}}>
    <table {...getTableProps()} style={{ border: 'solid 1px black', 'border-spacing': 0, width: '80%', margin: 'auto' }}>
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