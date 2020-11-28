import Head from 'next/head';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { LineGraph } from '../components/linegraph'

async function getData() {
    const url = `https://valorant-avg-2.azurewebsites.net/api/GetCalculatedStats?code=nvvFcWjE4vfbFRkFkvbWq3YE8wEcfR5SYhaPsygpw7/i7SbktkmN9g==`
    const res = await axios.get(url, {
        headers: {
            'Accept': 'application/json'
        },
    });

    return res.data[0];
}

function getYearKdaData(weeklyData) {
    const data = [];
    for (var i = 1; i <= 52; i++) {
        var week = weeklyData.find(x => x.Week == i);
        if (week) {
            data.push(week.Kda);
        } else {
            data.push(null);
        }
    }

    return data;
}

export async function getStaticProps() {
    const data = await getData();
    const labels = [];
    for(var i = 1; i <= 52; i++) {
        labels.push(i);
    }

    const weeklyKda = {
        labels: labels,
        datasets: data.Stats.map(player => {
            return {
                label: player.Name,
                fill: false,
                data: getYearKdaData(player.Weekly)
            }
        })
    }

    return {
        props: {
            data,
            weeklyKda
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
                    <LineGraph 
                    data={props.weeklyKda} 
                    title='KDA Ratio' 
                    width={900}
                    />
                </div>
            </main>
        </div>
    )
}
