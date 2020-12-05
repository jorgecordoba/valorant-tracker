import {Line} from 'react-chartjs-2';
import styles from '../styles/Home.module.css'

export const LineGraph = (props) => {
    return (
        <div className={styles.card}>
            
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