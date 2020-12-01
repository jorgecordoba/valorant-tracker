import {Bar} from 'react-chartjs-2';
import styles from '../styles/Home.module.css'

export const GroupedBarGraph = (props) => {
    return (
        <div className={styles.card}>
        <Bar data={props.data}  
          height={null}
          width={null}          
          options= {{maintainAspectRatio: false}} />
        </div>
    )
}