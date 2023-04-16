import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Divider, Header } from 'semantic-ui-react';
import CurrencyInput from '../Settings/Currency/Input';
import CurrencyExchangeRate from '../Settings/Currency/ExchangeRate';
import AccountForm from '../Accounts/Form';
import AccountList from '../Accounts/List';
import { completeSetup } from '../../actions/settings';
import { loadAccounts } from '../../actions/entities/accounts';
import { getAccountsList } from '../../selectors/entities/accounts';
import { isSignedIn } from 'features/user/state/User.selector';


class InitialSetup extends React.Component {
  componentDidMount() {
    this.props.loadAccounts();
  }

  render() {
    return (
      <div className="container-raised-desktop">
        <Header as="h1" icon="settings" content="初始设置" />
        <Divider />
        {!this.props.isAuthenticated && (
          <p>
            如果你想将你的数据与云端同步，<Link to="/auth">请通过邮箱登入。</Link>
            你也可以在不登录的情况下使用该记账软件。在这种情况下，你的数据将只存储在此浏览器中。你可以在以后任何时候登录并同步你的数据。
          </p>
        )}
        <Header as="h2">汇率</Header>
        <p>
          选择你的基础货币（默认使用的货币）
          <br />
          你也可以选择其他国家的货币。
        </p>
        <CurrencyInput />
        <CurrencyExchangeRate />
        <Header as="h2">账户</Header>
        <p>
          创建你想追踪的账户。
          <br />
          它可能是你钱包里的现金，银行账户，信用卡，储蓄卡或资产。
        </p>
        <AccountForm />
        {this.props.accounts.length > 0 && (
          <div style={{ margin: '1em' }}>
            <AccountList />
            <div className="form-submit">
              <Button
                primary
                content="Finish"
                onClick={this.props.completeSetup}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

InitialSetup.propTypes = {
  isAuthenticated: PropTypes.bool,
  accounts: PropTypes.arrayOf(PropTypes.object),
  loadAccounts: PropTypes.func,
  completeSetup: PropTypes.func
};

const mapStateToProps = state => ({
  isAuthenticated: isSignedIn(state),
  accounts: getAccountsList(state)
});

export default connect(
  mapStateToProps,
  { loadAccounts, completeSetup }
)(InitialSetup);
