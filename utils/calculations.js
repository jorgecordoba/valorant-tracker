import moment from 'moment'

function isCompetitiveMatch(match) {
  return match !== undefined && match.metadata.modeName == "Competitive"
}

function isInRangeMatch(match, from, to) {
  if (match !== undefined) {
    const matchMoment = moment(match.metadata.timestamp)
    return matchMoment.isBetween(from, to);
  }
  return false; 
}

function isSameDayMatch(match, daysOffset) {  
  if (match !== undefined) {
    const offsetDay = moment().local().startOf('day').local().add(daysOffset, 'days').local()
    const matchDay= moment(match.metadata.timestamp).local().startOf('day').local()
    
    return offsetDay.isSame(matchDay)
  }
  return false;  
}

const getKda = (profile, dateOffset) => {
    const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
    let profileMatches = profilePlayers.map(p => p.matches)
      .flat().filter(match => isCompetitiveMatch(match) && isSameDayMatch(match, dateOffset));
  
    const sumKda = profileMatches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
    const avgKda = sumKda / profileMatches.length

    return avgKda;
  }
  
  const getAvg = (profile) => {
  
    const name = profile.name;
    const rgb = profile.rgb;

    const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
    const profileMatches = profilePlayers.map(p => p.matches)
      .flat().filter(match => isCompetitiveMatch(match));
      
    

    const sumKda = profileMatches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
    const avgKda = (sumKda / profileMatches.length).toFixed(2);
  
    const sumScore = profileMatches.reduce((current, match) => match.segments[0].stats.score.value + current, 0);
    const avgScore = (sumScore / profileMatches.length).toFixed(2);
  
    const econRating = profileMatches.reduce((current, match) => match.segments[0].stats.econRating.value + current, 0);
    const avgEconRating = (econRating / profileMatches.length).toFixed(2);
   
    const sumScorePerRound = profileMatches.reduce((current, match) => match.segments[0].stats.scorePerRound.value + current, 0);
    const avgScorePerRound = (sumScorePerRound / profileMatches.length).toFixed(2);    
  
    const nmatches = profileMatches.length;

    const hidden = profile.hidden
    
    const head = profileMatches.reduce((current, match) => match.segments[0].stats.dealtHeadshots.value + current, 0);
    const body = profileMatches.reduce((current, match) => match.segments[0].stats.dealtBodyshots.value + current, 0);
    const legs = profileMatches.reduce((current, match) => match.segments[0].stats.dealtLegshots.value + current, 0);
    const totalShots = head + body + legs;
    const headshots = (head * 100 / totalShots).toFixed(2);
    const bodyshots = (body * 100 / totalShots).toFixed(2);
    const legshots = (legs * 100 / totalShots).toFixed(2);

    const firstBloods = profileMatches.reduce((current, match) => match.segments[0].stats.firstBloods.value + current, 0);
    const deathsFirst = profileMatches.reduce((current, match) => match.segments[0].stats.deathsFirst.value + current, 0) * -1;

    const average = {name, rgb, avgKda, avgScore, avgEconRating, avgScorePerRound, nmatches, hidden, headshots, legshots, bodyshots, firstBloods, deathsFirst};

    console.log(JSON.stringify(average));

    return average;
  }  

  const composePlayerDataSet = (profile, func) => {

    return (
    {
      label: profile.name,
      fill: false,
      lineTension: 0.1,
      backgroundColor: `rgba(${profile.rgb.r},${profile.rgb.g},${profile.rgb.b},0.4)`,
      borderColor: `rgba(${profile.rgb.r},${profile.rgb.g},${profile.rgb.b},1)`,
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: `rgba(${profile.rgb.r},${profile.rgb.g},${profile.rgb.b},1)`,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      spanGaps: true,
      hidden: profile.hidden,
      data: [func(profile,-9), func(profile,-8), func(profile,-7), func(profile,-6), func(profile,-5), func(profile,-4), func(profile,-3), func(profile,-2), func(profile,-1), func(profile,0)]
    }
    )
  }  
  
  const getLabels = () => {
    
    const numdays = 10;
    const labels = []
    for (let index = numdays - 1; index >= 0; index--) {     
      index == 0 ? labels.push('Today') : labels.push(`-${index}`)      
    }

    return labels
  }
  
  const composePlayerAccuracy = (profile, dateOffset) => {
    const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
    const profileMatches = profilePlayers.map(p => p.matches)
      .flat().filter(match => isCompetitiveMatch(match) && isSameDayMatch(match, dateOffset))
  
    const headshots = profileMatches.reduce((current, match) => match.segments[0].stats.dealtHeadshots.value + current, 0);
    const bodyshots = profileMatches.reduce((current, match) => match.segments[0].stats.dealtBodyshots.value + current, 0);
    const legshots = profileMatches.reduce((current, match) => match.segments[0].stats.dealtLegshots.value + current, 0);
    const totalShots = headshots + bodyshots + legshots;
    const pHeadshots = headshots * 100 / totalShots
    const pBodyshots = bodyshots * 100 / totalShots
    const pLegshots = legshots * 100 / totalShots  
  
    return {pHeadshots, pBodyshots, pLegshots}
  }

  export const composeAvgData = (players) => {
    return players.map( p => getAvg(p));
  }

  export const composeKdaGraph = (players) => {
    const data = {
      labels: getLabels(),
      datasets: players.map( player => composePlayerDataSet(player, (p, o) => getKda(p,o))
      )
    };
    return data  
  }
  
  export const composeHeadshotGraph = (players) => {
    const data = {
      labels: getLabels(),
      datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pHeadshots)
      )
    };
    return data 
  }
  
  export const composeBodyshotGraph = (players) => {
    const data = {
      labels: getLabels(),
      datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pBodyshots)
      )
    };
    return data 
  }
  
  export const composeLegshotGraph = (players) => (
    {
      labels: getLabels(),
      datasets: players.map( player => composePlayerDataSet(player, (p,o) => composePlayerAccuracy(p, o).pLegshots)
      )
    }
  );
  
  export const composeAvgDataSet = (avgData, label, mapFunc) => ({ 
    labels: avgData.filter(p => !p.hidden).map(m => m.name),
    datasets: [{
      label,
      data: avgData.filter(p => !p.hidden).map(mapFunc),
      backgroundColor: avgData.filter(p => !p.hidden).map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},0.4)`),
      borderColor: avgData.filter(p => !p.hidden).map(m =>`rgba(${m.rgb.r},${m.rgb.g},${m.rgb.b},1)`),
      borderWidth: 1,      
    }] 
  });

  export const composeFireDetailDataSet = (avgData, headFunc, bodyFunc, legsFunc) => ({ 
    labels: avgData.filter(p => !p.hidden).map(m => m.name),
    datasets: [
      {
        label: 'Legshot',
        data: avgData.map(legsFunc),
        backgroundColor: `rgba(20,144,255,0.4)`,
        stack: 1,
      },     
      {
        label: 'Bodyshot',
        data: avgData.map(bodyFunc),
        backgroundColor: `rgba(255,0,0,0.4)`,
        stack: 1,
      },
      {
        label: 'Headshot',
        data: avgData.map(headFunc),
        backgroundColor: `rgba(34,139,34,0.4)`,
        stack: 1,
      }]    
  });

  export const composeFirstBloodsDeathsDataSet = (avgData, firstbloodsFunc, deathsFirstFunc) => ({ 
    labels: avgData.filter(p => !p.hidden).map(m => m.name),
    datasets: [
      {
        label: 'First Bloods',
        data: avgData.map(firstbloodsFunc),
        backgroundColor: `rgba(20,144,255,0.4)`,
        stack: 1,
      },     
      {
        label: 'Deaths First',
        data: avgData.map(deathsFirstFunc),
        backgroundColor: `rgba(255,0,0,0.4)`,
        stack: 1,
      }]   
  });
  
  export const composeRadarDataSet = (avgData) => {
    const filteredData = avgData.filter(p => !p.hidden)
    const maxEcon = Math.max.apply(Math, filteredData.map(function(o) { return o.avgEconRating; }))  
    const maxKda = Math.max.apply(Math, filteredData.map(function(o) { return o.avgKda; }))
    const maxScore = Math.max.apply(Math, filteredData.map(function(o) { return o.avgScore; }))
    const maxScorePerRound = Math.max.apply(Math, filteredData.map(function(o) { return o.avgScorePerRound; }))
  
    const radars = filteredData.map(p => ({
      labels: ['Econ Rating', 'KDA', 'Score', 'Score per Round'],
      datasets: [{
        label: p.name,
        backgroundColor: `rgba(${p.rgb.r},${p.rgb.g},${p.rgb.b},0.4)`,
        data: [p.avgEconRating * 100 / maxEcon, 
               p.avgKda * 100 / maxKda, 
               p.avgScore * 100 / maxScore,
               p.avgScorePerRound * 100 / maxScorePerRound]
      }]
      })
    )
    return radars;
  };