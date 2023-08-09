const findTimeRange = (input) => {
    if ( input.match(/.*year.*/i) ) 
        return 'Year'
    if ( input.match(/.*month.*/i) ) 
        return 'Month'
    if ( input.match(/.*week.*/i) ) 
        return 'Week'
    if ( input.match(/.*quarter.*/i) )
        return 'Quarter'
    else
        return 'Week'
}

const findLastRange = (input) => {
    let range = 0;
    if ( input.match(/\d+/) ) {
        range = parseInt(input.match(/\d+/)[0])
    }
    if ( range == 0 )
        range = 1    
    let period = 'Days'

    if ( input.match(/.*day.*/i) ) 
        period = 'Days'
    if ( input.match(/.*year.*/i) ) 
        period = 'Year'
    if ( input.match(/.*month.*/i) ) 
        period = 'Months'
    if ( input.match(/.*quarter.*/i) ) {
        period = 'Days'
        range = 90
    }
    
    if ( period === 'Days' ) {
        if ( range <= 7 )
            return '7Days'
        else if ( range <= 30 )
            return '30Days'
        else if ( range <= 60 )
            return '60Days'
        else if ( range <= 90 ) 
            return '90Days'
        else 
            return '6Months'        
    } else if ( period == 'Months' ) {
        if ( range <= 12 )
            return '6Months'
        else 
            return '1Year'
    } else if ( period == 'Year' ) {
        if ( range < 2 )
            return '1Year'
        else if ( range == 2 )
            return '2Years'
        else
            return '3Years'
    }
}

const convertRange = (input) => {
    if ( input.match(/.*previous.*/i) ) {
        return 'Previous'+findTimeRange(input)
    }
    if ( input.match(/.*current.*/i) || input.match(/.*this.*/i) ) {
        return 'This'+findTimeRange(input)
    }
    if ( input.match(/.*today.*/i) ) {
        return 'Today'
    }
    if ( input.match(/.*yesterday.*/i) ) {
        return 'Yesterday'
    }
    if ( input.match(/.*last.*/i) ) {
        return 'Last'+findLastRange(input)
    }
    return input
}

module.exports = { convertRange }