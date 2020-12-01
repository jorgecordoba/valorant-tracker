import Head from 'next/head';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { LineGraph } from '../components/linegraph'
import moment from 'moment'

function startOfWeek(date) {
    date.setHours(6, 0, 0);
    const diff = date.getDate() - date.getDay() + 1 - 7;
    date.setDate(diff);
    return date.toJSON();
}

function endOfWeek(date) {
    date.setHours(6, 0, 0);
    var diff = date.getDate() - date.getDay() + 8 - 7;
    date.setDate(diff);
    return date.toJSON();
}

async function getData(from, to) {
    
    const url = 'https://valorant-avg-2.azurewebsites.net/api/GetMatches?code=molHze/1j3JjruEOj2/xYFZa94rlbadXqGbV1haKL2EAcXyGGwb2XQ==&from=' + from + '&to=' + to;
    console.log(url);
    const res = await axios.get(url, {
        headers: {
            'Accept': 'application/json'
        },
    });

    return res.data[0];
}

export async function getStaticProps() {
    const from = startOfWeek(new Date());
    const to = endOfWeek(new Date());
    const data = await getData(from, to);
    
    const monMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(1, 'days'));
    const tueMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(2, 'days'));
    const wedMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(3, 'days'));
    const thuMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(4, 'days'));
    const friMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(5, 'days'));
    const satMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(6, 'days'));
    const sunMatches = data.map(m => moment(m.Metadata.Timestamp) < moment(from).add(7, 'days'));

    

    return {
        props: {
            data
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
            </main>
        </div>
    )
}
