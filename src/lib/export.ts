import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function downloadTripAsPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Temporarily apply print styles if needed
    const originalStyle = element.style.cssText;
    element.style.backgroundColor = "#ffffff";
    element.style.color = "#000000";
    
    // Add a specific class for PDF generation targeting to hide UI elements
    element.classList.add("pdf-exporting");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Restore original styles
    element.style.cssText = originalStyle;
    element.classList.remove("pdf-exporting");

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let position = 0;
    
    // Handle multi-page if the content is longer than A4
    if (pdfHeight > pdf.internal.pageSize.getHeight()) {
      let remainingHeight = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        remainingHeight -= pageHeight;
        position -= pageHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    } else {
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

export function generateICS(tripData: any, filename: string) {
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI TripPlanner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  const formatICSDate = (dateStr: string, timeStr?: string) => {
    try {
      const d = new Date(dateStr);
      if (timeStr && timeStr !== "Flexible") {
         // Parse basic time strings like "10:00 AM"
         const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
         if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3]?.toUpperCase();
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            d.setHours(hours, minutes, 0);
         }
      }
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    } catch {
      return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    }
  };

  const processDays = (days: any[]) => {
    days?.forEach((day: any) => {
      day.activities?.forEach((activity: any) => {
        const dtstart = formatICSDate(day.date, activity.time || activity.startTime);
        // Arbitrary 2 hour duration if no end time
        const endTimeObj = new Date(new Date(dtstart.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z")).getTime() + 2 * 60 * 60 * 1000);
        const dtend = endTimeObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        icsLines.push("BEGIN:VEVENT");
        icsLines.push(`UID:${Math.random().toString(36).substring(2)}@aitripplanner.com`);
        icsLines.push(`DTSTAMP:${formatICSDate(new Date().toISOString())}`);
        icsLines.push(`DTSTART:${dtstart}`);
        icsLines.push(`DTEND:${dtend}`);
        icsLines.push(`SUMMARY:${activity.name || activity.title}`);
        icsLines.push(`DESCRIPTION:${activity.description || ""}`);
        icsLines.push(`LOCATION:${activity.location || ""}`);
        icsLines.push("END:VEVENT");
      });
    });
  };

  if (tripData.destinations && Array.isArray(tripData.destinations)) {
    tripData.destinations.forEach((dest: any) => {
      processDays(dest.days);
    });
  } else {
    processDays(tripData.days);
  }

  icsLines.push("END:VCALENDAR");

  const icsString = icsLines.join("\r\n");
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function syncWithGoogleCalendar(tripData: any) {
  // We create a single multi-day event for the entire trip
  const title = `Trip to ${tripData.destination || tripData.tripSummary?.route || "Unknown Destination"}`;
  
  // Find start and end dates
  let startDateStr = "";
  let endDateStr = "";
  
  if (tripData.days && tripData.days.length > 0) {
    startDateStr = tripData.days[0].date;
    endDateStr = tripData.days[tripData.days.length - 1].date;
  } else if (tripData.destinations && tripData.destinations.length > 0) {
    const firstDest = tripData.destinations[0];
    const lastDest = tripData.destinations[tripData.destinations.length - 1];
    startDateStr = firstDest.days[0].date;
    endDateStr = lastDest.days[lastDest.days.length - 1].date;
  }
  
  if (!startDateStr) {
    console.error("Could not determine trip dates for calendar sync.");
    return;
  }

  // Format dates for Google Calendar (YYYYMMDD)
  const formatForGoogle = (dateString: string) => {
    const d = new Date(dateString);
    return d.toISOString().split("T")[0].replace(/-/g, "");
  };

  const start = formatForGoogle(startDateStr);
  
  // Google Calendar end dates for all-day events are exclusive, so add 1 day
  const endD = new Date(endDateStr || startDateStr);
  endD.setDate(endD.getDate() + 1);
  const end = endD.toISOString().split("T")[0].replace(/-/g, "");

  const details = `Planned with AI Trip Planner.\nCheck out your full itinerary here: ${window.location.href}`;

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", title);
  url.searchParams.append("dates", `${start}/${end}`);
  url.searchParams.append("details", details);
  if (tripData.destination) {
    url.searchParams.append("location", tripData.destination);
  }

  // Open in new tab
  window.open(url.toString(), "_blank");
}

