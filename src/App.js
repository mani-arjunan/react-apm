import { useState } from "react";
import "./App.css";
import json from "./response.json";
// import json from "./small-response.json";

// Can be optimized 
const formApmMap = (json) => {
  let accountMap = {};
  let apmMap = {};
  let regionMap = {};
  let businessMap = {};

  const APM = Object.keys(json);
  for (let i = 0; i < APM.length; i++) {
    const apm = APM[i];
    apmMap = {
      ...apmMap,
      [apm]: {
        region: [],
        business: [json[apm].criticality],
        account: [],
        checked: false,
      },
    };
    if (businessMap[json[apm].criticality]) {
      if (!businessMap[json[apm].criticality].apm.includes(APM[i])) {
        businessMap[json[apm].criticality].apm.push(APM[i]);
      }
    } else {
      businessMap[json[apm].criticality] = {
        region: [],
        apm: [APM[i]],
        checked: false,
        account: [],
      };
    }
    for (let j = 0; j < json[APM[i]].accounts.length; j++) {
      const account = json[APM[i]].accounts[j];

      if (apmMap[apm]) {
        if (!apmMap[apm].account.includes(account.accountNumber)) {
          apmMap[apm].account.push(account.accountNumber);
        }
      }
      if (businessMap[json[apm].criticality]) {
        if (!businessMap[json[apm].criticality].account.includes(account.accountNumber)) {
          businessMap[json[apm].criticality].account.push(account.accountNumber);
        }
      }
      if (accountMap[account.accountNumber]) {
        if (!accountMap[account.accountNumber].apm.includes(apm)) {
          accountMap[account.accountNumber].apm.push(apm);
        }
        if (!accountMap[account.accountNumber].business.includes(json[apm].criticality)) {
          accountMap[account.accountNumber].business.push(json[apm].criticality);
        }
      } else {
        accountMap[account.accountNumber] = {
          region: [],
          apm: [apm],
          business: [json[apm].criticality],
          checked: false,
        };
      }
      for (let k = 0; k < account.regions.length; k++) {
        const region = account.regions[k];

        if (apmMap[apm]) {
          if (!apmMap[apm].region.includes(region)) {
            apmMap[apm].region.push(region);
          }
        }
        if (businessMap[json[apm].criticality]) {
          if (!businessMap[json[apm].criticality].region.includes(region)) {
            businessMap[json[apm].criticality].region.push(region);
          }
        }
        if (accountMap[account.accountNumber]) {
          if (!accountMap[account.accountNumber].region.includes(region)) {
            accountMap[account.accountNumber].region.push(region);
          }
        }
        if (regionMap[region]) {
          if (!regionMap[region].business.includes(json[apm].criticality)) {
            regionMap[region].business.push(json[apm].criticality);
          }
          if (!regionMap[region].apm.includes(apm)) {
            regionMap[region].apm.push(apm);
          }
          if (!regionMap[region].account.includes(account.accountNumber)) {
            regionMap[region].account.push(account.accountNumber);
          }
        } else {
          regionMap[region] = {
            account: [account.accountNumber],
            apm: [apm],
            checked: false,
            business: [json[apm].criticality],
          };
        }
      }
    }
  }
  return {
    apmMap,
    businessMap,
    regionMap,
    accountMap,
  };
};

function App() {
  const [current, selectCurrent] = useState("");
  const { apmMap, regionMap, accountMap, businessMap } = formApmMap(json);
  const [responseData, setResponseData] = useState({
    apm: { ...apmMap },
    business: { ...businessMap },
    region: { ...regionMap },
    account: { ...accountMap },
  });

  const handleSelectClick = (type) => {
    if (current === "") {
      selectCurrent(type);
    } else {
      selectCurrent("");
    }
  };

  const handleOnChange = (data, checked) => {
    const rest = responseData[current][data];
    const restKeys = Object.keys(rest);
    let updatedResponseData = {
      ...responseData
    };
    restKeys
      .filter((k) => k !== "checked")
      .forEach((curr) => {
        const currValues = rest[curr].map((d) => ({
          key: d,
          value: responseData[curr][d]
        }));
        const filteredKey = currValues.filter(({key, value}) => {
          if(value[current].filter(v => v !== data).every(v => !responseData[current][v].checked)) {
            return true
          }
        })
        let obj = {}
        filteredKey.forEach(f => {
          obj = {
            ...obj,
            [f.key]: {
              ...f.value,
              checked: !checked
            }
          }
        })
        
        updatedResponseData[curr] = {
          ...updatedResponseData[curr],
          ...obj
        }
      });
    setResponseData((prev) => {
      return {
        ...updatedResponseData,
        [current]: {
          ...prev[current],
          [data]: {
            ...prev[current][data],
            checked: !prev[current][data].checked,
          },
        },
      };
    });
  };

  const optionsSelector = (type) => {
    const keys = Object.keys(responseData[type]);

    return keys.filter((k) => responseData[type][k].checked).length;
  };

  return (
    <div className="App">
      <div className="select-wrapper">
        <select onClick={() => handleSelectClick("business")}>
          <option>{`${optionsSelector("business")} BUSINESS_CRITICAL`}</option>
        </select>
        <select onClick={() => handleSelectClick("account")}>
          <option>{`${optionsSelector("account")} ACCOUNTS`}</option>
        </select>
      </div>
      <div className="select-wrapper">
        <select onClick={() => handleSelectClick("apm")}>
          <option>{`${optionsSelector("apm")} APM...`}</option>
        </select>
        <select onClick={() => handleSelectClick("region")}>
          <option>{`${optionsSelector("region")} AWS Region`}</option>
        </select>
      </div>
      {current
        ? Object.keys(responseData[current]).map((key) => (
          <div class="input">
            <input
              onChange={() =>
                handleOnChange(key, responseData[current][key].checked)
              }
              type="checkbox"
              checked={responseData[current][key].checked}
            />
            <label>{key}</label>
          </div>
        ))
        : null}
    </div>
  );
}

export default App;
