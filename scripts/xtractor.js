import axios from "axios";
import * as cheerio from "cheerio";

async function getStudentReceipt(ref) {
  const url = `https://apis.backend.mouau.edu.ng/api/printable-receipt?transaction_ref=${ref}`;

  const { data } = await axios.get(url);

  const $ = cheerio.load(data);

  const getText = (label) => {
    const th = $(`th:contains("${label}")`).first();
    return th.next("td").text().trim();
  };

  const result = {
    name: getText("NAME"),
    college: getText("COLLEGE"),
    department: getText("DEPARTMENT"),
    matricNo: getText("MATRIC NO"),
    level: getText("LEVEL"),
    session: getText("SESSION"),
    receiptNo: getText("Portal Issued Receipt Number"),
  };

  return result;
}

// Example usage
getStudentReceipt("8987874736744").then(console.log);