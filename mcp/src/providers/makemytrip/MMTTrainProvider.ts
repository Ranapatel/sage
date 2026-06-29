import { ITrainProvider } from '../interfaces/ITrainProvider';
import { SearchTrainsInput, StationInfo, TrainResult, TrainClass, ClassAvailability } from '../../types/trains';
import { TrainUrlBuilder } from '../../services/trainUrlBuilder';
import { StationCodeResolver } from '../../services/stationResolver';

/**
 * MakeMyTrip Train Provider.
 * Integrates live search calling the ERAIL API.
 */
export class MMTTrainProvider implements ITrainProvider {
  public readonly name = 'MakeMyTrip';

  /**
   * Generates the MakeMyTrip deep link search URL.
   */
  public buildSearchUrl(
    params: SearchTrainsInput,
    origin: StationInfo,
    destination: StationInfo,
  ): string {
    return TrainUrlBuilder.buildMMTTrainUrl({
      originCode: origin.code,
      destinationCode: destination.code,
      travelDate: params.travelDate,
      passengers: params.passengers || 1,
      trainClass: params.preferredClass || '3A',
    });
  }

  /**
   * Performs live lookup calling the ERAIL public API and parsing its response.
   */
  public async search(params: SearchTrainsInput): Promise<TrainResult[]> {
    try {
      const origin = await StationCodeResolver.resolve(params.originStation);
      const destination = await StationCodeResolver.resolve(params.destinationStation);
      
      const erailUrl = `https://erail.in/rail/getTrains.aspx?Station_From=${origin.code}&Station_To=${destination.code}&DataSource=0&ApiVer=1&UserId=2`;
      
      const response = await fetch(erailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`ERAIL API failed with status ${response.status}`);
      }
      
      const raw = await response.text();
      return this.parseERailResponse(raw, origin.code, destination.code, params);
    } catch (e) {
      console.warn('[MMTTrainProvider] ERAIL lookup failed:', e);
      return [];
    }
  }

  private parseERailResponse(
    raw: string, 
    originCode: string, 
    destinationCode: string, 
    params: SearchTrainsInput
  ): TrainResult[] {
    if (!raw || raw.trim().length === 0) return [];
    
    const trainsRaw = raw.split('^');
    const results: TrainResult[] = [];

    // The first item (index 0) is the header info: ~NDLS~New Delhi...
    for (let idx = 1; idx < trainsRaw.length; idx++) {
      const trainStr = trainsRaw[idx];
      if (!trainStr || trainStr.trim().length === 0) continue;
      
      const parts = trainStr.split('~');
      if (parts.length < 15) continue;

      const trainNumber = parts[0];
      const trainName = parts[1];
      const departure = (parts[10] || '').replace('.', ':');
      const arrival = (parts[11] || '').replace('.', ':');
      
      // Parse duration: e.g., "18.20" -> "18h 20m"
      const durationRaw = parts[12] || '';
      const durParts = durationRaw.split('.');
      const duration = durParts.length === 2 ? `${durParts[0]}h ${durParts[1]}m` : `${durationRaw}h`;

      // runsOn parsing (Sunday to Saturday)
      const runsOnDays: string[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const runsOnStr = parts[13] || '';
      for (let i = 0; i < runsOnStr.length; i++) {
        if (runsOnStr[i] === '1' && dayNames[i]) {
          runsOnDays.push(dayNames[i]);
        }
      }

      // Parse fares from parts[41]
      const fares: number[] = [];
      const fareStr = parts[41] || '';
      const fareGroups = fareStr.split(':');
      fareGroups.forEach((group, fIdx) => {
        // Skip header fields and index 4 (base fare group for 2A)
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

      const getFareForClass = (clsCode: string): number | undefined => {
        if (sortedFares.length === 0) return undefined;
        if (clsCode === '2S' || clsCode === 'CC') return sortedFares[0];
        if (clsCode === 'SL') return sortedFares[1] || sortedFares[0];
        if (clsCode === '3E' || clsCode === '3A') return sortedFares[2] || sortedFares[1] || sortedFares[0];
        if (clsCode === '2A') return sortedFares[3] || sortedFares[2] || sortedFares[1] || sortedFares[0];
        if (clsCode === '1A') return sortedFares[4] || sortedFares[3] || sortedFares[2] || sortedFares[1] || sortedFares[0];
        return undefined;
      };

      // Available classes parsing from parts[62]
      const availableClasses: ClassAvailability[] = [];
      const classesRaw = (parts[62] || '').split('|');
      for (const clsRaw of classesRaw) {
        if (!clsRaw) continue;
        const clsParts = clsRaw.split(':');
        const classCode = clsParts[0] as TrainClass;
        if (!classCode) continue;

        const availableVal = parseInt(clsParts[1], 10);
        const wlVal = parseInt(clsParts[2], 10);
        const racVal = parseInt(clsParts[4], 10);

        let available = false;
        let availability = 'NOT AVAILABLE';

        if (!isNaN(availableVal) && availableVal > 0) {
          available = true;
          availability = 'AVAILABLE';
        } else if (!isNaN(wlVal) && wlVal > 0) {
          available = false;
          availability = 'WL';
        } else if (!isNaN(racVal) && racVal > 0) {
          available = true;
          availability = 'RAC';
        }

        const price = getFareForClass(classCode);

        availableClasses.push({
          class: classCode,
          className: this.getClassName(classCode),
          available,
          price,
          availability,
        });
      }

      const bookingUrl = TrainUrlBuilder.buildMMTTrainUrl({
        originCode,
        destinationCode,
        travelDate: params.travelDate,
        passengers: params.passengers || 1,
        trainClass: params.preferredClass || '3A',
      });

      results.push({
        trainNumber,
        trainName,
        departure,
        arrival,
        duration,
        runsOn: runsOnDays,
        availableClasses,
        bookingUrl,
      });
    }

    return results;
  }

  private getClassName(c: string): string {
    switch (c) {
      case 'SL': return 'Sleeper Class';
      case '3A': return 'AC 3 Tier';
      case '2A': return 'AC 2 Tier';
      case '1A': return 'AC First Class';
      case 'CC': return 'Chair Car';
      case 'EC': return 'Executive Chair Car';
      case '3E': return 'AC 3 Tier Economy';
      default: return c;
    }
  }
}
