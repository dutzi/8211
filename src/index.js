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

  componentDidMount() {
    setInterval(() => {
      this.forceUpdate();
    }, 1000);
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

  isNow(details) {
    const fromTo = details.title
      .split(' ')
      .pop()
      .split('-');
    const hours = new Date().getHours();
    return fromTo[0] === 'משמרת' || (fromTo[0] <= hours && fromTo[1] > hours);
  }

  render() {
    const { formData } = this.state;

    const positions = Object.keys(schema.properties);

    return (
      <React.Fragment>
        <div className="form">
          {/* <button onClick={this.handleReset.bind(this)}>איפוס</button> */}
          <Form
            schema={schema}
            onChange={this.handleChange.bind(this)}
            onSubmit={this.handleSubmit.bind(this)}
            formData={formData}
          />
        </div>
        <div className="table">
          {positions.map((position, index) => {
            const positionSchema = schema.properties[position];
            return (
              <div className="table-row" key={index}>
                <div className="title">{positionSchema.title}</div>
                <table className="inner-table">
                  <tr>
                    {Object.keys(positionSchema.properties).map(position2 => {
                      const positionSchema2 =
                        positionSchema.properties[position2];
                      return (
                        <td
                          className={
                            this.isNow(positionSchema.properties[position2])
                              ? 'selected-td'
                              : ''
                          }
                        >
                          {positionSchema2.title}
                        </td>
                      );
                    })}
                  </tr>
                  {Object.keys(positionSchema.properties).map(position3 => {
                    const positionSchema2 =
                      positionSchema.properties[position3];
                    return (
                      <td
                        className={
                          this.isNow(positionSchema.properties[position3])
                            ? 'selected-td'
                            : ''
                        }
                      >
                        {Object.keys(positionSchema2.properties).map(
                          soldier => (
                            <tr>{formData[position][position3][soldier]}</tr>
                          ),
                        )}
                      </td>
                    );
                  })}
                </table>
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

render(<MyForm />, document.getElementById('app'));
