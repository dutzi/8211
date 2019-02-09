import React, { Component } from 'react';
import { render } from 'react-dom';
import schema from '../secrets/schema';

import Form from 'react-jsonschema-form';

class MyForm extends React.PureComponent {
  constructor() {
    super();

    const formData = JSON.parse(localStorage.getItem('data') || '{}');
    this.state = { formData };
  }

  handleChange(res) {
    localStorage.setItem('data', JSON.stringify(res.formData));
  }

  handleSubmit(res) {
    alert(res.formData);
  }

  handleReset() {
    this.setState({ formData: {} });
  }

  render() {
    const { formData } = this.state;

    return (
      <div>
        <button onClick={this.handleReset.bind(this)}>איפוס</button>
        <Form
          schema={schema}
          onChange={this.handleChange.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
          formData={formData}
        />
      </div>
    );
  }
}

render(<MyForm />, document.getElementById('app'));
