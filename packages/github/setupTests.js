import dotenv from "dotenv";
import fs from "fs";

module.exports = () => {
  dotenv.config();

  if(!process.env.GITHUB_SIGNING_KEY){
    process.env.GITHUB_SIGNING_KEY = fs.readFileSync(`${process.cwd()}\\github.pem`).toString("utf8");
  }
};
