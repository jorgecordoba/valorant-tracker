import moment from 'moment-timezone';

function isInRangeMatch(match, from, to) {
  if (match !== undefined) {
    const matchMoment = moment(match.timestamp)
    return matchMoment.isBetween(from, to);
  }
  return false; 
}

function isSameDayMatch(match, daysOffset) {  
  if (match !== undefined) {
    const matchDay= moment(match.date).tz('Europe/Madrid')
    
    return matchDay.isSame(moment(daysOffset), 'day')
  }
  return false;  
}

const getKda = (profile, dateOffset) => {

    let profileMatches = profile.players.map(p => p)
      .flat().filter(match => isSameDayMatch(match, dateOffset));
  
    const sumKda = profileMatches.reduce((current, match) => match.KdRatio + current, 0);
    const avgKda = sumKda / profileMatches.length

    return avgKda;
  }
  
  const getAvg = (profile) => {
  
    const name = profile.name;
    const rgb = profile.rgb;

    const profilePlayers = profile.players.filter(p => p !== undefined);
    const profileMatches = profilePlayers.map(p => p)
      .flat();         

    const sumKda = profileMatches.reduce((current, match) => match.KdRatio + current, 0);
    const avgKda = (sumKda / profileMatches.length).toFixed(2);
    let kdaStandardDev = profileMatches.reduce((current, match) =>  current + ((match.KdRatio - avgKda)**2),0)
    kdaStandardDev = Math.sqrt(kdaStandardDev / profileMatches.length).toFixed(2)

    const sumScore = profileMatches.reduce((current, match) => match.Score + current, 0);
    const avgScore = (sumScore / profileMatches.length).toFixed(2);
  
    const econRating = profileMatches.reduce((current, match) => match.EconRating + current, 0);
    const avgEconRating = (econRating / profileMatches.length).toFixed(2);
   
    const sumScorePerRound = profileMatches.reduce((current, match) => match.ScorePerRound + current, 0);
    const avgScorePerRound = (sumScorePerRound / profileMatches.length).toFixed(2);    
  
    const nmatches = profileMatches.length;

    const hidden = profile.hidden
    
    const head = profileMatches.reduce((current, match) => match.DealtHeadshots + current, 0);
    const body = profileMatches.reduce((current, match) => match.DealtBodyshots + current, 0);
    const legs = profileMatches.reduce((current, match) => match.DealtLegshots + current, 0);
    const totalShots = head + body + legs;
    const headshots = (head * 100 / totalShots).toFixed(2);
    const bodyshots = (body * 100 / totalShots).toFixed(2);
    const legshots = (legs * 100 / totalShots).toFixed(2);

    const firstBloods = profileMatches.reduce((current, match) => match.FirstBloods + current, 0);
    const deathsFirst = profileMatches.reduce((current, match) => match.DeathsFirst + current, 0) * -1;

    const agents = []
  
    profileMatches.reduce((current, match) => {
      const agent = match.agent
      const agentName = match.agent
      const scorePerRound =  match.ScorePerRound
      if (!current[agent]) {
        current[agent] = { agentName: agentName, numPlayed: 0, addedScorePerRound: 0, profileName: profile.name };
        agents.push(current[agent])
      }
      current[agent].numPlayed += 1;
      current[agent].addedScorePerRound =  current[agent].addedScorePerRound + scorePerRound
      return current;
      }, {});      

    const average = {name, rgb, avgKda, kdaStandardDev, avgScore, avgEconRating, avgScorePerRound, nmatches, hidden, headshots, legshots, bodyshots, firstBloods, deathsFirst, agents};

    return average;
  }  

  const composePlayerDataSet = (profile, labels, func) => {

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
      data: labels.map(p => func(profile,p))
    }
    )
  }  
  
  const getLabels = (startDate, endDate) => {
    const numdays = moment(endDate).diff(startDate, 'days')
    const labels = []
    for (let index = 0; index < numdays+1; index++) {
      labels.push(moment(startDate).add(index,'days').format('YYYY-MM-DD'))
    }

    return labels
  }
  
  const composePlayerAccuracy = (profile, dateOffset) => {
    const profilePlayers = profile.players.filter(p => p !== undefined);
    const profileMatches = profilePlayers.map(p => p)
      .flat().filter(match => isSameDayMatch(match, dateOffset))
  
    const headshots = profileMatches.reduce((current, match) => match.DealtHeadshots + current, 0);
    const bodyshots = profileMatches.reduce((current, match) => match.DealtBodyshots + current, 0);
    const legshots = profileMatches.reduce((current, match) => match.DealtLegshots + current, 0);
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
    const labels = getLabels(players[0].dateStart, players[0].dateEnd)
    const data = {
      labels,
      datasets: players.map( player => composePlayerDataSet(player, labels, (p, o) => getKda(p,o))
      )
    };
    return data  
  }
  
  export const composeHeadshotGraph = (players) => {
    const labels = getLabels(players[0].dateStart, players[0].dateEnd)
    const data = {
      labels,
      datasets: players.map( player => composePlayerDataSet(player, labels,(p,o) => composePlayerAccuracy(p, o).pHeadshots)
      )
    };
    return data 
  }
  
  export const composeBodyshotGraph = (players) => {
    const labels = getLabels(players[0].dateStart, players[0].dateEnd)
    const data = {
      labels,
      datasets: players.map( player => composePlayerDataSet(player, labels, (p,o) => composePlayerAccuracy(p, o).pBodyshots)
      )
    };
    return data 
  }
  
  export const composeLegshotGraph = (players) => {

    const labels = getLabels(players[0].dateStart, players[0].dateEnd)
    const data = {
      labels,
      datasets: players.map( player => composePlayerDataSet(player, labels, (p,o) => composePlayerAccuracy(p, o).pLegshots)
      )
    }
    return data
  }
  
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

  export const composeAgentsRadarDataSet = (avgData) => {
  
    const filteredData = avgData.filter(p => !p.hidden)

    const agentsData = []
    filteredData.map(p => p.agents).flat().reduce((current, data) => {
      const agentName = data.agentName
      const numPlayed = data.numPlayed
      const addedScorePerRound = data.addedScorePerRound
      const name = data.profileName
      if (!current[agentName]) {
        current[agentName] = { agentName, profiles: [], maxScorePerRound: 0 };
        agentsData.push(current[agentName])
      }

    const average = (addedScorePerRound / numPlayed)

      current[agentName].profiles.push({ name, numPlayed, addedScorePerRound })
      current[agentName].numPlayed += 1;
      current[agentName].maxScorePerRound = current[agentName].maxScorePerRound > average ? current[agentName].maxScorePerRound : average
      return current;
      }, {}); 

    const radars = agentsData.map(p => ({
      labels: filteredData.map(data => data.name),
      datasets: [{
        label: p.agentName,
        backgroundColor: `rgba(20,144,255,0.4)`,
        data: filteredData.map(data => {
          let items = p.profiles.filter(profile => profile.name === data.name);
          let value = 0
          if (items && items[0]) {      
            value = (items[0].addedScorePerRound / items[0].numPlayed * 100) / p.maxScorePerRound
          }
          return value;
        }) 
      }]
      })
    )
    
    return radars;
  };