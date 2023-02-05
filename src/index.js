import axios from "axios";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { Parser } from "@json2csv/plainjs";

export const handler = async (event, context) => {
  try {
    let url = "https://dummyjson.com/products";

    if (event?.id) {
      url = `https://dummyjson.com/products/${event?.id}`;
    }

    const response = await axios.get(url);

    const data = convertToCsv(response?.data?.products);

    await saveFile(data);

    return {
        message: "Success"
    }
  } catch (error) {
    console.error(error);
  }
};

const saveFile = async (data) => {
  try {
    await fs.writeFile(
      `/tmp/output-${randomUUID()}.csv`,
      data,
      "utf-8"
    );

    console.log("Done");
  } catch (error) {
    console.error(error);
  }
};

const convertToCsv = (data) => {
  try {
    const parser = new Parser({
        delimiter: ";"
    });
    
    const csv = parser.parse(data);

    return csv;
  } catch (error) {
    console.error(error);
  }
};
