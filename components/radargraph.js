import {Radar} from 'react-chartjs-2';
import styles from '../styles/Home.module.css'

export const RadarGraph = (props) => {
    return (
        <div className={styles.card}>
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