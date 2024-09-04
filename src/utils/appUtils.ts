import DOMPurify from "dompurify";
import showdown from "showdown";
import { htmlToText } from "html-to-text";

//Get plain text from html
export const extractTextFromHtml = (html: string) => {
  const tempDiv = document.createElement("div");

  tempDiv.innerHTML = DOMPurify.sanitize(html);

  const pElements = tempDiv.getElementsByTagName("p");
  let textContent = "";
  Array.from(pElements).forEach((p) => {
    textContent += p.textContent || p.innerText || "";
  });
  return textContent;
};

//Get html from markdown text returned by Gemini
export const convertMarkDownToHtml = (markDownText: string) => {
  const converter = new showdown.Converter();

  const htmlContent = converter.makeHtml(markDownText);

  return htmlContent;
};

export const formatNumber = (num: number) => {
  if (num >= 1000000) {
    // Format number in millions
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    // Format number in thousands
    return (num / 1000).toFixed(1) + "K";
  }
  // return the number as is if less than 1000
  return num;
};

export const setContentToSummarize = (program: any) => {
  const contentArray = [];

  if (program.description) {
    contentArray.push(`Description: ${htmlToText(program.description)}`);
  }

  if (program.features) {
    contentArray.push(`${htmlToText(program.features)}`);
  }

  if (program.highlights) {
    contentArray.push(`${htmlToText(program.highlights)}`);
  }

  if (program.languages) {
    contentArray.push(`Language: ${program.languages}`);
  }

  if (program.technologies) {
    contentArray.push(`Technologies: ${program.technologies}`);
  }

  if (program.frameworks) {
    contentArray.push(`Frameworks: ${program.frameworks}`);
  }

  // Join the array into a single string, with each section separated by a newline
  const content = contentArray.join("\n");

  return content;
};

export const getFormattedDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
export const getStatusColor = (status: string) => {
  if (status === "Not Started") return "blue";
  if (status === "In Progress") return "yellow";
  if (status === "Done") return "green";
  if (status === "Stuck") return "red";
  return "var(--color-text-primary)";
};

export const getPriorityColor = (priority: string) => {
  if (priority === "Low") return "yellowgreen";
  if (priority === "Medium") return "darkorange";
  if (priority === "High") return "#f94449";
  return "var(--color-text-primary)";
};
