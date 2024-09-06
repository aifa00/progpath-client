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

export const getTheme = () => {
  return localStorage.getItem("theme") || "dark";
};

export function setTheme(theme: string) {
  const root = document.documentElement;
  const themeColors: any = {
    light: {
      "--color-body": "#ffffff",
      "--color-primary": "#ffffff",
      "--color-secondary": "#ffffff",
      "--color-tertiary": "#f1f0f0",
      "--color-blue": "#1859ff",
      "--color-violet": "rgb(165, 126, 165)",
      "--color-hover-violet": "rgb(128, 82, 128)",
      "--color-bg-gray": "rgba(202, 202, 202, 0.263)",
      "--color-hover-gray": "rgba(168, 167, 167, 0.368)",
      "--color-success": "#23bf48",
      "--color-error": "#ef4253",
      "--color-warning": "#ffc107",
      "--color-text-primary": "#000000",
      "--color-text-secondary": "#545454",
    },
    dark: {
      "--color-body": "#0c0b11",
      "--color-primary": "#000000",
      "--color-secondary": "#0c0b11",
      "--color-tertiary": "#1a1a1a",
      "--color-blue": "#1859ff",
      "--color-violet": "rgb(148, 102, 148)",
      "--color-hover-violet": "rgb(128, 82, 128)",
      "--color-bg-gray": "rgba(55, 55, 55, 0.263)",
      "--color-hover-gray": "rgba(93, 93, 93, 0.368)",
      "--color-success": "#23bf48",
      "--color-error": "#bc1324",
      "--color-warning": "#ffc107",
      "--color-text-primary": "#bebebe",
      "--color-text-secondary": "#8a8a8a",
    },
  };

  // Update colors
  for (const key in themeColors[theme]) {
    root.style.setProperty(key, themeColors[theme][key]);
  }

  localStorage.setItem("theme", theme);
}
