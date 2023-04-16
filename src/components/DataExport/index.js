import React from 'react';
import PropTypes from 'prop-types';
import { Button, Message } from 'semantic-ui-react';
import './index.css';
import {save} from 'save-file';
import { usePapaParse } from 'react-papaparse';
import TransactionsStorage from '../../util/storage/transactions';


class DataExport extends React.Component {
  

  handleSaveFile = async () => {


    let transactions = await TransactionsStorage.getAll();
    const jsonVersion = JSON.stringify(transactions);

    const { jsonToCSV } = usePapaParse();
    const csv = jsonToCSV(jsonVersion)
    save(csv, JSON.stringify(new Date(Date.now())) + '_export.csv');


  }

  render() {
    return (
      <div className="mt-dataExport">
        <p>导出交易记录的csv文件</p>
        {this.props.error && (
          <Message
            error
            icon="warning circle"
            header="Failed to Export"
            content={this.props.error}
          />
        )}
        {!this.props.isFileSelected && (
          <React.Fragment>
            <Button
              content="导出文件"
              icon="file text"
              onClick={this.handleSaveFile}
            />            
          </React.Fragment>
        )}
      </div>
    );
  }
}

DataExport.propTypes = {
  error: PropTypes.string
};

export default DataExport;
