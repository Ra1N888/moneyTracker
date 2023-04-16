import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from '../../util/PrettyBytes';
import { Button, Progress, Message } from 'semantic-ui-react';
import './index.css';

const DataImport = ({isFileSelected, isProcessing, filename, filesize, linesToProcess, linesProcessed, error, openImportFile, discardImportFile,startDataImport}) => {


  const fileInputRef = useRef(null);

  const handleFileChange = event => {
    const file = event.target.files[0];

    console.log('onchange: ')
    console.dir(file)
    openImportFile(file)
  };


  const handleOpenFile = () => fileInputRef.current.click();


  return (
    <div className="mt-dataImport">
      <p>导入交易记录的csv文件</p>
      {error && (
        <Message
          error
          icon="warning circle"
          header="Failed to import"
          content={error}
        />
      )}
      {!isFileSelected && (
        <React.Fragment>
          <Button
            content="打开文件"
            icon="file text"
            onClick={handleOpenFile}
          />
          <input
            type="file"
            accept="text/csv"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </React.Fragment>
      )}
      {isFileSelected && (
        <React.Fragment>
          <p>
            选择文件:{' '}
            <strong>
              {filename} ({prettyBytes(filesize)})
            </strong>
          </p>
          {!isProcessing && (
            <Button.Group>
              <Button onClick={discardImportFile}>
                删除文件
              </Button>
              <Button.Or />
              <Button onClick={startDataImport} positive>
                开始导入
              </Button>
            </Button.Group>
          )}
          {isProcessing && (
            <Progress
              active
              indicating
              autoSuccess
              total={linesToProcess}
              value={linesProcessed}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
}

DataImport.propTypes = {
  isFileSelected: PropTypes.bool,
  isProcessing: PropTypes.bool,
  filename: PropTypes.string,
  filesize: PropTypes.number,
  linesToProcess: PropTypes.number,
  linesProcessed: PropTypes.number,
  error: PropTypes.string,

  openImportFile: PropTypes.func,
  discardImportFile: PropTypes.func,
  startDataImport: PropTypes.func
};

export default DataImport;
