import { Injectable } from '@nestjs/common';
import { TrainResult, TrainClass } from '../../types/transport';

@Injectable()
export class MMTTrainScraper {
  /**
   * Scrapes live train schedules and availability from eRail API.
   */
  async scrape(
    originCode: string,
    destCode: string,
    date: string,
  ): Promise<TrainResult[]> {
    try {
      const erailUrl = `https://erail.in/rail/getTrains.aspx?Station_From=${originCode}&Station_To=${destCode}&DataSource=0&ApiVer=1&UserId=2`;
      const response = await fetch(erailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`eRail API status ${response.status}`);
      }
      const raw = await response.text();
      return this.parseERailResponse(raw, originCode, destCode);
    } catch (err) {
      console.warn('[MMTTrainScraper] ERAIL scrape failed:', err);
      return [];
    }
  }

  private parseERailResponse(raw: string, originCode: string, destCode: string): TrainResult[] {
    if (!raw || raw.trim().length === 0) return [];
    
    const trainsRaw = raw.split('^');
    const results: TrainResult[] = [];

    // Index 0 is the header info: ~NDLS~New Delhi...
    for (let idx = 1; idx < trainsRaw.length; idx++) {
      const trainStr = trainsRaw[idx];
      if (!trainStr || trainStr.trim().length === 0) continue;
      
      const parts = trainStr.split('~');
      if (parts.length < 15) continue;

      const trainNumber = parts[0];
      const trainName = parts[1];
      const originName = parts[6] || parts[2] || '';
      const destName = parts[8] || parts[4] || '';
      const departureTime = (parts[10] || '').replace('.', ':');
      const arrivalTime = (parts[11] || '').replace('.', ':');
      
      // Parse duration: e.g. "18.20" -> "18h 20m"
      const durationRaw = parts[12] || '';
      const durParts = durationRaw.split('.');
      const duration = durParts.length === 2 ? `${durParts[0]}h ${durParts[1]}m` : `${durationRaw}h`;
      
      const trainType = parts[32] || 'EXPRESS';

      // Parse fares from parts[41]
      const fares: number[] = [];
      const fareStr = parts[41] || '';
      const fareGroups = fareStr.split(':');
      fareGroups.forEach((group, fIdx) => {
        if (fIdx < 2 || fIdx === 4) return;
        const match = group.match(/^(\d+),/);
        if (match) {
          const val = parseInt(match[1], 10);
          if (val > 0 && !fares.includes(val)) {
            fares.push(val);
          }
        }
      });
      const sortedFares = [...fares].sort((a, b) => a - b);

      const getFareForClass = (clsCode: string): number => {
        if (sortedFares.length === 0) return 0;
        let val = 0;
        if (clsCode === '2S' || clsCode === 'CC') val = sortedFares[0];
        else if (clsCode === 'SL') val = sortedFares[1] || sortedFares[0];
        else if (clsCode === '3E' || clsCode === '3A') val = sortedFares[2] || sortedFares[1] || sortedFares[0];
        else if (clsCode === '2A') val = sortedFares[3] || sortedFares[2] || sortedFares[1] || sortedFares[0];
        else if (clsCode === '1A') val = sortedFares[4] || sortedFares[3] || sortedFares[2] || sortedFares[1] || sortedFares[0];
        return val || 0;
      };

      // Available classes parsing from parts[62]
      const classesRaw = (parts[62] || '').split('|');
      for (const clsRaw of classesRaw) {
        if (!clsRaw) continue;
        const clsParts = clsRaw.split(':');
        const classCode = clsParts[0] as TrainClass;
        if (!classCode) continue;

        // Skip non-standard classes
        if (!['SL', '3A', '2A', '1A', 'CC', 'EC'].includes(classCode)) continue;

        const price = getFareForClass(classCode);
        const id = `${trainNumber}-${classCode}`;

        results.push({
          id,
          trainName,
          trainNumber,
          originStation: originName,
          originCode: parts[7] || originCode,
          destinationStation: destName,
          destinationCode: parts[9] || destCode,
          departureTime,
          arrivalTime,
          duration,
          price,
          travelClass: classCode,
          trainType,
        });
      }
    }

    return results;
  }
}
