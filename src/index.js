import React, { Component } from 'react';
import { render } from 'react-dom';
import schema from '../secrets/schema';
import _ from 'lodash';

import Form from 'react-jsonschema-form';

class MyForm extends React.PureComponent {
  constructor() {
    super();

    const date = localStorage.getItem('date') || '';
    this.state = { date };

    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    setInterval(() => {
      this.forceUpdate();
    }, 1000);
    setTimeout(() => {
      this.setState({
        loaded: true,
      });
    }, 1000);
    this.loadData();
  }

  loadData() {
    const formData = JSON.parse(
      localStorage.getItem(`data-${this.state.date}`) || '{}',
    );
    this.setState({ formData });
  }

  handleChange(res) {
    if (!this.state.loaded) {
      return;
    }

    localStorage.setItem(
      `data-${this.state.date}`,
      JSON.stringify(res.formData),
    );
    this.setState({
      formData: res.formData,
    });
  }

  handleSubmit(res) {
    alert(res.formData);
  }

  // handleReset() {
  //   this.setState({ formData: {} });
  // }

  isNow(details) {
    const fromTo = details.title
      .split(' ')
      .pop()
      .split('-');
    let hours = new Date().getHours();
    const isEndless = fromTo[0] === 'משמרת';
    let from = Number(fromTo[0]);
    let to = Number(fromTo[1]);
    if (hours < 12) {
      hours += 24;
    }
    if (from < 12) {
      from += 24;
    }
    if (to < 12) {
      to += 24;
    }
    if (to < from) {
      to = to + 24;
    }
    return isEndless || (from <= hours && to > hours);
  }

  handleSelect(e) {
    localStorage.setItem('date', this.refs.select.value);
    this.setState(
      {
        date: this.refs.select.value,
      },
      () => {
        this.loadData();
      },
    );
  }

  render() {
    const { formData, date } = this.state;

    const positions = Object.keys(schema.properties);

    console.log(formData);

    return (
      <React.Fragment>
        <div className="form">
          <select
            ref="select"
            onChange={this.handleSelect}
            className="select"
            value={date}
          >
            <option>11/2 (ב)</option>
            <option>12/2 (ג)</option>
            <option>13/2 (ד)</option>
            <option>14/2 (ה)</option>
            <option>15/2 (ו)</option>
            <option>16/2 (ש)</option>
            <option>17/2 (א)</option>
            <option>18/2 (ב)</option>
            <option>19/2 (ג)</option>
            <option>20/2 (ד)</option>
            <option>21/2 (ה)</option>
            <option>22/2 (ו)</option>
            <option>23/2 (ש)</option>
            <option>24/2 (א)</option>
            <option>25/2 (ב)</option>
            <option>26/2 (ג)</option>
            <option>27/2 (ד)</option>
          </select>
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
                            <tr>
                              {_.get(
                                formData,
                                `${position}.${position3}.${soldier}`,
                              )}
                            </tr>
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
