import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { LocalNotifications } from "@capacitor/local-notifications";

const safeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9-_]/g, "_");

// Fixed id so the "downloading" notification gets replaced in place by the
// "downloaded"/"failed" one instead of stacking a second notification.
const DOWNLOAD_NOTIFICATION_ID = 991001;

const ensureNotificationPermission = async () => {
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return true;
    const requested = await LocalNotifications.requestPermissions();
    return requested.display === "granted";
  } catch (err) {
    console.log("Notification permission check failed:", err);
    return false;
  }
};

const notifyDownloading = async () => {
  const allowed = await ensureNotificationPermission();
  if (!allowed) return;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DOWNLOAD_NOTIFICATION_ID,
          title: "InstaSevak",
          body: "Downloading invoice...",
          ongoing: true,
          autoCancel: false,
        },
      ],
    });
  } catch (err) {
    console.log("Failed to show downloading notification:", err);
  }
};

const notifyDownloaded = async (fileName: string) => {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DOWNLOAD_NOTIFICATION_ID,
          title: "InstaSevak",
          body: `${fileName} downloaded`,
          ongoing: false,
          autoCancel: true,
        },
      ],
    });
  } catch (err) {
    console.log("Failed to show downloaded notification:", err);
  }
};

const notifyFailed = async () => {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DOWNLOAD_NOTIFICATION_ID,
          title: "InstaSevak",
          body: "Invoice download failed",
          ongoing: false,
          autoCancel: true,
        },
      ],
    });
  } catch (err) {
    console.log("Failed to show failed notification:", err);
  }
};

/**
 * Renders the given DOM element (the on-screen invoice card) into a PDF that
 * is a pixel-accurate replica of what's shown on screen, then saves it and
 * drives a notification-bar entry through the download.
 *
 * Any element inside `element` that should NOT appear in the PDF (e.g. the
 * download button itself) should carry `data-html2canvas-ignore="true"`.
 */
export const generateAndDownloadInvoicePdf = async (
  element: HTMLElement | null,
  invoiceRef: string
) => {
  if (!element) {
    throw new Error("Invoice element not ready");
  }

  await notifyDownloading();

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Size the PDF page to the captured content itself (like a long
    // screenshot/receipt) instead of forcing it into fixed A4 pages. Slicing
    // a tall image into fixed-height pages cuts straight through rows
    // wherever the page boundary lands, which is what was chopping fields
    // like "Business Name" in half. A single page sized to match the image
    // means nothing gets cropped.
    const pdf = new jsPDF({
      unit: "px",
      format: [canvas.width, canvas.height],
      hotfixes: ["px_scaling"],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    const fileName = `${safeFileName(invoiceRef || "invoice")}.pdf`;
    const base64Data = pdf.output("datauristring").split(",")[1];

    const saved = await Filesystem.writeFile({
      path: `invoices/${fileName}`,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true,
    });

    await notifyDownloaded(fileName);

    return {
      uri: saved.uri,
      fileName,
    };
  } catch (err) {
    await notifyFailed();
    throw err;
  }
};