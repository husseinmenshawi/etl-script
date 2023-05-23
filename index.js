require("dotenv").config();
const db = require("./config").database;
const qnaModel = require("./models/qna");
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

  console.log("begin transferring data");
  const existingDataWithCurrentDateAndVersion = await qnaModel.findOne({
    fileName,
  });

  if (existingDataWithCurrentDateAndVersion) {
    console.log(
      `Existing data with following date (${date}) and version ${version} found. Aborting operation.`
    );
  }

  return;
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

main()
  .then(() => {
    console.log("Operation completed successfully");
    console.timeEnd(CONSTANTS.JOB_NAME);
    process.exit();
  })
  .catch((error) => {
    console.error("An error has occured: ", error);
  });
