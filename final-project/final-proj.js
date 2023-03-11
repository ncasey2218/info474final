d3.csv('./Weather Data/KSEA.csv').then(function(dataset) {
// Get new Date and remove strings from dataset
const formatdata = dataset.map(d=>{
  const date = new Date(d.date);
  const month = date.getMonth()+1;
  const day  = date.getDay()+1;
 return {
  actual_max_temp:Number(d.actual_max_temp),
  actual_mean_temp:Number(d.actual_mean_temp),
  actual_min_temp:Number(d.actual_min_temp),
  actual_precipitation:Number(d.actual_precipitation),
  average_min_temp:Number(d.average_min_temp),
  date:new Date(d.date),
  month,
  day
}
})

// Array of month labels to filter and group by
const MONTHS = [
{month:'January', index:1},
{month:'February', index:2,},
{month:'March',index:3,}, 
{month:'April', index:4,}, 
{month:'May',index:5,}, 
{month:'June',index:6,}, 
{month:'July',index:7,}, 
{month:'August',index:8,}, 
{month:'September',index:9,}, 
{month:'October',index:10,}, 
{month:'November',index:11,},
{month:'December',index:12,} ]

// Array of day labels to filter and group by
const DAYS = [{day:'Sunday', index:1},
{day:'Monday', index:2,},
{day:'Tuesday',index:3,}, 
{day:'Wednesday', index:4,}, 
{day:'Thursday',index:5,}, 
{day:'Friday',index:6,}, 
{day:'Saturday',index:7,}]

//Group data by month
const groupbyMonth = MONTHS.map(m=>{
const value = formatdata.filter(fm=>fm.month==m.index);
return {
  month:m.month,
  index:m.index,
  value
}
})

// Get array with sum for months and days in month
const formattedData = groupbyMonth.map(a=>{
  const monthsum = a.value.reduce(
    (accumulator, currentValue) => accumulator + currentValue.actual_precipitation,
    0,
  );
   const daysvalues = DAYS.map(d=>{
    const thatday = a.value.filter(td=>td.day==d.index);
    const daysum = thatday.reduce(
      (accumulator, currentValue) => accumulator + currentValue.actual_precipitation,
      0,
    );
    return {
      daylabel:d.day,
      value:thatday,
      average:daysum/thatday.length
    }
   })
   return {
     ...a, //everything from a
     daysvalues,
     average:monthsum/a.value.length
   }
})
// put grouped data into donut viz format
let renderdata ={}
formattedData.forEach(mba=>{
renderdata[mba.month] =mba.average
})
var width = 450
    height = 450
    margin = 40
var radius = Math.min(width, height) / 2 - margin

const Mtext = 'Select a Month'
const MONTH_DOMAIN = MONTHS.map(m=>m.month);
const DAY_DOMAIN = DAYS.map(d=>d.day)

renderDonut('#view-by-mnth',renderdata,MONTH_DOMAIN, Mtext);

function renderDonut(selector,donutdata,domain, text){
  const selectEl = d3.select(`${selector}`,donutdata).selectAll('svg').remove();
  var svg = d3.select(`${selector}`,donutdata)
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")


var data =donutdata ; 
// set the color scale
var color = d3.scaleOrdinal()
  .domain(domain)
  .range(d3.schemeDark2);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .on('click',function(d){
    console.log('Please give me an A :)')
    const monthdata = formattedData.filter(fd=>fd.month == d.data.key)
    let daydata = monthdata[0];
    daydata = daydata.daysvalues;

    let renderdata ={}
    daydata.forEach(mba=>{
    renderdata[mba.daylabel] =mba.average
    })
    renderDonut('#view-by-mnth-day', renderdata, DAY_DOMAIN, d.data.key)
  })
  .on("mouseover", function(d) {
    d3.select(this)
    .attr('opacity', 0.6);
    d3.select('.label').text(d.data.key)
    d3.select('.value').text('Average Precipitation:'+' '+d.data.value.toFixed(3)+' inches')
  })
  .on("mouseout", function(d) {
    d3.select(this)
    .attr('opacity', 1);
  });

svg.append("svg:text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("style","font-family:Ubuntu")
    .attr("font-size","20")
    .attr("fill","Black")
    .text(text);
}
  })
