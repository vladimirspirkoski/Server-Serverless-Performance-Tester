function startPerformanceTest() {
  //konstanti
  const api = "http://" + window.location.hostname;
  const testTypeValue = document.getElementById("test-type").value;
  const testTypeChecker = document.getElementById("testTypeChecker");
  const cpuInputsValue = document.getElementById("cpu-n").value;
  const memoryInputsValue = document.getElementById("memory-n").value;
  const memoryTestTypeValue = document.getElementById("memory-test-type").value;
  const storageInputsValue = document.getElementById("storage-n").value;
  const storageTestTypeValue =
    document.getElementById("storage-test-type").value;
  const combinedInputsValue = document.getElementById("combined-n").value;
  const thresholdValue = document.getElementById("threshold").value;
  const thresholdChecker = document.getElementById("thresholdChecker");

  if (validateEverything()) return;

  clearDownloadLink();
  result.innerHTML = ""; //иzbrisi gi prethodnite rezultati
  testStatus.innerText = "Test is running, please wait..."; //postavi status na please wait

  //isprati POST request
  sendPOST();

  function validateEverything() {
    // proveri dali e odbran test type
    if (testTypeValue === "") {
      testTypeChecker.innerText = "Please select a test type";
      return true;
    } else {
      testTypeChecker.innerText = "";
    }

    if (testTypeValue === "cpu") {
      if (cpuInputsValue === "") {
        cpuInputsChecker.innerText = "Please enter array length";
        return true;
      } else {
        cpuInputsChecker.innerText = "";
      }
    }

    if (testTypeValue === "memory") {
      if (memoryInputsValue == "") {
        memoryInputsChecker.innerText = "Please enter memory size";
        return true;
      } else if (parseInt(memoryInputsValue) <= 0) {
        memoryInputsChecker.innerText = "Memory size must be a positive number";
        return;
      } else {
        memoryInputsChecker.innerText = "";
      }
    }

    if (testTypeValue === "storage") {
      if (storageInputsValue === "") {
        storageInputsChecker.innerText = "Please enter file size";
        return true;
      } else {
        storageInputsChecker.innerText = "";
      }
    }

    if (testTypeValue === "combined") {
      if (combinedInputsValue === "") {
        combinedInputsChecker.innerText = "Please enter array length";
        return true;
      } else {
        combinedInputsChecker.innerText = "";
      }
    }

    //proveruva dali threshold e prazno ili negativen broj/0
    if (thresholdValue === "") {
      thresholdChecker.innerText = " Threshold is empty";
      return true;
    } else if (parseInt(thresholdValue) <= 0) {
      thresholdChecker.innerText = " Threshold must be a positive number";
      return true;
    }

    return false;
  }

  function sendPOST() {
    let data = {
      test_type: testTypeValue,
      threshold: thresholdValue,
    };

    if (testTypeValue === "cpu") {
      data.arraySize = cpuInputsValue;
    } else if (testTypeValue === "memory") {
      data.memory_kb = memoryInputsValue;
      data.test_sub_type = memoryTestTypeValue;
    } else if (testTypeValue === "storage") {
      data.file_size_mb = storageInputsValue;
      data.test_sub_type = storageTestTypeValue;
    } else if (testTypeValue === "combined") {
      data.arraySize = combinedInputsValue;
    }

    fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.error) {
          testStatus.innerText = "Finished";
          result.innerHTML = "Error: " + responseData.error;
        } else {
          testStatus.innerText = "Finished";
          result.innerHTML = "Test Result: <br />" + responseData.result;
          generateCSV(responseData.result);
        }
      })
      .catch((error) => {
        result.innerText = "Error: " + error.message;
      });
  }

  // generiraj csv i download link
  function generateCSV(resultString) {
    let csvContent = [];
    let rows = resultString.split("<br>");

    // Header za csv fajlot
    csvContent.push("Number of concurrent tests, Completion time (seconds)");

    // Za sekoj red vo rows izvadi go brojot na testovi i vreme na izvrsuvanje
    rows.forEach((row) => {
      let match = row.match(
        /Total time for (\d+) concurrent.*: ([\d.]+) seconds/
      );
      if (match) {
        let concurrentCount = match[1]; // broj na testovi
        let timeTaken = match[2]; // vreme na izvrsuvanje
        csvContent.push(`${concurrentCount}, ${timeTaken}`); // dodaj gi vo csvContent kako podatoci
      }
    });

    // Kreiraj blob za csv
    let csv = new Blob([csvContent.join("\n")], { type: "text/csv" });

    // Kreiraj download link za da se spusti csv so dinamicki generirano ime
    let downloadLink = document.createElement("a");
    downloadLink.download = testTypeValue + "_test_results.csv";
    downloadLink.href = window.URL.createObjectURL(csv);
    downloadLink.innerHTML = "<p>Download CSV</p>";
    downloadLink.id = "downloadLink";
    document.body.appendChild(downloadLink);
  }
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

document.addEventListener("DOMContentLoaded", function () {
  const cpuInputs = document.getElementById("cpu-inputs");
  const cpuInputsChecker = document.getElementById("cpuInputsChecker");
  const memoryInputs = document.getElementById("memory-inputs");
  const memoryInputsChecker = document.getElementById("memoryInputsChecker");
  const storageInputs = document.getElementById("storage-inputs");
  const storageInputsChecker = document.getElementById("storageInputsChecker");
  const combinedInputs = document.getElementById("combined-inputs");
  const combinedInputsChecker = document.getElementById(
    "combinedInputsChecker"
  );
  const testTypeSelection = document.getElementById("test-type");
  const testStatus = document.getElementById("testStatus");
  const result = document.getElementById("result");

  function handleTestTypeChange() {
    const testType = testTypeSelection.value;
    cpuInputs.style.display = "none";
    memoryInputs.style.display = "none";
    storageInputs.style.display = "none";
    combinedInputs.style.display = "none";
    testStatus.innerText = "";
    result.innerText = "";

    if (testType === "cpu") {
      cpuInputs.style.display = "block";
      memoryInputsChecker.innerText = "";
      storageInputsChecker.innerText = "";
      combinedInputsChecker.innerText = "";
    } else if (testType === "memory") {
      memoryInputs.style.display = "block";
      cpuInputsChecker.innerText = "";
      storageInputsChecker.innerText = "";
      combinedInputsChecker.innerText = "";
    } else if (testType === "storage") {
      storageInputs.style.display = "block";
      cpuInputsChecker.innerText = "";
      memoryInputsChecker.innerText = "";
      combinedInputsChecker.innerText = "";
    } else if (testType === "combined") {
      combinedInputs.style.display = "block";
      cpuInputsChecker.innerText = "";
      memoryInputsChecker.innerText = "";
      storageInputsChecker.innerText = "";
    }

    clearDownloadLink();
  }

  // Even listener za promena na test_type
  testTypeSelection.addEventListener("change", handleTestTypeChange);
});
