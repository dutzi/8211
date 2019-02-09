"use strict";

var _react = _interopRequireWildcard(require("react"));

var _reactDom = require("react-dom");

var _reactJsonschemaForm = _interopRequireDefault(require("react-jsonschema-form"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const schema = {
  title: 'Todo',
  type: 'object',
  required: ['title'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      default: 'A new task'
    },
    done: {
      type: 'boolean',
      title: 'Done?',
      default: false
    }
  }
};

const log = type => console.log.bind(console, type);

(0, _reactDom.render)(_react.default.createElement(_reactJsonschemaForm.default, {
  schema: schema,
  onChange: log('changed'),
  onSubmit: log('submitted'),
  onError: log('errors')
}), document.getElementById('app'));