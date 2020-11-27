import {Line} from 'react-chartjs-2';

export const LineGraph = (props) => {
    return (
        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
        <Line
          data={props.data}
          height={null}
          width={null}          
          options= {{title: {
                      display: true,
                      text: props.title
           }, maintainAspectRatio: false, responsive: true}}
        />
        </div>
    )
}