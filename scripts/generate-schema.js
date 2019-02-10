const _ = require('lodash');
const positions = require('../secrets/positions');
const soldiers = require('../secrets/soldiers').sort();

function getAllPositionIds(positions) {
  return positions.map(position => position.id);
}

function getFrom(position, index) {
  if (position.numOccurrences === 1) {
    return position.from;
  }

  return (position.from + index * (24 / position.numOccurrences)) % 24;
}

function getTo(position, index) {
  if (position.numOccurrences === 1) {
    return position.to || 'סוף משמרת';
  }

  return (position.from + (index + 1) * (24 / position.numOccurrences)) % 24;
}

function getPositionSoldierProperties(position) {
  const res = {};

  _.times(position.numSoldiers).forEach(index => {
    res[`soldier-${index}`] = {
      $ref: '#/definitions/soldier',
      title: `חייל ${index + 1}`,
    };
  });

  return res;
}

function getAllPositionPositions(position) {
  const res = {};

  _.times(position.numOccurrences).forEach(index => {
    const id = `${position.id}-${index}`;
    const title = `${position.label} ${getFrom(position, index)}-${getTo(
      position,
      index,
    )}`;

    res[id] = {
      title,
      type: 'object',
      properties: getPositionSoldierProperties(position),
    };
  });

  return res;
}

const schemaPositions = positions.reduce((prev, current, index) => {
  return {
    ...prev,
    [current.id]: {
      title: current.label,
      type: 'object',
      properties: getAllPositionPositions(current),
    },
  };
}, {});

const schema = {
  title: 'שבצ"ק 8211',
  description: 'שיבוץ חיילים במשימות לפלוגה המסייעת 8211',
  type: 'object',
  required: [],
  definitions: {
    soldier: { enum: soldiers },
  },
  properties: schemaPositions,
};

pbcopy(JSON.stringify(schema, true, 4));

function pbcopy(data) {
  var proc = require('child_process').spawn('pbcopy');
  proc.stdin.write(data);
  proc.stdin.end();
}
