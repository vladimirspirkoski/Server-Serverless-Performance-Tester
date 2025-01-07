async function processArray(event) {
  event.preventDefault(); // iskluci go refresh na submit

  const provider = document.getElementById("provider").value;
  let apiGatewayUrl = "";
  let azureFunctionUrl = "";
  let azureFunctionKey = "";
  let gcloudFunctionUrl = "";
  let gcloudAccessToken = "";
  let thresholdValue = document.getElementById("threshold").value;
  let arraySize = document.getElementById("arraySize").value;
  let result = document.getElementById("result");

  clearPreviousResults(); // Izbrisi gi prethodnite rezultati ako se koristi


  // Validiraj
  if (
    !thresholdValue ||
    parseInt(thresholdValue) <= 0 ||
    !arraySize ||
    parseInt(arraySize) <= 0
  ) {
    alert("Please enter valid threshold and array size.");
    return;
  }

  if (provider === "aws") {
    apiGatewayUrl = document.getElementById("apiGatewayUrl").value;
    if (!apiGatewayUrl) {
      alert("Please enter a valid API Gateway URL.");
      return;
    }
  } else if (provider === "azure") {
    azureFunctionUrl = document.getElementById("azureFunctionUrl").value;
    azureFunctionKey = document.getElementById("azureFunctionKey").value;
    if (!azureFunctionUrl) {
      alert(
        "Please enter valid Azure Function URL. Key is not needed if the function is public."
      );
      return;
    }
  } else if (provider === "gcloud") {
    gcloudFunctionUrl = document.getElementById("gcloudFunctionUrl").value;
    gcloudAccessToken = document.getElementById("gcloudAccessToken").value;
    if (!gcloudFunctionUrl) {
      alert(
        "Please enter valid Google Cloud Function URL. Access Token is not needed if the function is public."
      );
      return;
    }
  }

  result.innerHTML = "Test is running, please wait...";

  // Dva for ciklusi generiraat array od promises, sekoj loop +1 promise.
  for (let i = 1; i <= thresholdValue; i++) {
    let startTime = performance.now();
    let requests = [];

    for (let j = 0; j < i; j++) {
      requests.push(
        invokeFunction(
          provider,
          apiGatewayUrl,
          azureFunctionUrl,
          azureFunctionKey,
          gcloudFunctionUrl,
          gcloudAccessToken,
          arraySize
        )
      );
    }

    await Promise.all(requests); //izvrsi gi site promises naednas
    let endTime = performance.now();
    let processingTime = (endTime - startTime) / 1000;

    addRowToResultsTable(i, processingTime.toFixed(3));
  }
  
  result.innerHTML = "Finished";
  generateCSV(document.getElementById("resultsTable"));
}

async function invokeFunction(
  provider,
  apiGatewayUrl,
  azureFunctionUrl,
  azureFunctionKey,
  gcloudFunctionUrl,
  gcloudAccessToken,
  arraySize
) {
  return new Promise((resolve, reject) => {
    if (provider === "aws") {
      fetch(apiGatewayUrl, {
        method: "POST",
        body: JSON.stringify({ arraySize: parseInt(arraySize) }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    } else if (provider === "azure") {
      fetch(`${azureFunctionUrl}?code=${azureFunctionKey}`, {
        method: "POST",
        body: JSON.stringify({ arraySize: parseInt(arraySize) }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    } else if (provider === "gcloud") {
      fetch(gcloudFunctionUrl, {
        method: "POST",
        body: JSON.stringify({ arraySize: parseInt(arraySize) }),
        headers: {
          Authorization: `Bearer ${gcloudAccessToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    } else {
      reject(new Error("Unsupported provider"));
    }
  });
}

function addRowToResultsTable(numberOfRequests, processingTime) {
  let tableBody = document.getElementsByTagName("tbody")[0];
  let newRow = tableBody.insertRow();
  newRow.insertCell(0).innerHTML = numberOfRequests;
  newRow.insertCell(1).innerHTML = processingTime;
}

function generateCSV(table) {
  let csvContent = [];
  let rows = table.getElementsByTagName("tr");

  let headerCells = rows[0].getElementsByTagName("th");
  let headerArray = Array.from(headerCells).map((cell) => cell.innerText);
  csvContent.push(headerArray.join(","));

  for (let i = 1; i < rows.length; i++) {
    let dataCells = rows[i].getElementsByTagName("td");
    let dataArray = Array.from(dataCells).map((cell) => cell.innerText);
    csvContent.push(dataArray.join(","));
  }

  let csv = new Blob([csvContent.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  let url = URL.createObjectURL(csv);
  let downloadLink = document.createElement("a");
  downloadLink.setAttribute(
    "download",
    document.getElementById("provider").value + "_results.csv"
  );
  downloadLink.setAttribute("href", url);
  downloadLink.innerHTML = "<p>Download CSV</p>";
  downloadLink.id = "downloadLink";
  document.body.appendChild(downloadLink);
}

function clearPreviousResults() {
  const tableBody = document.getElementsByTagName("tbody")[0];
  while (tableBody.rows.length > 0) {
    tableBody.deleteRow(0);
  }
  result.innerHTML = "";
  clearDownloadLink();
}

function clearDownloadLink() {
  let downloadLink = document.getElementById("downloadLink");
  if (downloadLink == null)
    return; //ako funkcijata se koristi prv pat/ne se pokazuva download link, vrati se nazad
  else {
    URL.revokeObjectURL(downloadLink.href); //oslobodi go rezerviranoto URL za download
    downloadLink.parentNode.removeChild(downloadLink); //trgni go download linkot
  }
}

function toggleInputs() {
  const provider = document.getElementById("provider").value;
  document.getElementById("awsInputs").style.display = "none";
  document.getElementById("azureInputs").style.display = "none"
  document.getElementById("gcloudInputs").style.display = "none"

  document.getElementById("awsInputs").style.display =
    provider === "aws" ? "block" : "none";
  document.getElementById("azureInputs").style.display =
    provider === "azure" ? "block" : "none";
  document.getElementById("gcloudInputs").style.display =
    provider === "gcloud" ? "block" : "none";

  clearPreviousResults();
}
