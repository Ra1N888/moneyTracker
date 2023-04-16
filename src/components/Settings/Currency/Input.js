import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Form } from 'semantic-ui-react';
import Currency from '../../../entities/Currency';

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.options = Currency.options();
    this.updateSecondaryOptions(props.base);
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.updateSecondaryOptions(props.base);
  }

  updateSecondaryOptions(base) {
    this.secondaryOptions = this.options.filter(option => option.key !== base);
  }

  handleBaseChange = (event, { value }) => {
    this.props.changeSettingsCurrency({
      base: value,
      secondary: this.props.secondary
    });
  };

  handleSecondaryChange = (event, { value }) => {
    this.props.changeSettingsCurrency({
      base: this.props.base,
      secondary: value
    });
  };

  render() {
    return (
      <Form>
        <Form.Group widths="equal">
          <Form.Field>
            <label>基础汇率</label>
            <Dropdown
              search
              selection
              onChange={this.handleBaseChange}
              options={this.options}
              value={this.props.base}
            />
          </Form.Field>
          <Form.Field>
            <label>其他汇率（可选）</label>
            <Dropdown
              placeholder="请选择其他汇率"
              search
              selection
              multiple
              renderLabel={item => item.key}
              closeOnChange
              onChange={this.handleSecondaryChange}
              options={this.secondaryOptions}
              value={this.props.secondary}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    );
  }
}

Input.propTypes = {
  base: PropTypes.string,
  secondary: PropTypes.arrayOf(PropTypes.string),
  changeSettingsCurrency: PropTypes.func
};

export default Input;
