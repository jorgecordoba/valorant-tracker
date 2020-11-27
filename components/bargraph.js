import {Bar} from 'react-chartjs-2';

export const BarGraph = (props) => {
    return (
        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
        <Bar data={props.data}  
          height={null}
          width={null}          
          options= {{maintainAspectRatio: false}} />
        </div>
    )
}