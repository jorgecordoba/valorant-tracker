import Head from 'next/head';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { LineGraph } from '../components/linegraph'
import { randomRGB } from '../utils/dataLayer';

async function getData() {
    const url = 'https://valorant-avg-2.azurewebsites.net/api/GetWeekStats?code=2JLGqD1qVvtZBuvxG3rzWSgX47hMPXnq6AQmjmVYeSrdp/fiOOHRUQ==';

    const res = await axios.get(url, {
        headers: {
            'Accept': 'application/json'
        },
    });

    return res.data;
}

export async function getStaticProps() {
    const data = await getData();
    const kda = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: data.stats.map(p => {
            const color = randomRGB();
            return {
                label: p.name,
                fill: false,
                lineTension: 0.1,
                backgroundColor: `rgba(${color.r},${color.g},${color.b},0.4)`,
                borderColor: `rgba(${color.r},${color.g},${color.b},1)`,
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: `rgba(${color.r},${color.g},${color.b},1)`,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                spanGaps: true,
                data: p.kda
            }
        })
    };

    return {
        props: {
            kda
        },
        revalidate: 100
    }
}

export default function Home(props) {
    return (
        <div className={styles.container}>
            <Head>
                <title>Valorant Tracker</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Weekly Stats
                </h1>
                <div className={styles.grid}>
                    <LineGraph data={props.kda} title='KDA Ratio' />
                </div>
            </main>
        </div>
    )
}
