// Libraries
require("dotenv").config();
const Excel = require("exceljs");

// Database
const db = require("./config").database;

// Models
const qnaModel = require("./models/qna");

// Constants
const CONSTANTS = {
  DATE: "date",
  VERSION: "version",
  JOB_NAME: "qna-etl",
};

async function main() {
  console.time(CONSTANTS.JOB_NAME);

  const arguments = _getArguments();
  const { date, version, fileName } = arguments;

  await db.connect();

  const existingDataWithCurrentDateAndVersion = await qnaModel
    .findOne({
      version,
      date,
    })
    .lean();

  if (existingDataWithCurrentDateAndVersion) {
    console.log(
      `Existing data with following date (${date}) and version (${version}) found. Aborting operation.`
    );
  } else {
    await _readAndTransferData(fileName, version, date);
  }
}

function _getArguments() {
  const arguments = process.argv.slice(2);
  let date;
  let version;

  if (!arguments) {
    throw 'Please pass the date and version argument when running "npm run start -- data=<DATE> version=VERSION"';
  }

  arguments.forEach((arg) => {
    const splitArg = arg.split("=");
    switch (splitArg[0]) {
      case CONSTANTS.DATE:
        date = splitArg[1];
        break;
      case CONSTANTS.VERSION:
        version = splitArg[1];
        break;
    }
  });

  if (!date || !version) {
    throw 'Please proper date and version argument when running "npm run start -- data=<DATE> version=VERSION"';
  }

  return {
    date,
    version,
    fileName: `${date}_v${version}.xlsx`,
  };
}

async function _readAndTransferData(fileName, version, date) {
  const workbook = new Excel.Workbook();
  try {
    const absolutePath = __dirname + "/files/" + fileName;
    await workbook.xlsx.readFile(absolutePath);
  } catch {
    throw `File not found (${fileName})`;
  }

  try {
    const worksheets = [];
    workbook.eachSheet(function (worksheet, sheetId) {
      worksheets.push(worksheet);
    });
    const mainSheet = worksheets[0];
    const imagesObject = _generateImageObject(
      mainSheet.getImages(),
      workbook
    );
    const columnsArray = mainSheet.getRow(1).values;
    const dataToBeInserted = [];

    mainSheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      if (rowNumber == 1) return;
      const columnObject = {
        version,
        date,
        data: {},
      };

      row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
        let value = cell.value;
        if (imagesObject[`${rowNumber}_${colNumber}`]) {
          value = imagesObject[`${rowNumber}_${colNumber}`];
        }
        const formattedColumnName = convertStringToSnakeCase(
          columnsArray[colNumber]
        );
        columnObject.data[formattedColumnName] = value;
      });

      dataToBeInserted.push(columnObject);
    });
    await qnaModel.insertMany(dataToBeInserted);
  } catch (error) {
    throw `Excel File Error: ${error}`;
  }
}

function convertStringToSnakeCase(string) {
  return String(string).trim().split(" ").join("_").toLowerCase();
}

function _generateImageObject(images, workbook) {
  const object = {};
  images.forEach((image) => {
    const {
      range: {
        tl: { nativeCol, nativeRow },
      },
      imageId,
    } = image;
    const { name, extension, buffer } = workbook.model.media.find(
      (m) => m.index === imageId
    );
    object[`${nativeRow}_${nativeCol}`] = {
      name,
      extension,
      buffer,
    };
  });

  return object;
}

main()
  .then(() => {
    console.log("Operation completed successfully");
    console.timeEnd(CONSTANTS.JOB_NAME);
    process.exit();
  })
  .catch((error) => {
    console.error("An error has occured: ", error);
    console.timeEnd(CONSTANTS.JOB_NAME);
    process.exit();
  });
