## Description

## Prerequisites

1. Installation of Node
1. Installation of Git
1. Ensure the database that is reference in the `MONGO_DB_URL` environment variable is already created on MongoDB.

## Project Setup

1. Open `.env.example` file
1. Copy the content of the file
1. Create a new file called `.env`
1. Paste the content in the new file
1. Run the following command `npm install`

## Project Start Up

1. Ensure target excel file is in the project directory in the `./files` folder with the following naming convention `YYYY-MM-DD_v<VERSION>.xlsx`. Example: `2023-04-02_v2.xlsx`
1. Run the following command `npm run start -- date=<DATE> version=<VERSION>`

Do note that passing a different date and version could create duplicate values in the database.
