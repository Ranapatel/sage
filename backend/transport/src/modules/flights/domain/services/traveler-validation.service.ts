import { Injectable, BadRequestException } from '@nestjs/common';
import { TravelerDetails } from '../../infrastructure/travelport/adapters/travelport-workbench.adapter';

@Injectable()
export class TravelerValidationService {

  /**
   * Validates Traveler Details prior to injecting into Travelport Workbench
   */
  validateTraveler(traveler: TravelerDetails, departureDate: string): void {
    if (!traveler.givenName || traveler.givenName.trim().length < 1) {
      throw new BadRequestException('Traveler givenName is mandatory');
    }

    if (!traveler.surname || traveler.surname.trim().length < 1) {
      throw new BadRequestException('Traveler surname is mandatory');
    }

    if (!['M', 'F', 'Undisclosed'].includes(traveler.gender)) {
      throw new BadRequestException('Invalid traveler gender (M/F/Undisclosed required)');
    }

    // Validate Passenger Type vs Age
    const depDate = new Date(departureDate);
    const dob = new Date(traveler.birthDate);
    if (isNaN(dob.getTime())) {
      throw new BadRequestException(`Invalid date of birth: ${traveler.birthDate}`);
    }

    const ageInYears = (depDate.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (traveler.passengerTypeCode === 'ADT' && ageInYears < 12) {
      throw new BadRequestException(`Adult passenger ${traveler.givenName} must be at least 12 years old`);
    }

    if (traveler.passengerTypeCode === 'CNN' && (ageInYears < 2 || ageInYears >= 12)) {
      throw new BadRequestException(`Child passenger ${traveler.givenName} must be between 2 and 11 years old`);
    }

    if (traveler.passengerTypeCode === 'INF' && ageInYears >= 2) {
      throw new BadRequestException(`Infant passenger ${traveler.givenName} must be under 2 years old`);
    }

    // Validate Passport 6-month validity for international flights
    if (traveler.passportNumber) {
      if (!traveler.passportExpiration) {
        throw new BadRequestException('Passport expiration date is mandatory when passport is provided');
      }

      const passportExp = new Date(traveler.passportExpiration);
      const sixMonthsAfterDep = new Date(depDate);
      sixMonthsAfterDep.setMonth(sixMonthsAfterDep.getMonth() + 6);

      if (passportExp < sixMonthsAfterDep) {
        throw new BadRequestException(
          `Passport for ${traveler.givenName} expires before 6 months from departure date (${traveler.passportExpiration})`,
        );
      }
    }
  }
}
