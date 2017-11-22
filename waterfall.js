var margin = {top: 20, right: 30, bottom: 30, left: 40},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

async function fetchData() {
  const data = await fetch('data.json');
  const res = await data.json();
  return res;
}

function dollarFormatter(n) {
  n = Math.round(n);
  var result = n;
  if (Math.abs(n) > 1000) {
    result = Math.round(n/1000) + 'K';
  }
  return '$' + result;
}

const vm = new Vue({
  el: "#app",
  data() {
    return {
      rawData: [],
      padding: 0.3,
      width: width + margin.left + margin.right,
      height: height + margin.top + margin.bottom,
      transform: `translate(${margin.left},${margin.top})`,
      transformXAxis: `translate(0,${height})`
    }
  },
  computed: {
    data: function() {
      // Transform data (i.e., finding cumulative values and total) for easier charting
      const res = JSON.parse(JSON.stringify(this.rawData));
      var cumulative = 0;
      for (var i = 0; i < res.length; i++) {
        res[i].start = cumulative;
        cumulative += res[i].value;
        res[i].end = cumulative;

        res[i].class = ( res[i].value >= 0 ) ? 'positive' : 'negative'
      }
      res.push({
        name: 'Total',
        end: cumulative,
        start: 0,
        class: 'total'
      });
      return res;
    },
    x: function() {
      const res = d3.scaleBand()
        .rangeRound([0, width])
        .padding(this.padding);
      res.domain(this.data.map(d => d.name));
      return res;
    },
    y: function() {
      const res = d3.scaleLinear()
        .range([height, 0]);
      res.domain([0, d3.max(this.data, d => d.end)]);
      return res;
    }
  },
  methods: {
    transformEl: function(el) {
      return "translate(" + this.x(el.name) + ",0)";
    },
    reactY: function(el) {
      return this.y(Math.max(el.start, el.end));
    },
    rectHeight: function(el) {
      return Math.abs(this.y(el.start) - this.y(el.end));
    },
    textY: function(el) {
      return this.y(el.end) + 5;
    },
    textDy: function(el) {
      return ((el.class === 'negative') ? '-' : '') + ".75em";
    },
    text: function(el) {
      return dollarFormatter(el.end - el.start);
    },
    lineY: function(el) {
      return this.y(el.end);
    }
  },
  mounted() {
    fetchData().then(rawData => {
      this.rawData = rawData;

      var xAxis = d3.axisBottom(this.x);
      xAxis(d3.select(".x"));

      var yAxis = d3.axisLeft(this.y).tickFormat(function(d) { return dollarFormatter(d); });
      yAxis(d3.select(".y"));
    });
  }
});
