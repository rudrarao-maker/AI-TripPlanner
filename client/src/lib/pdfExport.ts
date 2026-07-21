import html2pdf from 'html2pdf.js';

interface PdfTripData {
  destination: string;
  dates: string;
  budget: string;
  travelers: string;
  travelStyle: string;
  days: any[];
  hotelInfo?: { name: string; rating: number; pricePerNight: number }[];
}

// Generate a styled HTML document for PDF export
function buildPdfHtml(data: PdfTripData): string {
  const now = new Date();
  const generatedDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Calculate total estimated cost
  let totalCost = 0;
  const categoryBreakdown: Record<string, number> = {
    'Accommodation': 0,
    'Activities': 0,
    'Food (est.)': 0,
    'Transport (est.)': 0,
  };

  data.days.forEach(day => {
    const morning = day.morningActivity?.cost || 0;
    const afternoon = day.afternoonActivity?.cost || 0;
    const evening = day.eveningActivity?.cost || 0;
    const hotel = day.hotel?.pricePerNight || 0;

    categoryBreakdown['Activities'] += morning + afternoon + evening;
    categoryBreakdown['Accommodation'] += hotel;
    categoryBreakdown['Food (est.)'] += 1500; // Estimate per day
    categoryBreakdown['Transport (est.)'] += 500; // Estimate per day
  });

  totalCost = Object.values(categoryBreakdown).reduce((s, v) => s + v, 0);

  // Build days HTML
  const daysHtml = data.days.map((day, idx) => {
    const activities = [
      { time: '🌅 Morning', data: day.morningActivity },
      { time: '☀️ Afternoon', data: day.afternoonActivity },
      { time: '🌇 Evening', data: day.eveningActivity },
    ];

    const activitiesHtml = activities.map(({ time, data: act }) => {
      if (!act) return '';
      return `
        <div style="display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="width: 110px; font-size: 11px; font-weight: 600; color: #666; padding-top: 2px;">${time}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; color: #1a1a2e;">${act.title || 'Activity'}</div>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">${act.description || ''}</div>
            <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: #888;">
              ${act.location ? `<span>📍 ${act.location}</span>` : ''}
              ${act.duration ? `<span>⏱️ ${act.duration}</span>` : ''}
              ${act.cost ? `<span>💰 ₹${act.cost.toLocaleString()}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const hotelHtml = day.hotel ? `
      <div style="margin-top: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #6366f1;">
        <div style="font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">🏨 Hotel</div>
        <div style="font-weight: 600; font-size: 14px; color: #1a1a2e; margin-top: 4px;">${day.hotel.name}</div>
        <div style="font-size: 12px; color: #666; margin-top: 2px;">
          ⭐ ${day.hotel.rating} rating • ₹${day.hotel.pricePerNight?.toLocaleString() || 'N/A'}/night
        </div>
      </div>
    ` : '';

    const dateStr = day.date
      ? new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return `
      <div style="page-break-inside: avoid; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px;">
            ${idx + 1}
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 700; color: #1a1a2e;">Day ${idx + 1}${day.title ? ` — ${day.title}` : ''}</div>
            ${dateStr ? `<div style="font-size: 12px; color: #888;">${dateStr}</div>` : ''}
          </div>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: white;">
          ${activitiesHtml}
          ${hotelHtml}
        </div>
      </div>
    `;
  }).join('');

  // Budget breakdown rows
  const budgetRows = Object.entries(categoryBreakdown).map(([cat, amount]) => `
    <tr>
      <td style="padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${cat}</td>
      <td style="padding: 8px 12px; font-size: 13px; text-align: right; font-weight: 600; border-bottom: 1px solid #f0f0f0;">₹${amount.toLocaleString()}</td>
    </tr>
  `).join('');

  // Full HTML document
  return `
    <div style="font-family: 'Segoe UI', -apple-system, sans-serif; color: #1a1a2e; max-width: 800px; margin: 0 auto;">
      
      <!-- Cover Page -->
      <div style="text-align: center; padding: 40px 20px 30px; page-break-after: always;">
        <div style="font-size: 10px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 16px;">
          ✈️ TripCraft AI — Travel Itinerary
        </div>
        <h1 style="font-size: 36px; font-weight: 800; margin: 0; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2;">
          ${data.destination}
        </h1>
        <p style="font-size: 16px; color: #666; margin-top: 12px;">${data.dates}</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 32px; flex-wrap: wrap;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Budget</div>
            <div style="font-size: 20px; font-weight: 700; color: #1a1a2e;">${data.budget}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Travelers</div>
            <div style="font-size: 20px; font-weight: 700; color: #1a1a2e;">${data.travelers}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Days</div>
            <div style="font-size: 20px; font-weight: 700; color: #1a1a2e;">${data.days.length}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Style</div>
            <div style="font-size: 20px; font-weight: 700; color: #1a1a2e;">${data.travelStyle || 'Adventure'}</div>
          </div>
        </div>
        
        <div style="margin-top: 40px; padding: 16px; background: #f8f9fa; border-radius: 12px; font-size: 12px; color: #666;">
          Generated by TripCraft AI on ${generatedDate}<br/>
          <span style="font-size: 11px; color: #999;">tripcraft.ai — Your AI-Powered Travel Companion</span>
        </div>
      </div>

      <!-- Day-by-Day Itinerary -->
      <div style="padding: 0 10px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #6366f1; color: #1a1a2e;">
          📅 Day-by-Day Itinerary
        </h2>
        ${daysHtml}
      </div>

      <!-- Budget Breakdown -->
      <div style="page-break-before: always; padding: 30px 10px 0;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #6366f1; color: #1a1a2e;">
          💰 Budget Breakdown
        </h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px;">Category</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${budgetRows}
            <tr style="background: #f0f0ff;">
              <td style="padding: 10px 12px; font-size: 14px; font-weight: 700; color: #6366f1;">Total Estimated</td>
              <td style="padding: 10px 12px; font-size: 14px; font-weight: 700; text-align: right; color: #6366f1;">₹${totalCost.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <!-- Budget bar chart (CSS only) -->
        <div style="margin-top: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 12px;">Spending Distribution</h3>
          ${Object.entries(categoryBreakdown).map(([cat, amount]) => {
            const pct = totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0;
            const colors: Record<string, string> = { 'Accommodation': '#6366f1', 'Activities': '#ec4899', 'Food (est.)': '#f59e0b', 'Transport (est.)': '#3b82f6' };
            return `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="color: #666;">${cat}</span>
                  <span style="font-weight: 600; color: #333;">${pct}%</span>
                </div>
                <div style="height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
                  <div style="height: 100%; width: ${pct}%; background: ${colors[cat] || '#888'}; border-radius: 4px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999;">
        <p>This itinerary was generated by <strong style="color: #6366f1;">TripCraft AI</strong></p>
        <p>Prices and availability are estimates and may vary. Always confirm bookings directly.</p>
        <p style="margin-top: 8px;">🌍 tripcraft.ai — Plan your dream trip in seconds.</p>
      </div>
    </div>
  `;
}

export async function exportTripToPdf(data: PdfTripData): Promise<void> {
  const htmlContent = buildPdfHtml(data);

  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `TripCraft-${data.destination.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}
