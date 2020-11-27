import {Radar} from 'react-chartjs-2';

export const RadarGraph = (props) => {
    return (
        <div style={{width: '30vw', height: '400px', margin: '2%'}}>
            <Radar data={props.data} 
                   options= {{maintainAspectRatio: false, scale: {
                              angleLines: {
                                display: false
                              },
                              ticks: {
                                suggestedMin: 60,
                                suggestedMax: 100
                              }
                            }}} 
        /></div>
    )
}