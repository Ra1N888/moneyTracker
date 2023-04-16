import React from 'react';
import CurrencyInput from './Currency/Input';
import CurrenchExchangeRate from './Currency/ExchangeRate';
import DataExport from './DataExport';
import DataImport from './DataImport';
import User from './User';
import CollapsibleSection from '../../components/CollapsibleSection';

const Settings = () => (
  <div className="container-full-page mt-settings">
    <CollapsibleSection name="settings_currency" label="汇率">
      <CurrencyInput />
      <CurrenchExchangeRate />
    </CollapsibleSection>
    <CollapsibleSection name="settings_import" label="交易导入">
      <DataImport />      
    </CollapsibleSection>
    <CollapsibleSection name="settings_export" label="交易导出">
      <DataExport />
      </CollapsibleSection>
    <CollapsibleSection name="settings_user" label="用户">
      <User />
    </CollapsibleSection>
  </div>
);

export default Settings;
