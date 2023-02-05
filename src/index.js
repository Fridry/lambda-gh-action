import axios from "axios";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { Parser } from "@json2csv/plainjs";
import AWS from "aws-sdk";

AWS.config.update({region: 'us-west-1'});

const s3 = new AWS.S3({ apiVersion: "latest" });

export const handler = async (event, context) => {
  try {
    const filename = `output-${randomUUID()}.csv`

    let url = "https://dummyjson.com/products";

    if (event?.id) {
      url = `https://dummyjson.com/products/${event?.id}`;
    }

    const response = await axios.get(url);

    const data = convertToCsv(response?.data?.products);

    await saveFile(data, filename);

    await uploadFileOnS3(filename);

    return {
      message: "Success",
    };
  } catch (error) {
    console.error(error);
  }
};

const saveFile = async (data, filename) => {
  try {
    await fs.writeFile(`/tmp/${filename}`, data, "utf-8");

    console.log("Done");
  } catch (error) {
    console.error(error);
  }
};

const convertToCsv = (data) => {
  try {
    const parser = new Parser({
      delimiter: ";",
    });

    const csv = parser.parse(data);

    return csv;
  } catch (error) {
    console.error(error);
  }
};

const uploadFileOnS3 = async (fileName) => {
  const fileContent = await fs.readFile(`/tmp/${fileName}`);

  const params = {
    Bucket: "aws-s3-bucket-tutorials",
    Key: fileName,
    Body: fileContent,
    ContentType: 'text/csv'
  };

  try {
    const response = await s3.upload(params).promise();

    console.log("Response: ", response);

    return response;
  } catch (error) {
    console.error(error);
  }
};

handler().then(data => data).catch(error => console.error(error))