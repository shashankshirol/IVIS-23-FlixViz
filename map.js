

new svgMap({
    targetElementID: 'svgMap',
    minZoom: 1,
    maxZoom: 1,
    data: {
      data: {
        tvids: {
          name: 'Total Titles',
          format: '{0}',
          thousandSeparator: ',',
          thresholdMax: 50000,
          thresholdMin: 1000
        },
        tmovs: {
            name: 'Movies',
            format: '{0}',
            thousandSeparator: ',',
            thresholdMax: 50000,
            thresholdMin: 100
        },
        tseries: {
            name: 'Series',
            format: '{0}',
            thousandSeparator: ',',
            thresholdMax: 50000,
            thresholdMin: 100
        },
      },
      applyData: 'tvids',
      values: {
        AR: {tvids: 6188, tmovs: 3940, tseries: 2248},
        AU: {tvids: 6266, tmovs: 3896, tseries: 2370},
        BE: {tvids: 6544, tmovs: 4227, tseries: 2317},
        BR: {tvids: 6323, tmovs: 4077, tseries: 2246},
      }
    }
  });